const { readFile, utils } = require('xlsx');
const { writeFileSync, existsSync } = require('fs');

const GAKIN_FILE = 'c:\\Users\\Fawwazz\\.vscode\\anu\\src\\data\\Data gakin responden.xlsx';
const SCORE_FILE = 'c:\\Users\\Fawwazz\\.vscode\\anu\\src\\data\\DATA SET Form Skoring Skala KMMT edit ILHAM.xlsx';

const data = {
  gakin: [],
  demografi: [],
  grit: [],
  kewirausahaan: [],
  tipi: []
};

try {
  if (existsSync(GAKIN_FILE)) {
    const wb1 = readFile(GAKIN_FILE);
    if (wb1.Sheets['Detail']) data.gakin = utils.sheet_to_json(wb1.Sheets['Detail'], { defval: null });
  }
  if (existsSync(SCORE_FILE)) {
    const wb2 = readFile(SCORE_FILE);
    const sheetsToRead = { 'Demografi': 'demografi', 'GRIT': 'grit', 'Kometensi Wirausaha': 'kewirausahaan', 'TIPI': 'tipi' };
    for (const [s, k] of Object.entries(sheetsToRead)) {
      if (wb2.Sheets[s]) data[k] = utils.sheet_to_json(wb2.Sheets[s], { defval: null });
    }
  }
  writeFileSync('c:\\Users\\Fawwazz\\.vscode\\anu\\src\\data\\parsedExcelData.json', JSON.stringify(data, null, 2));
} catch (e) {
  console.error(e);
}
