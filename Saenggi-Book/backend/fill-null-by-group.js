const XLSX = require('xlsx');
const path = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209_상세계열채움.xlsx';
const wb = XLSX.readFile(path);

const sheet = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 헤더
const headers = rawData.slice(0, 2);
const dataRows = rawData.slice(2);

// 컬럼 인덱스
const COL = {
  대학명: 1,
  수능요소: 13, // 백+백, 표+변 등
};

// NULL이 많은 컬럼들 (채워야 할 컬럼)
const nullCols = [9, 10, 11, 12, 20, 22, 23, 27, 28, 31, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 82, 83];

console.log('=== 그룹핑 기준 확인 ===');
console.log('대학명 + 수능요소 조합으로 그룹핑합니다.\n');

// 그룹별로 데이터 수집
// 키: "대학명|수능요소"
const groups = {};

dataRows.forEach((row, idx) => {
  const univ = row[COL.대학명] || '';
  const scoreType = row[COL.수능요소] || '';
  const key = `${univ}|${scoreType}`;

  if (!groups[key]) {
    groups[key] = [];
  }
  groups[key].push({ idx, row });
});

console.log('총 그룹 수:', Object.keys(groups).length);

// 샘플 그룹 확인
console.log('\n=== 샘플 그룹 (가천대학교) ===');
Object.keys(groups).filter(k => k.startsWith('가천')).forEach(k => {
  const g = groups[k];
  console.log(`${k}: ${g.length}개 행`);
  // 첫 행의 Col 9 값
  const vals = g.map(item => item.row[9]);
  const nullCount = vals.filter(v => v === undefined || v === '').length;
  console.log(`  Col9(수능) - 채움: ${vals.filter(v => v !== undefined && v !== '').length}, NULL: ${nullCount}`);
});

// 각 그룹에서 채워진 값으로 빈 값 채우기
let totalFilled = 0;

Object.keys(groups).forEach(key => {
  const group = groups[key];

  // 각 컬럼별로 처리
  nullCols.forEach(col => {
    // 그룹 내에서 채워진 값 찾기
    let filledValue = null;
    for (const item of group) {
      const val = item.row[col];
      if (val !== undefined && val !== '' && val !== null) {
        filledValue = val;
        break;
      }
    }

    // 채워진 값이 있으면 빈 값들 채우기
    if (filledValue !== null) {
      for (const item of group) {
        if (item.row[col] === undefined || item.row[col] === '' || item.row[col] === null) {
          dataRows[item.idx][col] = filledValue;
          totalFilled++;
        }
      }
    }
  });
});

console.log('\n=== 채움 결과 ===');
console.log('총 채워진 셀:', totalFilled);

// 여전히 NULL인 컬럼 확인
console.log('\n=== 처리 후 NULL 현황 ===');
nullCols.forEach(col => {
  const nullCount = dataRows.filter(r => r[col] === undefined || r[col] === '' || r[col] === null).length;
  if (nullCount > 0) {
    const h0 = headers[0][col] || '';
    const h1 = headers[1][col] || '';
    console.log(`Col ${col} (${h0}/${h1}): ${nullCount}개 NULL`);
  }
});

// 새 엑셀 파일 저장
const newData = [...headers, ...dataRows];
const newSheet = XLSX.utils.aoa_to_sheet(newData);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newSheet, 'Sheet1');

const outputPath = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209_채움완료.xlsx';
XLSX.writeFile(newWb, outputPath);

console.log('\n=== 저장 완료 ===');
console.log('파일:', outputPath);
