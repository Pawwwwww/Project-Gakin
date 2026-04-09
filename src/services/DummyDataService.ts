// ═══════════════════════════════════════════════════════════════
//  DUMMY DATA SERVICE
//  Generate & manage dummy GAKIN responden for testing purposes.
//  Stored in localStorage so they persist across sessions.
//  When deleted → gakinStatus becomes "Non-GAKIN" (removable).
//  When re-added → gakinStatus goes back to "GAKIN".
// ═══════════════════════════════════════════════════════════════

import type { UserRecord, KuesionerSubmission } from "./StorageService";
import type { KuesionerData } from "../entities/respondent";

const DUMMY_USERS_KEY = "dummy_users";
const DUMMY_RESULTS_KEY = "dummy_results";
const DUMMY_COUNT_KEY = "dummy_count";
const DUMMY_NIK_PREFIX = "357800";

// ── Surabaya kecamatan/kelurahan pools for realistic data ──
const KECAMATAN_KELURAHAN: { kecamatan: string; kelurahan: string[] }[] = [
  { kecamatan: "ASEM ROWO", kelurahan: ["ASEM ROWO", "GENTING KALIANAK", "TAMBAK SARIOSO"] },
  { kecamatan: "BUBUTAN", kelurahan: ["BUBUTAN", "GUNDIH", "JEPARA", "TEMBOK DUKUH", "ALUN-ALUN CONTONG"] },
  { kecamatan: "KENJERAN", kelurahan: ["BULAK BANTENG", "SIDOTOPO WETAN", "TAMBAK WEDI", "TANAH KALI KEDINDING"] },
  { kecamatan: "KREMBANGAN", kelurahan: ["DUPAK", "KEMAYORAN", "KREMBANGAN SELATAN", "MOROKREMBANGAN", "PERAK BARAT"] },
  { kecamatan: "GAYUNGAN", kelurahan: ["DUKUH MENANGGAL", "GAYUNGAN", "KETINTANG", "MENANGGAL"] },
  { kecamatan: "KARANG PILANG", kelurahan: ["KARANG PILANG", "KEBRAON", "KEDURUS", "WARU GUNUNG"] },
  { kecamatan: "GUBENG", kelurahan: ["AIRLANGGA", "BARATAJAYA", "GUBENG", "KERTAJAYA", "MOJO", "PUCANG SEWU"] },
  { kecamatan: "JAMBANGAN", kelurahan: ["JAMBANGAN", "KARAH", "KEBONSARI", "PAGESANGAN"] },
  { kecamatan: "DUKUH PAKIS", kelurahan: ["DUKUH KUPANG", "DUKUH PAKIS", "GUNUNG SARI", "PRADAH KALIKENDAL"] },
  { kecamatan: "GENTENG", kelurahan: ["EMBONG KALIASIN", "GENTENG", "KAPASARI", "KETABANG", "PENELEH"] },
];

const FIRST_NAMES = [
  "AHMAD", "SITI", "BUDI", "ANI", "IWAN", "DEWI", "RINA", "HADI",
  "YUSUF", "NUR", "FAJAR", "LESTARI", "ANDI", "MAYA", "DIAN", "PUTRI",
  "AGUS", "TUTI", "EKO", "WATI", "RUDI", "LAILA", "ARIF", "SARI",
  "JOKO", "FITRI", "WAHYU", "RATNA", "TEGUH", "INDAH", "WAWAN", "NINGSIH",
  "YANTO", "WIDYA", "DENI", "ASRI", "GUNAWAN", "NITA", "BAMBANG", "LILIS",
];

const PENDIDIKAN_OPTS = ["SD", "SLTP", "SLTA", "Tidak tamat SD"];
const AGAMA_OPTS = ["Islam", "Kristen/Protestan"];
const SUKU_OPTS = ["Jawa", "Madura"];

// ── Random helpers ──
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a sequential NIK: 357800 + 10-digit padded number */
function makeDummyNIK(index: number): string {
  return DUMMY_NIK_PREFIX + String(index).padStart(10, "0");
}

