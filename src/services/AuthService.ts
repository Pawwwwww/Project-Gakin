// ═══════════════════════════════════════════════════════════════
//  AUTH SERVICE
//  Logika login user dan admin
// ═══════════════════════════════════════════════════════════════

import { ADMIN_ACCOUNTS } from "../entities/admin";
import { findUserByNIK, seedDummyUser, saveUser } from "./StorageService";
import { MOCK_DINSOS_DB } from "../data/dinsos";

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

  let found = findUserByNIK(nikVal);
  if (!found) {
    const dinsosHit = MOCK_DINSOS_DB.find((d) => d.nik === nikVal);
    if (dinsosHit) {
      // Auto-register GAKIN user
      const newUser = {
        nik: dinsosHit.nik,
        fullName: dinsosHit.fullName,
        jenisKelamin: "",
        tempatLahir: dinsosHit.tempatLahir,
        tanggalLahir: dinsosHit.tanggalLahir,
        phone: "",
        alamatKtp: "", rtKtp: "", rwKtp: "", kelurahanKtp: "", kecamatanKtp: "", kotaKtp: "Surabaya", provinsiKtp: "Jawa Timur", kodePosKtp: "",
        alamatDomisili: "", rtDomisili: "", rwDomisili: "", kelurahanDomisili: "", kecamatanDomisili: "", kotaDomisili: "Surabaya", provinsiDomisili: "Jawa Timur", kodePosDomisili: "",
        pendidikan: "", agama: "", suku: "", punyaUsaha: "tidak" as const, bidangUsaha: "", punyaKeahlian: "tidak" as const, keahlian: "",
        penghasilanPerHari: "", lamaBerusaha: "", gantiUsaha: "", bidangUsahaLainnya: "",
        domisiliSama: true,
        gakinStatus: "GAKIN" as const
      };
      saveUser(newUser);
      found = newUser;
    } else {
      return { success: false, error: { type: "not_registered", message: "NIK yang Anda masukkan belum terdaftar." } };
    }
  }

  // Set session
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

  // Is default password? (only if it matches the hardcoded one and no override is present)
  const isDefault = !overriddenPasswords[userLower] && password === found.password;

  return { success: true, isDefaultPassword: isDefault };
}
