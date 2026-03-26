const XLSX = require('xlsx');

// Excel 파일 읽기
console.log('📖 Reading Excel file...');
const workbook = XLSX.readFile('uploads/ss_kyokwa_special_26.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

console.log(`Total rows: ${data.length}\n`);

// 헤더 확인
console.log('Column headers:');
const headers = Object.keys(data[0]);
headers.forEach(h => console.log(`  - ${h}`));

// 첫 10개 행 샘플 출력
console.log('\nFirst 10 rows:');
data.slice(0, 10).forEach((row, idx) => {
  console.log(`\nRow ${idx + 1}:`);
  Object.entries(row).forEach(([key, value]) => {
    if (value !== null) {
      console.log(`  ${key}: ${value}`);
    }
  });
});

// 특별전형 코드 확인
const specialCodes = new Set();
data.forEach(row => {
  if (row.ida === '특별' && row.ida_1) {
    specialCodes.add(row.ida_1);
  }
});

console.log('\n\nUnique special admission codes:');
console.log(Array.from(specialCodes).sort((a, b) => a - b).join(', '));
