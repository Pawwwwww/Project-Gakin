/**
 * Script to convert Excel data into hardcoded TypeScript data files.
 * 
 * Data Responden.xlsx → Sheet "Detail" → respondent profiles (UserRecord[])
 * Data Hasil Skoring.xlsx → Sheets "Demografi", "GRIT", "Kometensi Wirausaha", "TIPI" → scoring results
 * 
 * NIK asterisks are replaced with random digits.
 * All respondents are GAKIN type.
 */

import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Mapping tables (from the demografi image) ──
const MEMILIKI_USAHA = { 1: "Ya", 0: "Tidak" };
const SURABAYA_AREA = { 1: "Utara", 2: "Selatan", 3: "Pusat", 4: "Barat", 5: "Timur" };
const DAERAH_ASAL = { 1: "Surabaya", 2: "Luar Surabaya", 3: "Luar Jawa Timur", 4: "Luar Jawa", 5: "" };
const PENDIDIKAN = { 1: "Tidak tamat SD", 2: "SD", 3: "SLTP", 4: "SLTA", 5: "> S1" };
const AGAMA = { 1: "Islam", 2: "Kristen/Protestan", 3: "Budha", 4: "Hindu", 5: "Kepercayaan" };
const SUKU = { 1: "Jawa", 2: "Madura", 3: "Bali", 4: "Batak", 5: "Lainnya" };
const BIDANG_USAHA = { 0: "-", 1: "Makanan/Minuman", 2: "Perdagangan Kecil", 3: "Jasa", 4: "Tukang/Teknik", 5: "Lainnya" };
const PENGHASILAN = { 1: "< 100.000", 2: "100.000 - 250.000", 3: "251.000 - 500.000", 4: "501.000 - 1.000.000", 5: "> 1.000.000" };
const LAMA_USAHA = { 0: "-", 1: "< 1 tahun", 2: "1-2 tahun", 3: "3-5 tahun", 4: "3-5 tahun", 5: "> 5 tahun" };
const GANTI_USAHA = { 0: "-", 1: "0", 2: "1-2 kali", 3: "3-4 kali", 4: "> 4 kali" };

function generateNIK16(nikRaw) {
  if (!nikRaw) return '3578000000000000';
  const s = String(nikRaw);
  // Extract visible digits (non-asterisk chars)
  const prefix = [];
  const suffix = [];
  let inAsterisks = false;
  for (const ch of s) {
    if (ch === '*') {
      inAsterisks = true;
    } else if (!inAsterisks) {
      prefix.push(ch);
    } else {
      suffix.push(ch);
    }
  }
  // Build a 16-digit NIK: prefix + random middle + suffix
  const prefixStr = prefix.join('');
  const suffixStr = suffix.join('');
  const middleLen = 16 - prefixStr.length - suffixStr.length;
  let middle = '';
  for (let i = 0; i < middleLen; i++) {
    middle += String(Math.floor(Math.random() * 10));
  }
  return prefixStr + middle + suffixStr;
}

// ── Read Excel files ──
const respWb = XLSX.readFile(join(__dirname, 'Data Responden.xlsx'));
const skorWb = XLSX.readFile(join(__dirname, 'Data Hasil Skoring.xlsx'));

// ── Parse Detail sheet (respondent profiles) ──
const detailRows = XLSX.utils.sheet_to_json(respWb.Sheets['Detail'], { header: 1, defval: '' }).slice(1).filter(r => r[2]);
console.log(`Detail rows: ${detailRows.length}`);

// ── Parse scoring sheets ──
const demoRows = XLSX.utils.sheet_to_json(skorWb.Sheets['Demografi'], { header: 1, defval: '' }).slice(1).filter(r => r[1] !== '');
const gritRows = XLSX.utils.sheet_to_json(skorWb.Sheets['GRIT'], { header: 1, defval: '' }).slice(1).filter(r => r[0] !== '');
const kwuRows = XLSX.utils.sheet_to_json(skorWb.Sheets['Kometensi Wirausaha'], { header: 1, defval: '' }).slice(1).filter(r => r[0] !== '');
const tipiRows = XLSX.utils.sheet_to_json(skorWb.Sheets['TIPI'], { header: 1, defval: '' }).slice(1).filter(r => r[0] !== '');

console.log(`Demografi: ${demoRows.length}, GRIT: ${gritRows.length}, KWU: ${kwuRows.length}, TIPI: ${tipiRows.length}`);

// Use the minimum count to align rows
const count = Math.min(detailRows.length, demoRows.length, gritRows.length, kwuRows.length, tipiRows.length);
console.log(`Using ${count} aligned rows`);

// ── Build MOCK_USERS ──
const users = [];
const seenNiks = new Set();

