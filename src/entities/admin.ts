// ═══════════════════════════════════════════════════════════════
//  ADMIN ENTITIES
//  Tipe data dan konstanta untuk autentikasi admin + OPD
// ═══════════════════════════════════════════════════════════════

export type LoginMode = "nik" | "admin";

export interface AdminAccount {
  username: string;
  password: string;
  role: string;          // "admin_web" | "opd"
  name: string;
  kecamatan: string | null;
  opdNama?: string;      // Full OPD name (only for role === "opd")
  opdKlasters?: number[]; // Klaster yang bisa diakses oleh OPD ini
}

// Daftar akun admin + OPD — sesuaikan sesuai kebutuhan
export const ADMIN_ACCOUNTS: AdminAccount[] = [
  // ── Admin Utama ──
  { username: "admin.web",        password: "admin",            role: "admin_web", name: "Admin Web",          kecamatan: null },
  { username: "psikologi.unair",  password: "psikologixbrida",  role: "admin_web", name: "Psikologi UNAIR",    kecamatan: null },

  // ── OPD Accounts ──
  {
    username: "opd.dinsos",
    password: "dinsos123",
    role: "opd",
    name: "Dinas Sosial",
    kecamatan: null,
    opdNama: "Dinas Sosial",
    opdKlasters: [1],
  },
  {
    username: "opd.disperinaker",
    password: "disperinaker123",
    role: "opd",
    name: "Disperinaker",
    kecamatan: null,
    opdNama: "Disperinaker",
    opdKlasters: [2, 3],
  },
  {
    username: "opd.ketahananpangan",
    password: "pangan123",
    role: "opd",
    name: "Dinas Ketahanan Pangan",
    kecamatan: null,
    opdNama: "Dinas Ketahanan Pangan dan Pertanian",
    opdKlasters: [2, 3],
  },
  {
    username: "opd.koperasi",
    password: "koperasi123",
    role: "opd",
    name: "Dinas Koperasi dan UMKM",
    kecamatan: null,
    opdNama: "Dinas Koperasi, Usaha Mikro dan Perdagangan",
    opdKlasters: [3, 4],
  },
  {
    username: "opd.disbudpora",
    password: "disbudpora123",
    role: "opd",
    name: "Disbudpora",
    kecamatan: null,
    opdNama: "Dinas Kebudayaan, Kepemudaan dan Olahraga serta Pariwisata",
    opdKlasters: [3, 4],
  },
  {
    username: "opd.dp3appkb",
    password: "dp3appkb123",
    role: "opd",
    name: "DP3APPKB",
    kecamatan: null,
    opdNama: "Dinas Pemberdayaan Perempuan dan Perlindungan Anak serta Pengendalian Penduduk dan Keluarga Berencana",
    opdKlasters: [3],
  },
];