/** Generate random kuesioner data that produces varied klaster results */
function generateKuesionerData(): KuesionerData {
  const grit: Record<string, number> = {};
  for (let i = 1; i <= 12; i++) grit[String(i)] = randInt(1, 5);
  const kwu: Record<string, number> = {};
  for (let i = 1; i <= 15; i++) kwu[String(i)] = randInt(1, 4);
  const tipi: Record<string, number> = {};
  for (let i = 1; i <= 10; i++) tipi[String(i)] = randInt(1, 7);
  return { consent: true, grit, kwu, tipi };
}

/** Generate a single dummy UserRecord */
function generateDummyUser(index: number): UserRecord {
  const loc = pick(KECAMATAN_KELURAHAN);
  const kelurahan = pick(loc.kelurahan);
  const gender = index % 2 === 0 ? "Laki-laki" : "Perempuan";
  const year = randInt(1970, 2005);
  const month = String(randInt(1, 12)).padStart(2, "0");
  const day = String(randInt(1, 28)).padStart(2, "0");

  return {
    nik: makeDummyNIK(index),
    fullName: `RESPONDEN DUMMY ${index}`,
    jenisKelamin: gender,
    tempatLahir: "Surabaya",
    tanggalLahir: `${year}-${month}-${day}`,
    phone: "-",
    alamatKtp: `JL. DUMMY ${index}`,
    rtKtp: String(randInt(1, 10)),
    rwKtp: String(randInt(1, 8)),
    kelurahanKtp: kelurahan,
    kecamatanKtp: loc.kecamatan,
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "-",
    isSurabaya: true,
    pendidikan: pick(PENDIDIKAN_OPTS),
    agama: pick(AGAMA_OPTS),
    suku: pick(SUKU_OPTS),
    punyaUsaha: Math.random() > 0.5 ? "ya" : "tidak",
    bidangUsaha: Math.random() > 0.5 ? "Makanan/Minuman" : "-",
    penghasilanPerHari: Math.random() > 0.5 ? "< 100.000" : "100.000 - 250.000",
    lamaBerusaha: "-",
    gantiUsaha: "-",
    gakinStatus: "GAKIN",
  };
}

/** Generate a single dummy KuesionerSubmission */
function generateDummyResult(index: number): KuesionerSubmission {
  const nik = makeDummyNIK(index);
  const dateOffset = index;
  const date = new Date();
  date.setDate(date.getDate() - dateOffset);

  return {
    nik,
    nama: `RESPONDEN DUMMY ${index}`,
    tanggal: date.toISOString(),
    data: generateKuesionerData(),
  };
}

// ═══════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════

// Helper: read/write main users store directly (avoid circular import)
function _getMainUsers(): UserRecord[] {
  try { return JSON.parse(localStorage.getItem("users") || "[]"); } catch { return []; }
}
function _setMainUsers(users: UserRecord[]): void {
  localStorage.setItem("users", JSON.stringify(users));
}
function _getMainResults(): KuesionerSubmission[] {
  try { return JSON.parse(localStorage.getItem("kuesioner_results") || "[]"); } catch { return []; }
}
function _setMainResults(results: KuesionerSubmission[]): void {
  localStorage.setItem("kuesioner_results", JSON.stringify(results));
}

