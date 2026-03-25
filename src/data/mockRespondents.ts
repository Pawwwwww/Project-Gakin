import { HARDCODED_USERS } from './hardcodedData';
import { MOCK_DISPENDUK_DB } from './dispendukcapil';

function calcAge(tanggalLahir: string): number {
  if (!tanggalLahir) return 30;
  const birth = new Date(tanggalLahir);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

// All Excel data = GAKIN
const gakinRows = HARDCODED_USERS.map((u, i) => ({
  id: i + 1,
  nik: u.nik,
  nama: u.fullName,
  kecamatan: u.kecamatanKtp || "Surabaya",
  kelurahan: u.kelurahanKtp || "Surabaya",
  usia: calcAge(u.tanggalLahir),
  type: "GAKIN" as const,
  jenisKelamin: u.jenisKelamin || "Laki-laki",
  phone: u.phone,
  pendidikan: u.pendidikan || "-",
  agama: u.agama || "-",
}));

// Dispendukcapil entries that are NOT already in gakin list = Non-GAKIN
const gakinNIKs = new Set(HARDCODED_USERS.map(u => u.nik));
const nonGakinRows = MOCK_DISPENDUK_DB
  .filter(d => !gakinNIKs.has(d.nik))
  .map((d, i) => ({
    id: HARDCODED_USERS.length + i + 1,
    nik: d.nik,
    nama: d.fullName,
    kecamatan: d.kecamatanKtp,
    kelurahan: d.kelurahanKtp,
    usia: calcAge(d.tanggalLahir),
    type: "Non-GAKIN" as const,
    jenisKelamin: d.jenisKelamin,
    phone: "-",
    pendidikan: "-",
    agama: "-",
  }));

export const INITIAL_DATA = [...gakinRows, ...nonGakinRows];

export type DataItem = typeof INITIAL_DATA[0];

