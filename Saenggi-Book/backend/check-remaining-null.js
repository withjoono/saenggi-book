const XLSX = require('xlsx');
const path = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209_채움완료.xlsx';
const wb = XLSX.readFile(path);

const sheet = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const dataRows = rawData.slice(2);

// Col 9 (수능)이 NULL인 행들
const nullRows = dataRows.filter(r => r[9] === undefined || r[9] === '' || r[9] === null);

console.log('=== 여전히 NULL인 행: ', nullRows.length, '개 ===\n');

// 어떤 대학들인지
const univSet = new Set();
nullRows.forEach(r => univSet.add(r[1]));

console.log('=== 대학 목록 ===');
[...univSet].sort().forEach(u => {
  const count = nullRows.filter(r => r[1] === u).length;
  console.log(`  ${u}: ${count}개`);
});

console.log('\n=== 샘플 행 (처음 10개) ===');
nullRows.slice(0, 10).forEach((r, i) => {
  console.log(`${i+1}. ${r[1]} | ${r[6]} | 수능요소: ${r[13]}`);
});
