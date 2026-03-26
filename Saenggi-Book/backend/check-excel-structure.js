const XLSX = require('xlsx');

// Excel 파일 읽기
console.log('📖 Reading Excel file...');
const workbook = XLSX.readFile('./uploads/ss_26_jonghap_recruitment.xlsx');
const sheetName = workbook.SheetNames[0];
console.log(`📋 Sheet name: ${sheetName}`);

const worksheet = workbook.Sheets[sheetName];

// 원시 데이터 확인 (첫 5행)
console.log('\n=== Raw data (first 5 rows) ===');
const range = XLSX.utils.decode_range(worksheet['!ref']);
for (let R = range.s.r; R <= Math.min(range.s.r + 4, range.e.r); ++R) {
  let row = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
    const cell = worksheet[cell_address];
    row.push(cell ? cell.v : undefined);
  }
  console.log(`Row ${R}:`, row.slice(0, 20)); // 첫 20개 컬럼만 출력
}

// JSON으로 변환 (헤더 포함)
console.log('\n=== JSON data (first 3 rows) ===');
const jsonData = XLSX.utils.sheet_to_json(worksheet);
console.log('Total rows:', jsonData.length);
console.log('\nFirst row:', JSON.stringify(jsonData[0], null, 2));
if (jsonData.length > 1) {
  console.log('\nSecond row:', JSON.stringify(jsonData[1], null, 2));
}
