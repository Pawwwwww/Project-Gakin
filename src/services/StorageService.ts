// ═══════════════════════════════════════════════════════════════
//  STORAGE SERVICE
//  Abstraksi semua operasi localStorage
//  User data, session, kuesioner results
// ═══════════════════════════════════════════════════════════════

import type { KuesionerData } from "../entities/respondent";
import { GRIT_QUESTIONS, KWU_ITEMS, TIPI_QUESTIONS } from "../entities/respondent";

// ── Tipe data user ────────────────────────────────────────────────────
export interface UserRecord {
  nik: string;
  fullName: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  phone: string;
  // Alamat KTP
  alamatKtp: string;
  rtKtp: string;
  rwKtp: string;
  kelurahanKtp: string;
  kecamatanKtp: string;
  kotaKtp: string;
  provinsiKtp: string;
  kodePosKtp: string;
  isSurabaya?: boolean;
  // Informasi Tambahan
  pendidikan: string;
  agama: string;
  suku: string;
  // Bidang Usaha
  punyaUsaha: string;
  bidangUsaha: string;
  bidangUsahaLainnya?: string;
  penghasilanPerHari: string;
  lamaBerusaha: string;
  gantiUsaha: string;
  // GAKIN status
  gakinStatus?: "GAKIN" | "Non-GAKIN";
}

export interface KuesionerSubmission {
  nik: string;
  nama: string;
  tanggal: string;
  data: KuesionerData;
}

// ── Kunci localStorage ────────────────────────────────────────────────
const KEYS = {
  IS_LOGGED_IN:   "isLoggedIn",
  ROLE:           "role",
  USER_NIK:       "userNIK",
  USER_NAME:      "userName",
  ADMIN_NAME:     "adminName",
  ADMIN_KECAMATAN: "adminKecamatan",
  USERS:          "users",
  KUESIONER_DONE: (nik: string) => `kuesioner_done_${nik}`,
  KUESIONER_ALL:  "kuesioner_results",   // ← admin-readable aggregate
} as const;

// ── Session helpers ───────────────────────────────────────────────────
export function isLoggedIn(): boolean {
  return localStorage.getItem(KEYS.IS_LOGGED_IN) === "true";
}

export function getCurrentRole(): string {
  return localStorage.getItem(KEYS.ROLE) || "";
}

export function getCurrentUserNIK(): string {
  return localStorage.getItem(KEYS.USER_NIK) || "";
}

export function getCurrentUserName(): string {
  return localStorage.getItem(KEYS.USER_NAME) || "";
}

export function logout(): void {
  localStorage.removeItem(KEYS.IS_LOGGED_IN);
  localStorage.removeItem(KEYS.ROLE);
  localStorage.removeItem(KEYS.USER_NIK);
  localStorage.removeItem(KEYS.USER_NAME);
  localStorage.removeItem(KEYS.ADMIN_NAME);
  localStorage.removeItem(KEYS.ADMIN_KECAMATAN);
  localStorage.removeItem("opdNama");
  localStorage.removeItem("opdKlasters");
}

// ── User CRUD ─────────────────────────────────────────────────────────
export function getUsers(): UserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  } catch {
    return [];
  }
}

export function findUserByNIK(nik: string): UserRecord | undefined {
  return getUsers().find((u) => u.nik === nik);
}

export function saveUser(user: UserRecord): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.nik === user.nik);
  if (idx === -1) {
    users.push(user);
  } else {
    users[idx] = user;
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  // Notify all listeners (same-tab and cross-tab) of data change
  window.dispatchEvent(new StorageEvent("storage", { key: "users" }));
}

export function updateUser(nik: string, partial: Partial<UserRecord>): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.nik === nik);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...partial };
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    // Notify all listeners (same-tab and cross-tab) of data change
    window.dispatchEvent(new StorageEvent("storage", { key: "users" }));
    // Sinkronkan nama ke session HANYA jika yang diperbarui adalah user yang sedang login
    const currentNik = localStorage.getItem(KEYS.USER_NIK);
    if (partial.fullName && currentNik === nik) {
      localStorage.setItem(KEYS.USER_NAME, partial.fullName);
    }
  }
}

