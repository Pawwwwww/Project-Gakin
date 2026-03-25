const fs = require('fs');
const path = require('path');

const dataRaw = fs.readFileSync(path.join(__dirname, 'parsedExcelData.json'));
const d = JSON.parse(dataRaw);

const users = [];
const kuesionerResults = [];

const gakin = d.gakin || [];
const demografi = d.demografi || [];
const grit = d.grit || [];
const kwu = d.kewirausahaan || [];
const tipi = d.tipi || [];

for (let i = 0; i < gakin.length; i++) {
  const gak = gakin[i];
  const demo = i < demografi.length ? demografi[i] : null;
  const gr = i < grit.length ? grit[i] : null;
  const kw = i < kwu.length ? kwu[i] : null;
  const tp = i < tipi.length ? tipi[i] : null;

  const nikValRaw = String(gak['NIK'] || '35780' + (10000000000 + i));
  const nikVal = nikValRaw.replace(/\*/g, '0');
  
  const user = {
    nik: nikVal,
    fullName: gak['NAMA'] || ('Responden ' + i),
    jenisKelamin: demo ? String(demo['Jenis Kelamin'] || '') : '',
    tempatLahir: '',
    tanggalLahir: '',
    phone: '-',
    alamatKtp: gak['ALAMAT'] || '',
    rtKtp: String(gak['RT'] || ''),
    rwKtp: String(gak['RW'] || ''),
    kelurahanKtp: gak['KELURAHAN'] || '',
    kecamatanKtp: gak['KECAMATAN'] || '',
    kotaKtp: 'Surabaya',
    provinsiKtp: 'Jawa Timur',
    kodePosKtp: '60272',
    isSurabaya: true,
    pendidikan: demo ? String(demo['Pendidikan'] || '') : '',
    agama: demo ? String(demo['Agama'] || '') : '',
    suku: demo ? String(demo['Suku'] || '') : '',
    punyaUsaha: demo && demo['Memiliki usaha'] == 1 ? 'ya' : 'tidak',
    bidangUsaha: demo ? String(demo['Bidang Usaha'] || '') : '',
    penghasilanPerHari: demo ? String(demo['Penghasilan'] || '') : '',
    lamaBerusaha: demo ? String(demo['Lama Usaha'] || '') : '',
    gantiUsaha: demo ? String(demo['Ganti Usaha'] || '') : '',
    gakinStatus: 'GAKIN'
  };

  users.push(user);

  if (gr && kw && tp) {
    const gritMap = {};
    for (let j = 1; j <= 12; j++) if (gr['G'+j] != null) gritMap[j] = Number(gr['G'+j]);

    const kwuMap = {};
    Object.keys(kw).forEach(key => {
        if (key.match(/^[Ww]\d+$/)) kwuMap[key.substring(1)] = Number(kw[key]);
    });

    const tipiMap = {};
    for (let j = 1; j <= 10; j++) if (tp['T'+j] != null) tipiMap[j] = Number(tp['T'+j]);

    kuesionerResults.push({
      nik: nikVal,
      nama: user.fullName,
      tanggal: new Date().toISOString(),
      data: {
        consent: true,
        grit: gritMap,
        kwu: kwuMap,
        tipi: tipiMap
      }
    });
  }
}

let fileContent = "import type { UserRecord, KuesionerSubmission } from '../services/StorageService';\n\n";
fileContent += "export const HARDCODED_USERS: UserRecord[] = " + JSON.stringify(users, null, 2) + ";\n\n";
fileContent += "export const HARDCODED_RESULTS: KuesionerSubmission[] = " + JSON.stringify(kuesionerResults, null, 2) + ";\n";

fs.writeFileSync(path.join(__dirname, 'hardcodedData.ts'), fileContent);
console.log('Successfully generated hardcodedData.ts');
