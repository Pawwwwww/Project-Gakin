import { MOCK_USERS, getMergedUsers } from "./mockData";
import { getUsers } from "../services/StorageService";
import { isDummyNIK } from "../services/DummyDataService";

function calcAge(tanggalLahir: string): number {
  if (!tanggalLahir) return 30;
  const birth = new Date(tanggalLahir);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getDataItems() {
  // GAKIN dari hardcoded + dummy users
  const allMergedUsers = getMergedUsers();
  const gakinNiks = new Set<string>();
  const gakinItems = allMergedUsers
    .filter(u => u.gakinStatus === "GAKIN")
    .map((u, i) => {
      gakinNiks.add(u.nik);
      return {
        id: i + 1,
        nik: u.nik,
        nama: u.fullName,
        kecamatan: u.kecamatanKtp || "Surabaya",
        kelurahan: u.kelurahanKtp || "Surabaya",
        usia: calcAge(u.tanggalLahir),
        type: "GAKIN" as const,
        jenisKelamin: u.jenisKelamin || "Laki-laki",
        phone: u.phone || "-",
        pendidikan: u.pendidikan || "-",
        agama: u.agama || "-",
      };
    });

  // GAKIN yang ditambahkan via admin (ada di localStorage tapi BUKAN dari MOCK_USERS)
  const registeredUsers = getUsers();
  const addedGakin = registeredUsers
    .filter(u => u.gakinStatus === "GAKIN" && !gakinNiks.has(u.nik))
    .map((u, i) => ({
      id: gakinItems.length + i + 1,
      nik: u.nik,
      nama: u.fullName,
      kecamatan: u.kecamatanKtp || "Surabaya",
      kelurahan: u.kelurahanKtp || "Surabaya",
      usia: calcAge(u.tanggalLahir),
      type: "GAKIN" as const,
      jenisKelamin: u.jenisKelamin || "Laki-laki",
      phone: u.phone || "-",
      pendidikan: u.pendidikan || "-",
      agama: u.agama || "-",
    }));

  // Non-GAKIN: hanya yang sudah register (ada di localStorage)
  const allGakinCount = gakinItems.length + addedGakin.length;
  const nonGakinRegistered = registeredUsers
    .filter(u => u.gakinStatus !== "GAKIN")
    .map((u, i) => ({
      id: allGakinCount + i + 1,
      nik: u.nik,
      nama: u.fullName,
      kecamatan: u.kecamatanKtp || "Surabaya",
      kelurahan: u.kelurahanKtp || "Surabaya",
      usia: calcAge(u.tanggalLahir),
      type: "Non-GAKIN" as const,
      jenisKelamin: u.jenisKelamin || "Laki-laki",
      phone: u.phone || "-",
      pendidikan: u.pendidikan || "-",
      agama: u.agama || "-",
    }));

  return [...gakinItems, ...addedGakin, ...nonGakinRegistered];
}

// Keep backward compat export
export const INITIAL_DATA = getDataItems();

export type DataItem = ReturnType<typeof getDataItems>[0];
