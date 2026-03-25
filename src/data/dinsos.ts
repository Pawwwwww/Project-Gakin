// ═══════════════════════════════════════════════════════════════
//  DATA MOCK DINAS SOSIAL (DINSOS) SURABAYA
//  Hanya berisi warga miskin (GAKIN) yang otomatis memiliki akun
// ═══════════════════════════════════════════════════════════════

import { HARDCODED_USERS } from './hardcodedData';

export interface DinsosRecord {
  nik: string;
  fullName: string;
  status: "GAKIN";
  // Data sekunder jika diperlukan (bisa diambil dari Dispendukcapil juga)
  tempatLahir: string;
  tanggalLahir: string;
}

export const MOCK_DINSOS_DB: DinsosRecord[] = [
  {
    nik: "3578010000000002",
    fullName: "Siti Aminah",
    status: "GAKIN",
    tempatLahir: "Surabaya",
    tanggalLahir: "1990-11-20"
  },
  {
    nik: "3578010000000004",
    fullName: "Rina Wulandari",
    status: "GAKIN",
    tempatLahir: "Surabaya",
    tanggalLahir: "1988-02-14"
  },
  {
    nik: "3578010000000006",
    fullName: "Joko Susilo (Bapak Gakin Testing)",
    status: "GAKIN",
    tempatLahir: "Surabaya",
    tanggalLahir: "1975-12-01"
  }
];

export async function checkDinsosData(nik: string): Promise<DinsosRecord | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const excelUser = HARDCODED_USERS.find(u => u.nik === nik && u.gakinStatus === "GAKIN");
      if (excelUser) {
        resolve({
          nik: excelUser.nik,
          fullName: excelUser.fullName,
          status: "GAKIN",
          tempatLahir: excelUser.tempatLahir,
          tanggalLahir: excelUser.tanggalLahir
        });
        return;
      }

      const found = MOCK_DINSOS_DB.find(record => record.nik === nik);
      resolve(found || null);
    }, 400); // Simulate network delay
  });
}
