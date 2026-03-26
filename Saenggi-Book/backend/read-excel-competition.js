const XLSX = require('xlsx');
const fs = require('fs');

// Excel 파일 읽기
const filePath = './UWAY_수시_경쟁률_V5_2026-01-06.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // JSON으로 변환
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log('총 데이터 개수:', data.length);
  console.log('\n첫 번째 데이터 샘플:');
  console.log(JSON.stringify(data[0], null, 2));

  console.log('\n두 번째 데이터 샘플:');
  console.log(JSON.stringify(data[1], null, 2));

  console.log('\n세 번째 데이터 샘플:');
  console.log(JSON.stringify(data[2], null, 2));

  console.log('\n모든 컬럼명:');
  console.log(Object.keys(data[0]));

  // JSON 파일로 저장
  fs.writeFileSync('./competition-rate-data.json', JSON.stringify(data, null, 2));
  console.log('\n✅ JSON 파일로 저장 완료: competition-rate-data.json');

} catch (error) {
  console.error('❌ 에러 발생:', error.message);
}
