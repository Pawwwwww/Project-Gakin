// ═══════════════════════════════════════════════════════════════
//  TINDAK LANJUT CONFIG
//  Mapping OPD dan jenis tindak lanjut per klaster
//  Berdasarkan tabel referensi kebijakan Pemkot Surabaya
// ═══════════════════════════════════════════════════════════════

export interface OPDConfig {
  nama: string;
  tindakLanjut: string[];
}

export interface KlasterConfig {
  id: number;
  title: string;
  subtitle: string;
  opdList: OPDConfig[];
}

export const KLASTER_TINDAK_LANJUT: KlasterConfig[] = [
  {
    id: 1,
    title: "Klaster 1",
    subtitle: "Membutuhkan Dukungan Keterampilan dan Motivasi",
    opdList: [
      {
        nama: "Dinas Sosial",
        tindakLanjut: [
          "Assessment dan Profiling Keluarga secara Menyeluruh",
          "Inkubasi Motivasi",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Klaster 2",
    subtitle: "Membutuhkan Dukungan Keterampilan",
    opdList: [
      {
        nama: "Disperinaker",
        tindakLanjut: [
          "Pelatihan Keterampilan Sederhana (Jasa dan Produk)",
          "Model Triple-Income Household (Bapak–Ibu–Anak bekerja sesuai kapasitas)",
        ],
      },
      {
        nama: "Dinas Ketahanan Pangan dan Pertanian",
        tindakLanjut: [
          "Pelatihan Keterampilan Sederhana (Pertanian Perkotaan)",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Klaster 3",
    subtitle: "Siap Bermitra dan Mengembangkan Usaha",
    opdList: [
      {
        nama: "Disperinaker",
        tindakLanjut: [
          "Pelatihan Keterampilan Menengah/Lanjut (SKKNI)",
          "Pelatihan Industri Padat Karya Berbasis Minat dan Pasar",
        ],
      },
      {
        nama: "Dinas Koperasi, Usaha Mikro dan Perdagangan",
        tindakLanjut: [
          "Diversifikasi Usaha Keluarga",
          "Fasilitasi kepada Lembaga yang Memberi Modal Bertahap Berbasis Milestone",
          "Pendampingan Intensif 6 Bulan",
          "Penguatan Pemasaran Offline dan Online",
          "Model Triple-Income Household (Bapak–Ibu–Anak bekerja sesuai kapasitas)",
        ],
      },
      {
        nama: "Dinas Ketahanan Pangan dan Pertanian",
        tindakLanjut: [
          "Fasilitasi kepada Lembaga yang Memberi Modal Bertahap Berbasis Milestone",
          "Pendampingan Intensif 6 Bulan",
          "Penguatan Pemasaran Offline dan Online",
        ],
      },
      {
        nama: "Dinas Kebudayaan, Kepemudaan dan Olahraga serta Pariwisata",
        tindakLanjut: [
          "Fasilitasi kepada Lembaga yang Memberi Modal Bertahap Berbasis Milestone",
          "Model Triple-Income Household (Bapak–Ibu–Anak bekerja sesuai kapasitas)",
          "Penguatan Pemasaran Offline dan Online",
        ],
      },
      {
        nama: "Dinas Pemberdayaan Perempuan dan Perlindungan Anak serta Pengendalian Penduduk dan Keluarga Berencana",
        tindakLanjut: [
          "Fasilitasi kepada Lembaga yang Memberi Modal Bertahap Berbasis Milestone",
          "Diversifikasi Usaha Keluarga",
          "Model Triple-Income Household (Bapak–Ibu–Anak bekerja sesuai kapasitas)",
          "Penguatan Pemasaran Offline dan Online",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Klaster 4",
    subtitle: "Wirausaha Mandiri dan Siap Ekspansi",
    opdList: [
      {
        nama: "Dinas Koperasi, Usaha Mikro dan Perdagangan",
        tindakLanjut: [
          "Pelatihan Bisnis Tingkat Menengah/Lanjutan",
          "Pelatihan Ekspor-Impor",
          "Pendampingan untuk Perluasan/Diversifikasi Usaha",
        ],
      },
      {
        nama: "Dinas Kebudayaan, Kepemudaan dan Olahraga serta Pariwisata",
        tindakLanjut: [
          "Pelatihan Bisnis Tingkat Lanjutan",
          "Pendampingan untuk Penguatan Branding dan Jejaring",
        ],
      },
    ],
  },
];

/** Mendapatkan daftar OPD yang tersedia untuk klaster tertentu */
export function getOPDListByKlaster(klaster: number): OPDConfig[] {
  return KLASTER_TINDAK_LANJUT.find(k => k.id === klaster)?.opdList || [];
}

/** Mendapatkan daftar tindak lanjut untuk OPD tertentu di klaster tertentu */
export function getTindakLanjutByOPD(klaster: number, opdNama: string): string[] {
  const opd = getOPDListByKlaster(klaster).find(o => o.nama === opdNama);
  return opd?.tindakLanjut || [];
}
