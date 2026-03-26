/**
 * Excel 파일의 컬럼 확인
 */

const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, 'uploads', 'ss_26_kyokwa_recruitment.xlsx');

try {
  console.log('📖 Excel 파일 읽기:', EXCEL_FILE);
  const workbook = XLSX.readFile(EXCEL_FILE);

  console.log('\n📋 시트 목록:');
  workbook.SheetNames.forEach((name, i) => {
    console.log(`  ${i + 1}. ${name}`);
  });

  const sheetName = workbook.SheetNames[0];
  console.log(`\n✅ 첫 번째 시트 사용: ${sheetName}`);

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`\n📊 총 ${data.length}개 행`);
  console.log('\n🔤 컬럼명 (첫 번째 행):');
  const headers = data[0];
  headers.forEach((header, i) => {
    console.log(`  ${i + 1}. ${header}`);
  });

  console.log('\n📝 샘플 데이터 (두 번째 행):');
  if (data.length > 1) {
    const sampleRow = data[1];
    headers.forEach((header, i) => {
      console.log(`  ${header}: ${sampleRow[i]}`);
    });
  }

} catch (error) {
  console.error('❌ 오류:', error.message);
}
