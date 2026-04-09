import { MOCK_USERS } from "./mockData";

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

// Dispendukcapil berisi SEMUA warga Surabaya (GAKIN + Non-GAKIN)
export const MOCK_DISPENDUK_DB: DispendukRecord[] = MOCK_USERS
  .map(u => ({
    nik: u.nik,
    fullName: u.fullName,
    tempatLahir: u.tempatLahir,
    tanggalLahir: u.tanggalLahir,
    jenisKelamin: u.jenisKelamin,
    alamatKtp: u.alamatKtp,
    rtKtp: u.rtKtp,
    rwKtp: u.rwKtp,
    kelurahanKtp: u.kelurahanKtp,
    kecamatanKtp: u.kecamatanKtp,
    kotaKtp: u.kotaKtp,
    provinsiKtp: u.provinsiKtp,
    kodePosKtp: u.kodePosKtp
  }));

export async function fetchDispendukData(nik: string): Promise<DispendukRecord | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const found = MOCK_DISPENDUK_DB.find(record => record.nik === nik);
      resolve(found || null);
    }, 800); 
  });
}
