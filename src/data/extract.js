import { readFile, utils } from 'xlsx';
import { writeFileSync } from 'fs';

const FILE_PATH = 'c:\\Users\\Fawwazz\\.vscode\\anu\\src\\data\\Data gakin responden.xlsx';

try {
  const workbook = readFile(FILE_PATH);
  const data = {};

  const sheetsToRead = ['Detail', 'Demografi', 'GRIT', 'Kewirausahaan', 'TIPI'];
  
  for (const sheetName of sheetsToRead) {
    if (workbook.Sheets[sheetName]) {
      const sheetData = utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
      data[sheetName] = sheetData;
    } else {
      console.log(`Sheet not found: ${sheetName}. Available sheets:`, workbook.SheetNames);
    }
  }

  writeFileSync('c:\\Users\\Fawwazz\\.vscode\\anu\\src\\data\\parsedExcelData.json', JSON.stringify(data, null, 2));
  console.log('Successfully saved to parsedExcelData.json');
} catch (e) {
  console.error("Error reading file:", e);
}
