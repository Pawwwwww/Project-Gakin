// ═══════════════════════════════════════════════════════════════
//  AUTH SERVICE
//  Logika login user dan admin
//
//  ALUR AUTENTIKASI:
//  ┌─────────────────────────────────────────────────────────────┐
//  │ LOGIN (NIK):                                               │
//  │  1. Cek localStorage → user sudah terdaftar? → LOGIN OK    │
//  │  2. Cek MOCK_USERS (GAKIN) → auto-register → LOGIN OK      │
//  │  3. Cek MOCK_USERS (Non-GAKIN) → suruh DAFTAR dulu         │
//  │  4. Tidak ditemukan → NIK tidak valid                       │
//  │                                                             │
//  │ REGISTER:                                                   │
//  │  1. Sudah di localStorage? → tolak (sudah terdaftar)        │
//  │  2. GAKIN di Dinsos? → tolak, suruh LOGIN langsung          │
//  │  3. Ada di Dispendukcapil? → isi otomatis, daftar Non-GAKIN │
//  │  4. Tidak ditemukan → tolak (NIK tidak valid)               │
//  └─────────────────────────────────────────────────────────────┘
// ═══════════════════════════════════════════════════════════════

import { ADMIN_ACCOUNTS } from "../entities/admin";
import { findUserByNIK, seedDummyUser, saveUser } from "./StorageService";
import { MOCK_DINSOS_DB } from "../data/dinsos";
import { MOCK_DISPENDUK_DB } from "../data/dispendukcapil";
import { MOCK_USERS } from "../data/mockData";

export interface AuthResult {
  success: boolean;
  error?: { type: string; message: string };
  isDefaultPassword?: boolean;
}

// ── Login User (via NIK) ──────────────────────────────────────────────
export function loginUser(nik: string): AuthResult {
  seedDummyUser();

  const nikVal = nik.trim();

  if (!/^\d+$/.test(nikVal)) {
    return { success: false, error: { type: "not_number", message: "NIK wajib berisi angka saja." } };
  }

  if (nikVal.length !== 16) {
    return { success: false, error: { type: "length", message: "NIK wajib 16 angka." } };
  }

  // ── STEP 1: Cek user sudah terdaftar di localStorage (GAKIN atau Non-GAKIN) ──
  let found = findUserByNIK(nikVal);

  if (!found) {
    // ── STEP 2: Cek MOCK_USERS — apakah NIK ada di data hardcoded? ──
    const mockHit = MOCK_USERS.find(u => u.nik === nikVal);

    if (mockHit) {
      if (mockHit.gakinStatus === "GAKIN") {
        // GAKIN → auto-register & langsung login
        saveUser(mockHit);
        found = mockHit;
      } else {
        // Non-GAKIN ada di database kependudukan tapi belum daftar mandiri
        return {
          success: false,
          error: {
            type: "not_registered",
            message: "NIK ditemukan di data kependudukan. Silakan daftar terlebih dahulu sebelum login."
          }
        };
      }
    } else {
      // ── STEP 3: Cek Dinsos (GAKIN dari data Dinas Sosial) ──
      const dinsosHit = MOCK_DINSOS_DB.find((d) => d.nik === nikVal);
      if (dinsosHit) {
        const newUser = { ...dinsosHit, domisiliSama: true, gakinStatus: "GAKIN" as const };
        delete (newUser as any).status;
        saveUser(newUser);
        found = newUser;
      } else {
        // ── STEP 4: Cek Dispendukcapil (semua warga) ──
        const dispendukHit = MOCK_DISPENDUK_DB.find((d) => d.nik === nikVal);
        if (dispendukHit) {
          return {
            success: false,
            error: {
              type: "not_registered",
              message: "NIK ditemukan di data kependudukan. Silakan daftar terlebih dahulu sebelum login."
            }
          };
        } else {
          return {
            success: false,
            error: {
              type: "not_found",
              message: "NIK tidak ditemukan dalam database kependudukan."
            }
          };
        }
      }
    }
  }

  // ── Login berhasil → set session ──
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userNIK", nikVal);
  localStorage.setItem("role", "user");
  localStorage.setItem("userName", found?.fullName || "");

  return { success: true };
}

// ── Bantuan Update Password Admin ─────────────────────────────────────
export function changeAdminPassword(username: string, newPassword: string): void {
  const userLower = username.trim().toLowerCase();
  let overriddenPasswords: Record<string, string> = {};
  try {
    overriddenPasswords = JSON.parse(localStorage.getItem("admin_passwords") || "{}");
  } catch (e) {}
  
  overriddenPasswords[userLower] = newPassword;
  localStorage.setItem("admin_passwords", JSON.stringify(overriddenPasswords));
}

export function getCurrentAdminUsername(): string {
  return localStorage.getItem("currentAdminUsername") || "admin.web";
}

// ── Login Admin (via username + password) ─────────────────────────────
export function loginAdmin(username: string, password: string): AuthResult {
  const userLower = username.trim().toLowerCase();

  if (!userLower && !password) {
    return { success: false, error: { type: "admin_empty_both", message: "Silakan isi Username dan Password." } };
  }
  if (!userLower) {
    return { success: false, error: { type: "admin_empty_user", message: "Silakan isi Username." } };
  }
  if (!password) {
    return { success: false, error: { type: "admin_empty_pass", message: "Silakan isi Password." } };
  }

  const found = ADMIN_ACCOUNTS.find((acc) => acc.username === userLower);

  if (!found) {
    return { success: false, error: { type: "admin_error", message: "Username admin tidak terdaftar!" } };
  }

  // Load overridden passwords
  let overriddenPasswords: Record<string, string> = {};
  try {
    overriddenPasswords = JSON.parse(localStorage.getItem("admin_passwords") || "{}");
  } catch (e) {}

  const expectedPassword = overriddenPasswords[userLower] || found.password;

  if (password !== expectedPassword) {
    return { success: false, error: { type: "admin_error", message: "Password admin salah!" } };
  }

  // Set session
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("role", found.role);
  localStorage.setItem("adminName", found.name);
  localStorage.setItem("currentAdminUsername", found.username);
  if (found.kecamatan) {
    localStorage.setItem("adminKecamatan", found.kecamatan);
  } else {
    localStorage.removeItem("adminKecamatan");
  }

  // OPD-specific session
  if (found.opdNama) {
    localStorage.setItem("opdNama", found.opdNama);
  } else {
    localStorage.removeItem("opdNama");
  }
  if (found.opdKlasters) {
    localStorage.setItem("opdKlasters", JSON.stringify(found.opdKlasters));
  } else {
    localStorage.removeItem("opdKlasters");
  }

  // Is default password? (only if it matches the hardcoded one and no override is present)
  const isDefault = !overriddenPasswords[userLower] && password === found.password;

  return { success: true, isDefaultPassword: isDefault };
}
