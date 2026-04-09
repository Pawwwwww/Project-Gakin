// ═══════════════════════════════════════════════════════════════
//  TINDAK LANJUT SERVICE
//  CRUD tindak lanjut di localStorage
//  Setiap responden hanya bisa punya SATU tindak lanjut
// ═══════════════════════════════════════════════════════════════

export interface TindakLanjutData {
  nik: string;
  opd: string;
  jenisTindakLanjut: string;
  tanggal: string; // ISO date string
}

const STORAGE_KEY = "tindak_lanjut_data";

/** Ambil semua data tindak lanjut sebagai Map<nik, TindakLanjutData> */
export function getTindakLanjutMap(): Record<string, TindakLanjutData> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Cek apakah NIK sudah punya tindak lanjut */
export function hasTindakLanjut(nik: string): boolean {
  const map = getTindakLanjutMap();
  return nik in map;
}

/** Ambil tindak lanjut untuk NIK tertentu */
export function getTindakLanjut(nik: string): TindakLanjutData | null {
  const map = getTindakLanjutMap();
  return map[nik] || null;
}

/** Simpan / buat tindak lanjut baru (hanya jika belum ada) */
export function setTindakLanjut(nik: string, opd: string, jenisTindakLanjut: string): boolean {
  const map = getTindakLanjutMap();
  if (map[nik]) return false; // sudah ada, tidak bisa ditambah lagi
  map[nik] = {
    nik,
    opd,
    jenisTindakLanjut,
    tanggal: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return true;
}

/** Update tindak lanjut (edit OPD atau jenis) */
export function updateTindakLanjut(nik: string, opd: string, jenisTindakLanjut: string): boolean {
  const map = getTindakLanjutMap();
  if (!map[nik]) return false; // tidak ada data untuk di-update
  map[nik] = {
    ...map[nik],
    opd,
    jenisTindakLanjut,
    tanggal: new Date().toISOString(), // update timestamp
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return true;
}

/** Hapus tindak lanjut */
export function removeTindakLanjut(nik: string): boolean {
  const map = getTindakLanjutMap();
  if (!map[nik]) return false;
  delete map[nik];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return true;
}

/** Ambil semua tindak lanjut sebagai array */
export function getAllTindakLanjut(): TindakLanjutData[] {
  const map = getTindakLanjutMap();
  return Object.values(map);
}
