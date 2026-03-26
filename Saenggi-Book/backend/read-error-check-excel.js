// read-error-check-excel.js
// 오류 체크 Excel 파일 읽기

const XLSX = require('xlsx');

const workbook = XLSX.readFile('uploads/환산점수 오류 체크 1215.xlsx');
console.log('시트 이름:', workbook.SheetNames);

// 첫 번째 시트 읽기
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== 시트 데이터 (처음 30행) ===');
data.slice(0, 30).forEach((row, idx) => {
  console.log(`행 ${idx + 1}:`, row);
});

// 동아대 데이터 찾기
console.log('\n=== 동아대 관련 데이터 ===');
data.forEach((row, idx) => {
  if (row.some(cell => String(cell).includes('동아'))) {
    console.log(`행 ${idx + 1}:`, row);
  }
});

// 컬럼 헤더 확인
console.log('\n=== 컬럼 헤더 ===');
console.log(data[0]);
