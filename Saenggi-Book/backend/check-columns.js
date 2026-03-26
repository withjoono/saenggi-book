const XLSX = require('xlsx');
const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== 컬럼 구조 분석 ===\n');

// 헤더 행들 (1-7행)
console.log('헤더 행 분석:');
for (let i = 1; i <= 7; i++) {
  console.log(`\n${i}행:`, data[i]);
}

// 첫 데이터 행
console.log('\n\n=== 첫 데이터 행 (8행) ===');
data[8].forEach((val, idx) => {
  console.log(`[${idx}] = ${val}`);
});

// 실제 데이터 행 (가천대 관광경영학과)
console.log('\n\n=== 실제 데이터 행 (9행 - 가천대 관광경영학과) ===');
data[9].forEach((val, idx) => {
  console.log(`[${idx}] = ${val}`);
});
