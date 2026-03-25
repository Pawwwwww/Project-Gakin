// ═══════════════════════════════════════════════════════════════
//  DATA MOCK DISPENDUKCAPIL & DINAS SOSIAL SURABAYA
//  Digunakan untuk simulasi penarikan data registrasi "Warga Surabaya"
// ═══════════════════════════════════════════════════════════════

import { HARDCODED_USERS } from './hardcodedData';

export interface DispendukRecord {
  nik: string;
  fullName: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamatKtp: string;
  rtKtp: string;
  rwKtp: string;
  kelurahanKtp: string;
  kecamatanKtp: string;
  kotaKtp: string;
  provinsiKtp: string;
  kodePosKtp: string;
}

export const MOCK_DISPENDUK_DB: DispendukRecord[] = [
  {
    nik: "3578010205060001",
    fullName: "Yusuf Fawwaz Kurniawan Djuhara",
    tempatLahir: "Surabaya",
    tanggalLahir: "2006-05-02",
    jenisKelamin: "Laki-laki",
    alamatKtp: "Griya Kebraon Barat 2 Blok BI/18",
    rtKtp: "006",
    rwKtp: "003",
    kelurahanKtp: "Kebraon",
    kecamatanKtp: "Karang Pilang",
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "60222"
  },
  {
    nik: "3524016807040001",
    fullName: "Adelia Rova Chumairo",
    tempatLahir: "Surabaya",
    tanggalLahir: "2004-07-28",
    jenisKelamin: "Perempuan",
    alamatKtp: "jl. agung",
    rtKtp: "08",
    rwKtp: "01",
    kelurahanKtp: "Keputih (Sukolilo)",
    kecamatanKtp: "Benowo",
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "60222"
  },
  {
    nik: "3578010000000001",
    fullName: "Budi Santoso",
    tempatLahir: "Surabaya",
    tanggalLahir: "1985-04-12",
    jenisKelamin: "Laki-laki",
    alamatKtp: "Jl. Tunjungan No. 12",
    rtKtp: "01",
    rwKtp: "05",
    kelurahanKtp: "Genteng",
    kecamatanKtp: "Genteng",
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "60275"
  },
  {
    nik: "3578010000000003",
    fullName: "Agus Pratama",
    tempatLahir: "Surabaya",
    tanggalLahir: "1995-08-08",
    jenisKelamin: "Laki-laki",
    alamatKtp: "Jl. Kertajaya Indah No. 8A",
    rtKtp: "02",
    rwKtp: "04",
    kelurahanKtp: "Manyar Sabrangan",
    kecamatanKtp: "Mulyorejo",
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "60116"
  },
  {
    nik: "3578010000000005",
    fullName: "Hendra Setiawan",
    tempatLahir: "Surabaya",
    tanggalLahir: "1992-06-30",
    jenisKelamin: "Laki-laki",
    alamatKtp: "Jl. Gayungsari Blok A",
    rtKtp: "06",
    rwKtp: "01",
    kelurahanKtp: "Gayungan",
    kecamatanKtp: "Gayungan",
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "60235"
  }
];

/**
 * Simulasi API Call ke Dispendukcapil/Dinas Sosial
 */
export async function fetchDispendukData(nik: string): Promise<DispendukRecord | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const excelUser = HARDCODED_USERS.find(user => user.nik === nik);
      if (excelUser) {
        resolve({
          nik: excelUser.nik,
          fullName: excelUser.fullName,
          tempatLahir: excelUser.tempatLahir,
          tanggalLahir: excelUser.tanggalLahir,
          jenisKelamin: excelUser.jenisKelamin,
          alamatKtp: excelUser.alamatKtp,
          rtKtp: excelUser.rtKtp || "001",
          rwKtp: excelUser.rwKtp || "001",
          kelurahanKtp: excelUser.kelurahanKtp || "Surabaya",
          kecamatanKtp: excelUser.kecamatanKtp || "Surabaya",
          kotaKtp: excelUser.kotaKtp || "Surabaya",
          provinsiKtp: excelUser.provinsiKtp || "Jawa Timur",
          kodePosKtp: excelUser.kodePosKtp || "60272"
        });
        return;
      }

      const found = MOCK_DISPENDUK_DB.find(record => record.nik === nik);
      if (found) {
        resolve(found);
      } else {
        // Karena ini mock, kita asumsikan semua NIK 16 digit yang dimasukkan 
        // dianggap "ditemukan" agar flow registrasi Warga Surabaya tidak terblokir saat demo.
        resolve({
          nik: nik,
          fullName: "Pengguna (Data Simulasi)",
          tempatLahir: "Surabaya",
          tanggalLahir: "1995-01-01",
          jenisKelamin: "Laki-laki",
          alamatKtp: "Jl. Simulasi Sistem No. 1",
          rtKtp: "001",
          rwKtp: "001",
          kelurahanKtp: "Ketabang",
          kecamatanKtp: "Genteng",
          kotaKtp: "Surabaya",
          provinsiKtp: "Jawa Timur",
          kodePosKtp: "60272"
        });
      }
    }, 800); // Simulate network delay
  });
}
