const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, 'uploads', '교과 학종 out 240823.xlsx');

console.log('Excel 파일에서 df, de 컬럼 찾기...\n');

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = '교과';
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // 처음 10개 행을 확인하여 헤더 구조 파악
  console.log('처음 5개 행 출력 (첫 20개 컬럼):');
  for (let rowIdx = 0; rowIdx < Math.min(5, data.length); rowIdx++) {
    console.log(`\n=== 행 ${rowIdx} ===`);
    const row = data[rowIdx];
    for (let colIdx = 0; colIdx < Math.min(20, row.length); colIdx++) {
      if (row[colIdx] !== undefined && row[colIdx] !== null && row[colIdx] !== '') {
        console.log(`  [${colIdx}] ${row[colIdx]}`);
      }
    }
  }

  // 모든 행을 검사하여 'df', 'de' 문자열을 포함하는 셀 찾기
  console.log('\n\n"df" 또는 "de"를 포함하는 모든 셀 찾기:');
  let foundDf = false;
  let foundDe = false;

  for (let rowIdx = 0; rowIdx < Math.min(10, data.length); rowIdx++) {
    const row = data[rowIdx];
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cell = row[colIdx];
      if (cell !== undefined && cell !== null) {
        const cellStr = cell.toString().toLowerCase().trim();
        if (cellStr === 'df' || cellStr.includes('df')) {
          console.log(`  "df" 찾음: 행 ${rowIdx}, 열 ${colIdx}, 값: "${cell}"`);
          foundDf = true;
        }
        if (cellStr === 'de' || cellStr.includes('de')) {
          console.log(`  "de" 찾음: 행 ${rowIdx}, 열 ${colIdx}, 값: "${cell}"`);
          foundDe = true;
        }
      }
    }
  }

  if (!foundDf || !foundDe) {
    console.log('\n\ndf, de를 찾지 못했습니다. 더 넓은 범위 검색 중...');
    // 더 넓은 범위에서 검색
    for (let rowIdx = 0; rowIdx < Math.min(20, data.length); rowIdx++) {
      const row = data[rowIdx];
      row.forEach((cell, colIdx) => {
        if (cell !== undefined && cell !== null) {
          const cellStr = cell.toString().trim();
          // 정확히 'df' 또는 'de'인 경우
          if (cellStr === 'df' || cellStr === 'de') {
            console.log(`  정확히 "${cellStr}" 찾음: 행 ${rowIdx}, 열 ${colIdx}`);
          }
        }
      });
    }
  }

  // 실제 데이터 행 샘플 출력
  console.log('\n\n실제 데이터 행 샘플 (행 5~7):');
  for (let rowIdx = 5; rowIdx < Math.min(8, data.length); rowIdx++) {
    console.log(`\n행 ${rowIdx}:`);
    const row = data[rowIdx];
    console.log('  전체 길이:', row.length);
    console.log('  처음 10개 값:', row.slice(0, 10));
  }
} catch (error) {
  console.error('에러:', error.message);
}
