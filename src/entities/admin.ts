// ═══════════════════════════════════════════════════════════════
//  ADMIN ENTITIES
//  Tipe data dan konstanta untuk autentikasi admin
// ═══════════════════════════════════════════════════════════════

export type LoginMode = "nik" | "admin";

export interface AdminAccount {
  username: string;
  password: string;
  role: string;
  name: string;
  kecamatan: string | null;
}

// Daftar akun admin — sesuaikan sesuai kebutuhan
export const ADMIN_ACCOUNTS: AdminAccount[] = [
  { username: "kepala.brida",        password: "admin", role: "kepala_brida",  name: "Kepala BRIDA",         kecamatan: null },
  { username: "kepala.dinsos",       password: "admin", role: "kepala_dinsos", name: "Kepala Dinas Sosial",  kecamatan: null },
  { username: "anggota1",            password: "admin", role: "anggota_1",     name: "Anggota Tim 1",        kecamatan: null },
  { username: "anggota2",            password: "admin", role: "anggota_2",     name: "Anggota Tim 2",        kecamatan: null },
  { username: "anggota3",            password: "admin", role: "anggota_3",     name: "Anggota Tim 3",        kecamatan: null },
  { username: "admin.web",           password: "admin", role: "admin_web",     name: "Admin Web",            kecamatan: null },
  // Akun Camat
  { username: "camat.karangpilang",  password: "admin", role: "camat",         name: "Camat Karang Pilang",  kecamatan: "Karang Pilang" },
  { username: "camat.wiyung",        password: "admin", role: "camat",         name: "Camat Wiyung",         kecamatan: "Wiyung" },
];
