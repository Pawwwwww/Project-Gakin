// ═══════════════════════════════════════════════════════════════
//  COMMON ENTITIES
//  Opsi pilihan form yang dipakai bersama (Register & Profile)
// ═══════════════════════════════════════════════════════════════

export const AGAMA_OPTIONS = [
  "Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu",
];

export const PENDIDIKAN_OPTIONS = [
  "SD", "SMP", "SMA / SMK", "D1", "D2", "D3", "D4 / S1 Terapan", "S1", "S2", "S3",
];

export const SUKU_OPTIONS = [
  "Jawa", "Sunda", "Batak", "Madura", "Betawi", "Minangkabau", "Bugis", "Melayu",
  "Bali", "Banjar", "Aceh", "Dayak", "Sasak", "Makassar", "Cirebon", "Toraja",
  "Flores", "Ambon", "Papua", "Tionghoa", "Lainnya",
];

export const PROVINSI_OPTIONS = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi",
  "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta",
  "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
  "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
  "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara", "Papua Barat", "Papua",
].sort();

export const BIDANG_USAHA_OPTIONS = [
  "Makanan/Minuman",
  "Perdagangan Kecil",
  "Jasa",
  "Tukang/Teknik",
  "Lainnya",
];

export const BIDANG_USAHA_DESKRIPSI: Record<string, string> = {
  "Makanan/Minuman":   "Warung makan, minuman, penjual es, gorengan/kue",
  "Perdagangan Kecil": "Toko Kelontong, Sembako, Agen Pulsa/Token, dll",
  "Jasa":              "Penjahit, Laundry, Salon, dll",
  "Tukang/Teknik":     "Tukang Bangunan, Elektronik, Bengkel, dll",
  "Lainnya":           "Bidang usaha lainnya",
};

export const PENGHASILAN_OPTIONS = [
  "< 100.000",
  "100.000 - 250.000",
  "251.000 - 500.000",
  "501.000 - 1.000.000",
  "> 1.000.000",
];

export const LAMA_BERUSAHA_OPTIONS = [
  "< 1 tahun",
  "1-2 tahun",
  "3-5 tahun",
  "> 5 tahun",
];

export const GANTI_USAHA_OPTIONS = [
  "0",
  "1-2 kali",
  "3-4 kali",
  "> 4 kali",
];
