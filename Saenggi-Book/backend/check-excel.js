const XLSX = require('xlsx');

const filePath = './uploads/26 정시 db 1209.xlsx';
const workbook = XLSX.readFile(filePath);

console.log('=== 시트 목록 ===');
console.log(workbook.SheetNames);

// 첫 번째 시트의 헤더 확인
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 'A' });

console.log('\n=== 첫 번째 행 (헤더) ===');
if (data[0]) {
  const headers = Object.entries(data[0]).slice(0, 30);
  headers.forEach(([col, val]) => {
    console.log(`${col}: ${val}`);
  });
}

console.log('\n=== 데이터 샘플 (2행) ===');
if (data[1]) {
  const sample = Object.entries(data[1]).slice(0, 20);
  sample.forEach(([col, val]) => {
    console.log(`${col}: ${val}`);
  });
}

console.log('\n=== 총 행 수 ===');
console.log(data.length);