for (let i = 0; i < count; i++) {
  const detail = detailRows[i];
  const demo = demoRows[i];
  
  // Detail: [NO KK, NIK, NAMA, KECAMATAN, KELURAHAN, RT, RW, ALAMAT]
  let nik = generateNIK16(detail[1]);
  // Ensure unique NIK
  while (seenNiks.has(nik)) {
    nik = generateNIK16(detail[1]);
  }
  seenNiks.add(nik);
  
  const nama = String(detail[2] || '').trim();
  const kecamatan = String(detail[3] || '').trim();
  const kelurahan = String(detail[4] || '').trim();
  const rt = String(detail[5] || '').trim();
  const rw = String(detail[6] || '').trim();
  const alamat = String(detail[7] || '').trim();
  
  // Demografi: [Memiliki usaha, Kecamatan, Kelurahan, Surabaya, Daerah Asal, Usia, Kode Usia, Pendidikan, Agama, Suku, Bidang Usaha, Penghasilan, Lama Usaha, Ganti Usaha]
  const memilikiUsaha = MEMILIKI_USAHA[demo[0]] || "Tidak";
  const usia = parseInt(demo[5]) || 30;
  const pendidikan = PENDIDIKAN[demo[7]] || "-";
  const agama = AGAMA[demo[8]] || "-";
  const suku = SUKU[demo[9]] || "-";
  const bidangUsaha = BIDANG_USAHA[demo[10]] || "-";
  const penghasilan = PENGHASILAN[demo[11]] || "-";
  const lamaUsaha = LAMA_USAHA[demo[12]] || "-";
  const gantiUsaha = GANTI_USAHA[demo[13]] || "-";
  
  // Generate a plausible birth year from age
  const birthYear = 2025 - usia;
  const birthMonth = String(((i * 7 + 3) % 12) + 1).padStart(2, '0');
  const birthDay = String(((i * 13 + 5) % 28) + 1).padStart(2, '0');

  users.push({
    nik,
    fullName: nama,
    jenisKelamin: i % 2 === 0 ? "Laki-laki" : "Perempuan", // Not in detail sheet, alternate
    tempatLahir: "Surabaya",
    tanggalLahir: `${birthYear}-${birthMonth}-${birthDay}`,
    phone: "-",
    alamatKtp: alamat,
    rtKtp: rt,
    rwKtp: rw,
    kelurahanKtp: kelurahan,
    kecamatanKtp: kecamatan,
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "-",
    isSurabaya: true,
    pendidikan,
    agama,
    suku,
    punyaUsaha: memilikiUsaha.toLowerCase() === "ya" ? "ya" : "tidak",
    bidangUsaha,
    penghasilanPerHari: penghasilan,
    lamaBerusaha: lamaUsaha,
    gantiUsaha,
    gakinStatus: "GAKIN",
  });
}

// ── Build MOCK_RESULTS (kuesioner submissions) ──
const results = [];
for (let i = 0; i < count; i++) {
  const grit = {};
  for (let g = 0; g < 12; g++) {
    grit[g + 1] = parseInt(gritRows[i][g]) || 1;
  }
  
  const kwu = {};
  for (let k = 0; k < 15; k++) {
    kwu[k + 1] = parseInt(kwuRows[i][k]) || 1;
  }
  
  const tipi = {};
  for (let t = 0; t < 10; t++) {
    tipi[t + 1] = parseInt(tipiRows[i][t]) || 1;
  }
  
  results.push({
    nik: users[i].nik,
    nama: users[i].fullName,
    tanggal: new Date(Date.now() - (i * 86400000)).toISOString(),
    data: { consent: true, grit, kwu, tipi },
  });
}

// ── Generate TypeScript output ──
let ts = `// ═══════════════════════════════════════════════════════════════
//  MOCK DATA — Auto-generated from Excel files
//  Data Responden.xlsx (Detail sheet) + Data Hasil Skoring.xlsx
//  All respondents are GAKIN type
//  NIK asterisks replaced with random digits
// ═══════════════════════════════════════════════════════════════

import { UserRecord, KuesionerSubmission } from "../services/StorageService";
import { KuesionerData } from "../entities/respondent";

// ── Known admin/test users ──
export const KNOWN_USERS = [
  {
    nik: "3578010205060001",
    fullName: "Yusuf Fawwaz Kurniawan Djuhara",
    jenisKelamin: "Laki-laki",
    tanggalLahir: "2006-05-02",
    gakinStatus: "Non-GAKIN",
  },
  {
    nik: "3524016807040001",
    fullName: "Adelia Rova Chumairo",
    jenisKelamin: "Perempuan",
    tanggalLahir: "2004-07-28",
    gakinStatus: "Non-GAKIN",
  }
];

export const MOCK_USERS: UserRecord[] = [
  ...KNOWN_USERS.map((u) => ({
    ...u,
    tempatLahir: "Surabaya",
    phone: "08123000000",
    alamatKtp: "Jl. Known User No. 1",
    rtKtp: "01",
    rwKtp: "02",
    kelurahanKtp: "Kebraon",
    kecamatanKtp: "Karang Pilang",
    kotaKtp: "Surabaya",
    provinsiKtp: "Jawa Timur",
    kodePosKtp: "60222",
    isSurabaya: true,
    pendidikan: "SMA",
    agama: "Islam",
    suku: "Jawa",
    punyaUsaha: "Tidak",
    bidangUsaha: "-",
    penghasilanPerHari: "-",
    lamaBerusaha: "-",
    gantiUsaha: "-",
  } as UserRecord)),
`;

// Add each hardcoded user
for (const u of users) {
  ts += `  ${JSON.stringify(u, null, 0).replace(/"/g, '"')} as UserRecord,\n`;
}

ts += `];

export const MOCK_RESULTS: KuesionerSubmission[] = [
`;

for (const r of results) {
  ts += `  ${JSON.stringify(r, null, 0).replace(/"/g, '"')} as KuesionerSubmission,\n`;
}

ts += `];
`;

writeFileSync(join(__dirname, 'mockData.generated.ts'), ts, 'utf8');
console.log(`\n✅ Generated mockData.generated.ts with ${users.length} users and ${results.length} results`);
