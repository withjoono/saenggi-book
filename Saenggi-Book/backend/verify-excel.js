const XLSX = require('xlsx');
const wb = XLSX.readFile('jungsi-calc-result-20251205.xlsx');
const ws = wb.Sheets['환산점수결과'];
const data = XLSX.utils.sheet_to_json(ws);

console.log('=== 엑셀 파일 검증 ===');
console.log('전체 행 수:', data.length);
console.log('');
console.log('=== 상위 15개 대학/학과 ===');
data.slice(0, 15).forEach((row, i) => {
  console.log(`${i+1}. ${row['대학명']} - ${row['환산식']} | 환산점수: ${row['환산점수']}`);
});
