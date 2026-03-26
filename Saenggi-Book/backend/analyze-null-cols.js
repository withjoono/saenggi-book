const XLSX = require('xlsx');
const path = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209_상세계열채움.xlsx';
const wb = XLSX.readFile(path);

const sheet = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 헤더 행들 출력
console.log('=== Row 0 (헤더 1) ===');
console.log(rawData[0]);

console.log('\n=== Row 1 (헤더 2) ===');
console.log(rawData[1]);

// 데이터 행
const dataRows = rawData.slice(2);

// 각 컬럼별 NULL 비율 분석
console.log('\n=== 컬럼별 NULL 비율 ===');
const header0 = rawData[0] || [];
const header1 = rawData[1] || [];

for (let col = 0; col < Math.max(header0.length, header1.length, 100); col++) {
  const nullCount = dataRows.filter(r => !r[col] && r[col] !== 0).length;
  const fillCount = dataRows.filter(r => r[col] || r[col] === 0).length;
  const nullRatio = (nullCount / dataRows.length * 100).toFixed(1);

  if (nullCount > 0 && nullCount < dataRows.length) {
    const h0 = header0[col] || '';
    const h1 = header1[col] || '';
    const headerName = h0 || h1 || `Col${col}`;
    console.log(`Col ${col}: ${headerName} - NULL: ${nullCount} (${nullRatio}%), 채움: ${fillCount}`);
  }
}

// 점수환산 컬럼 찾기
console.log('\n=== 점수환산 관련 컬럼 찾기 ===');
for (let col = 0; col < header0.length; col++) {
  const h = (header0[col] || '').toString();
  if (h.includes('환산') || h.includes('통합') || h.includes('백') || h.includes('표')) {
    console.log(`Col ${col}: ${header0[col]}`);
  }
}

// 샘플 데이터 확인 (처음 5행의 모든 컬럼)
console.log('\n=== 샘플 데이터 (처음 3행) ===');
for (let i = 0; i < 3; i++) {
  console.log(`\nRow ${i + 2}:`);
  const row = dataRows[i];
  for (let col = 0; col < 50; col++) {
    if (row[col] !== undefined && row[col] !== '') {
      const h0 = header0[col] || '';
      const h1 = header1[col] || '';
      console.log(`  [${col}] ${h0}/${h1}: ${row[col]}`);
    }
  }
}

// 수능요소/수능조합 컬럼 찾기
console.log('\n=== 수능요소/수능조합 컬럼 ===');
for (let col = 0; col < 100; col++) {
  const h0 = (header0[col] || '').toString();
  const h1 = (header1[col] || '').toString();
  if (h0.includes('수능') || h1.includes('수능') || h1.includes('조합') || h1.includes('요소')) {
    console.log(`Col ${col}: h0="${h0}", h1="${h1}"`);
    // 샘플 값
    const samples = dataRows.slice(0, 5).map(r => r[col]).filter(v => v);
    console.log(`  샘플: ${samples.join(', ')}`);
  }
}