/** Get current dummy user count */
export function getDummyCount(): number {
  const stored = localStorage.getItem(DUMMY_COUNT_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

/** Get all dummy users from localStorage */
export function getDummyUsers(): UserRecord[] {
  const raw = localStorage.getItem(DUMMY_USERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

/** Get all dummy kuesioner results from localStorage */
export function getDummyResults(): KuesionerSubmission[] {
  const raw = localStorage.getItem(DUMMY_RESULTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

/** Generate N dummy responden (replaces existing dummies) */
export function generateDummies(count: number): { users: UserRecord[]; results: KuesionerSubmission[] } {
  // Remove old dummies from main stores first
  const oldDummies = getDummyUsers();
  const oldDummyNiks = new Set(oldDummies.map(u => u.nik));
  
  const users: UserRecord[] = [];
  const results: KuesionerSubmission[] = []; // empty — user fills kuesioner themselves

  for (let i = 1; i <= count; i++) {
    users.push(generateDummyUser(i));
    // NO kuesioner pre-generation — user fills it manually
  }

  // Save to dummy-specific keys (for tracking)
  localStorage.setItem(DUMMY_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(DUMMY_RESULTS_KEY, JSON.stringify([]));
  localStorage.setItem(DUMMY_COUNT_KEY, String(count));

  // ── Also inject into the MAIN `users` localStorage ──
  const mainUsers = _getMainUsers().filter(u => !oldDummyNiks.has(u.nik));
  const newDummyNiks = new Set(users.map(u => u.nik));
  const cleanMain = mainUsers.filter(u => !newDummyNiks.has(u.nik));
  _setMainUsers([...cleanMain, ...users]);

  // ── Clean up any old kuesioner results for dummies ──
  const mainResults = _getMainResults().filter(r => !oldDummyNiks.has(r.nik) && !newDummyNiks.has(r.nik));
  for (const nik of oldDummyNiks) {
    localStorage.removeItem(`kuesioner_done_${nik}`);
  }
  for (const nik of newDummyNiks) {
    localStorage.removeItem(`kuesioner_done_${nik}`);
  }
  _setMainResults(mainResults);

  // Fire storage event so other components react in real time
  window.dispatchEvent(new StorageEvent("storage", { key: "users" }));

  return { users, results };
}

/** Remove a specific dummy user (set to Non-GAKIN) */
export function removeDummyUser(nik: string): void {
  // Update dummy tracking store
  const users = getDummyUsers();
  const updated = users.map(u => u.nik === nik ? { ...u, gakinStatus: "Non-GAKIN" as const } : u);
  localStorage.setItem(DUMMY_USERS_KEY, JSON.stringify(updated));
  
  // Also update in main users store
  const mainUsers = _getMainUsers();
  const mainUpdated = mainUsers.map(u => u.nik === nik ? { ...u, gakinStatus: "Non-GAKIN" as const } : u);
  _setMainUsers(mainUpdated);
  
  window.dispatchEvent(new StorageEvent("storage", { key: "users" }));
}

/** Re-add a specific dummy user (set back to GAKIN) */
export function readdDummyUser(nik: string): void {
  // Update dummy tracking store
  const users = getDummyUsers();
  const updated = users.map(u => u.nik === nik ? { ...u, gakinStatus: "GAKIN" as const } : u);
  localStorage.setItem(DUMMY_USERS_KEY, JSON.stringify(updated));
  
  // Also update in main users store
  const mainUsers = _getMainUsers();
  const mainUpdated = mainUsers.map(u => u.nik === nik ? { ...u, gakinStatus: "GAKIN" as const } : u);
  _setMainUsers(mainUpdated);
  
  window.dispatchEvent(new StorageEvent("storage", { key: "users" }));
}

/** Clear all dummy data */
export function clearDummies(): void {
  // Remove from main stores
  const dummyNiks = new Set(getDummyUsers().map(u => u.nik));
  _setMainUsers(_getMainUsers().filter(u => !dummyNiks.has(u.nik)));
  _setMainResults(_getMainResults().filter(r => !dummyNiks.has(r.nik)));
  for (const nik of dummyNiks) {
    localStorage.removeItem(`kuesioner_done_${nik}`);
  }
  
  // Remove dummy tracking keys
  localStorage.removeItem(DUMMY_USERS_KEY);
  localStorage.removeItem(DUMMY_RESULTS_KEY);
  localStorage.removeItem(DUMMY_COUNT_KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: "users" }));
}

/** Check if a NIK belongs to a dummy user */
export function isDummyNIK(nik: string): boolean {
  return nik.startsWith(DUMMY_NIK_PREFIX) && nik.length === 16;
}

/** Seed initial 40 dummies if none exist */
export function seedInitialDummies(): void {
  if (getDummyCount() === 0) {
    generateDummies(40);
  }
}