export function deleteUser(nik: string): void {
  const users = getUsers().filter((u) => u.nik !== nik);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  // Notify all listeners (same-tab and cross-tab) of data change
  window.dispatchEvent(new StorageEvent("storage", { key: "users" }));
}

// ── Kuesioner ─────────────────────────────────────────────────────────

/** Ambil hasil kuesioner untuk user tertentu */
export function getKuesionerResult(nik: string): KuesionerSubmission | null {
  try {
    const raw = localStorage.getItem(KEYS.KUESIONER_DONE(nik));
    if (!raw) return null;
    return JSON.parse(raw) as KuesionerSubmission;
  } catch {
    return null;
  }
}

/**
 * Simpan hasil kuesioner.
 *  - Menyimpan ke key per-user: kuesioner_done_{nik}
 *  - Juga memperbarui aggregate kuesioner_results (dibaca admin)
 */
export function saveKuesionerResult(nik: string, data: KuesionerData): void {
  const user = findUserByNIK(nik);
  const submission: KuesionerSubmission = {
    nik,
    nama: user?.fullName || localStorage.getItem(KEYS.USER_NAME) || "",
    tanggal: new Date().toISOString(),
    data,
  };

  // Per-user
  localStorage.setItem(KEYS.KUESIONER_DONE(nik), JSON.stringify(submission));

  // Aggregate (admin-readable)
  try {
    const all: KuesionerSubmission[] = JSON.parse(
      localStorage.getItem(KEYS.KUESIONER_ALL) || "[]"
    );
    const idx = all.findIndex((s) => s.nik === nik);
    if (idx === -1) {
      all.push(submission);
    } else {
      all[idx] = submission;
    }
    localStorage.setItem(KEYS.KUESIONER_ALL, JSON.stringify(all));
  } catch {
    localStorage.setItem(KEYS.KUESIONER_ALL, JSON.stringify([submission]));
  }
}

/** Ambil semua hasil kuesioner (admin) */
export function getAllKuesionerResults(): KuesionerSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.KUESIONER_ALL) || "[]");
  } catch {
    return [];
  }
}

// ── OPD Session Helpers ───────────────────────────────────────────────
export function getCurrentOPDName(): string {
  return localStorage.getItem("opdNama") || "";
}

export function getCurrentOPDKlasters(): number[] {
  try {
    return JSON.parse(localStorage.getItem("opdKlasters") || "[]");
  } catch {
    return [];
  }
}

export function isOPDRole(): boolean {
  return getCurrentRole() === "opd";
}

import { MOCK_USERS, MOCK_RESULTS } from '../data/mockData';
import { seedInitialDummies, getDummyResults } from '../services/DummyDataService';

const SEED_VERSION = 'excel_v7_no_prefill'; // bump this to force re-seed

export function seedDummyUser(): void {
  const currentVersion = localStorage.getItem('seed_version');
  if (currentVersion === SEED_VERSION) {
    // Even if already seeded, ensure dummy data exists
    seedInitialDummies();
    return;
  }

  // Get existing users from localStorage (to preserve manually-added users)
  const existingUsers = getUsers();
  const existingNiks = new Set(existingUsers.map(u => u.nik));

  // Merge GAKIN users from MOCK_USERS (don't duplicate)
  const gakinToAdd = MOCK_USERS
    .filter(u => u.gakinStatus === "GAKIN" && !existingNiks.has(u.nik));

  const mergedUsers = [...existingUsers, ...gakinToAdd];
  localStorage.setItem(KEYS.USERS, JSON.stringify(mergedUsers));

  // Seed kuesioner results from hardcoded data
  const allResults: KuesionerSubmission[] = [];
  for (const r of MOCK_RESULTS) {
    localStorage.setItem(KEYS.KUESIONER_DONE(r.nik), JSON.stringify(r));
    allResults.push(r);
  }
  localStorage.setItem(KEYS.KUESIONER_ALL, JSON.stringify(allResults));

  // Seed initial 40 dummy responden (this now also injects into main `users` + `kuesioner_results`)
  seedInitialDummies();

  localStorage.setItem('seed_version', SEED_VERSION);
}
