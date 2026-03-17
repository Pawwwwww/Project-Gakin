// ═══════════════════════════════════════════════════════════════
//  AUTH SERVICE
//  Logika login user dan admin
// ═══════════════════════════════════════════════════════════════

import { ADMIN_ACCOUNTS } from "../entities/admin";
import { findUserByNIK, seedDummyUser } from "./StorageService";

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

  const found = findUserByNIK(nikVal);
  if (!found) {
    return { success: false, error: { type: "not_registered", message: "NIK yang Anda masukkan belum terdaftar." } };
  }

  // Set session
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userNIK", nikVal);
  localStorage.setItem("role", "user");
  localStorage.setItem("userName", found.fullName || "");

  return { success: true };
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

  const found = ADMIN_ACCOUNTS.find(
    (acc) => acc.username === userLower && acc.password === password
  );

  if (!found) {
    return { success: false, error: { type: "admin_error", message: "Username atau Password admin salah!" } };
  }

  // Set session
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("role", found.role);
  localStorage.setItem("adminName", found.name);
  if (found.kecamatan) {
    localStorage.setItem("adminKecamatan", found.kecamatan);
  } else {
    localStorage.removeItem("adminKecamatan");
  }

  return { success: true, isDefaultPassword: password === "admin" };
}
