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
  // Alamat Domisili
  alamatDomisili: string;
  rtDomisili: string;
  rwDomisili: string;
  kelurahanDomisili: string;
  kecamatanDomisili: string;
  kotaDomisili: string;
  provinsiDomisili: string;
  kodePosDomisili: string;
  domisiliSama?: boolean;
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
}

export function updateUser(nik: string, partial: Partial<UserRecord>): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.nik === nik);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...partial };
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    // Sinkronkan nama ke session jika yang diperbarui adalah nama
    if (partial.fullName) {
      localStorage.setItem(KEYS.USER_NAME, partial.fullName);
    }
  }
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

// ── Seed data dummy ───────────────────────────────────────────────────
const KECAMATAN_LIST = ["Tegalsari", "Simokerto", "Genteng", "Bubutan", "Gubeng", "Bulak", "Karang Pilang", "Benowo"];
const dummyNames = [
  "Ahmad Budi Santoso", "Siti Aminah Fatmawati", "Bagus Dwi Wicaksono", "Lestari Ayu Puspita",
  "Rizky Aditya Pratama", "Nadia Safira Kirana", "Fajar Hidayatullah", "Putri Maharani",
  "Eko Prasetyo", "Dewi Sartika", "Hendra Setiawan", "Rina Wati", "Andi Syahputra",
  "Susi Susanti", "Bambang Pamungkas", "Dian Sastrowardoyo", "Taufik Hidayat",
  "Agnes Monica", "Reza Rahadian", "Raisa Andriana", "Luhut Binsar", "Joko Widodo"
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function seedDummyUser(): void {
  const users = getUsers();
  // We only seed if there are extremely few users (e.g. initial load or wiped)
  if (users.length <= 5) {
    for (let i = 0; i < dummyNames.length; i++) {
      const nik = `35780${(10000000000 + i * 7351).toString()}`;
      // Prevent seeding identical users
      if (findUserByNIK(nik)) continue;
      
      const user: UserRecord = {
        nik,
        fullName: dummyNames[i],
        gakinStatus: i % 3 === 0 ? "GAKIN" : "Non-GAKIN",
        tanggalLahir: `199${randInt(0, 9)}-0${randInt(1, 9)}-1${randInt(0, 9)}`,
        jenisKelamin: i % 2 === 0 ? "Laki-laki" : "Perempuan",
        tempatLahir: "Surabaya",
        phone: `081234567${100 + i}`,
        pendidikan: i % 2 === 0 ? "SMA/SMK" : "S1",
        agama: "Islam",
        suku: "Jawa",
        alamatKtp: `Jl. Pahlawan No. ${i + 1}`,
        rtKtp: "01",
        rwKtp: "02",
        kelurahanKtp: "Ketabang",
        kecamatanKtp: KECAMATAN_LIST[i % KECAMATAN_LIST.length],
        kotaKtp: "Surabaya",
        provinsiKtp: "Jawa Timur",
        kodePosKtp: "60272",
        alamatDomisili: `Jl. Pahlawan No. ${i + 1}`,
        rtDomisili: "01",
        rwDomisili: "02",
        kelurahanDomisili: "Ketabang",
        kecamatanDomisili: KECAMATAN_LIST[i % KECAMATAN_LIST.length],
        kotaDomisili: "Surabaya",
        provinsiDomisili: "Jawa Timur",
        kodePosDomisili: "60272",
        punyaUsaha: i % 4 !== 0 ? "ya" : "tidak",
        bidangUsaha: ["Kuliner", "Fesyen", "Jasa", "Kriya"][i % 4],
        penghasilanPerHari: "Rp 100.000 - Rp 500.000",
        lamaBerusaha: "1-3 Tahun",
        gantiUsaha: "Tidak Pernah",
      };

      saveUser(user);

      // Kuesioner diisi untuk sebagian besar user
      if (i < 18) {
        const grit: Record<number, number> = {};
        GRIT_QUESTIONS.forEach(q => { grit[q.id] = randInt(2, 5); });
        
        const kwu: Record<number, number> = {};
        KWU_ITEMS.forEach(q => { kwu[q.id] = randInt(2, 5); });
        
        const tipi: Record<number, number> = {};
        TIPI_QUESTIONS.forEach(q => { tipi[q.id] = randInt(2, 7); });

        saveKuesionerResult(nik, { consent: true, grit, kwu, tipi });
      }
    }
  }
}
