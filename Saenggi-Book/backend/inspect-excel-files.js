const XLSX = require('xlsx');
const path = require('path');

// 파일 경로
const files = [
  'uploads/ss_univ_level.xlsx',
  'uploads/ss_kyeyeol_evalue_mun.xlsx',
  'uploads/ss_kyeyeol_evalue_lee.xlsx',
];

files.forEach((filePath) => {
  console.log('\n' + '='.repeat(80));
  console.log(`📄 파일: ${filePath}`);
  console.log('='.repeat(80));

  try {
    const workbook = XLSX.readFile(filePath);
    console.log(`\n시트 목록: ${workbook.SheetNames.join(', ')}\n`);

    // 첫 번째 시트만 분석
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    console.log(`📊 첫 번째 시트: "${firstSheetName}"`);
    console.log(`행 개수: ${data.length}`);

    if (data.length > 0) {
      console.log('\n컬럼 목록:');
      const columns = Object.keys(data[0]);
      columns.forEach((col, idx) => {
        console.log(`  ${idx + 1}. ${col}`);
      });

      console.log('\n샘플 데이터 (처음 3개 행):');
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
    }
  } catch (error) {
    console.error(`❌ 파일 읽기 실패: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(80));
