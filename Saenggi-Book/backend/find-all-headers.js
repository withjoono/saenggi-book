const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, 'uploads', '교과 학종 out 240823.xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = '교과';
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // 행 1이 헤더 (행 0은 비어있음)
  const headers = data[1];

  console.log('전체 헤더 목록 (총 ' + headers.length + '개):');
  headers.forEach((header, idx) => {
    if (header !== undefined && header !== null && header !== '') {
      const headerStr = header.toString().toLowerCase().trim();
      // df 또는 de를 포함하거나, 등급/컷 관련 헤더 표시
      if (headerStr === 'df' || headerStr === 'de' ||
          headerStr.includes('등급') || headerStr.includes('컷') ||
          headerStr.includes('cut') || (idx >= 100 && idx <= 120)) {
        console.log(`  [${idx}] "${header}" ${headerStr === 'df' ? '<<< 50%컷' : headerStr === 'de' ? '<<< 70%컷' : ''}`);
      }
    }
  });

  // 100~120 인덱스 구간의 모든 값 출력
  console.log('\n\n인덱스 100~120 구간의 모든 헤더:');
  for (let i = 100; i <= Math.min(120, headers.length - 1); i++) {
    console.log(`  [${i}] "${headers[i] || ''}"`);
  }

  // 실제 데이터에서 해당 컬럼 값 확인
  console.log('\n\n데이터 샘플 (행 2, 인덱스 100~120):');
  const sampleRow = data[2];
  for (let i = 100; i <= Math.min(120, sampleRow.length - 1); i++) {
    console.log(`  [${i}] ${sampleRow[i] || 'null'}`);
  }
} catch (error) {
  console.error('에러:', error.message);
}
