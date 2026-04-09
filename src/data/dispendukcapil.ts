import { MOCK_USERS, getMergedUsers } from "./mockData";

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

function toDispenduk(u: { nik: string; fullName: string; tempatLahir: string; tanggalLahir: string; jenisKelamin: string; alamatKtp: string; rtKtp: string; rwKtp: string; kelurahanKtp: string; kecamatanKtp: string; kotaKtp: string; provinsiKtp: string; kodePosKtp: string }): DispendukRecord {
  return { nik: u.nik, fullName: u.fullName, tempatLahir: u.tempatLahir, tanggalLahir: u.tanggalLahir, jenisKelamin: u.jenisKelamin, alamatKtp: u.alamatKtp, rtKtp: u.rtKtp, rwKtp: u.rwKtp, kelurahanKtp: u.kelurahanKtp, kecamatanKtp: u.kecamatanKtp, kotaKtp: u.kotaKtp, provinsiKtp: u.provinsiKtp, kodePosKtp: u.kodePosKtp };
}

// Dispendukcapil berisi SEMUA warga Surabaya (GAKIN + Non-GAKIN)
export const MOCK_DISPENDUK_DB: DispendukRecord[] = MOCK_USERS.map(toDispenduk);

export async function fetchDispendukData(nik: string): Promise<DispendukRecord | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Search in both static + dummy data
      const all = getMergedUsers().map(toDispenduk);
      const found = all.find(record => record.nik === nik);
      resolve(found || null);
    }, 800); 
  });
}
