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
  { username: "admin.web",           password: "admin", role: "admin_web",     name: "Admin Web",            kecamatan: null },
];
