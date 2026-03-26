const XLSX = require('xlsx');

// 칼럼명을 인덱스로 변환
function colToIndex(col) {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 64);
  }
  return index - 1;
}

// 대학명+모집단위 정규화 (공백, 특수문자 제거)
function normalize(str) {
  if (!str) return '';
  return String(str).replace(/[\s\(\)\[\]·\-\_\.]/g, '').toLowerCase();
}

// 매칭 키 생성
function makeKey(univ, dept) {
  return normalize(univ) + '|' + normalize(dept);
}

console.log('=== 입결 데이터 싱크 작업 시작 ===\n');

// 1. 대상 파일 읽기
const targetPath = 'e:/Dev/github/GB-Back-Nest/uploads/25 정시 1205 out 2.xlsx';
const target = XLSX.readFile(targetPath);
const targetSheetName = target.SheetNames[0];
const targetSheet = target.Sheets[targetSheetName];
const targetData = XLSX.utils.sheet_to_json(targetSheet, { header: 1 });
console.log('대상 파일:', targetPath);
console.log('총 행 수:', targetData.length, '\n');

// 2. 2025 소스 파일 읽기 및 매핑 생성
const src2025Path = 'e:/Dev/github/GB-Back-Nest/uploads/2025정시-실제컷-정리.xlsx';
const src2025 = XLSX.readFile(src2025Path);
const src2025Data = XLSX.utils.sheet_to_json(src2025.Sheets[src2025.SheetNames[0]], { header: 1 });

const map2025 = {};
for (let i = 1; i < src2025Data.length; i++) {
  const row = src2025Data[i];
  const key = makeKey(row[1], row[2]); // 대학명, 모집단위
  if (key) {
    map2025[key] = {
      모집인원: row[3],
      경쟁률: row[4],
      충원합격순위: row[5],
      환산점수50: row[6],
      환산점수70: row[7],
      총점: row[8],
      백분위50: row[9],
      백분위70: row[10],
    };
  }
}
console.log('2025 데이터:', Object.keys(map2025).length, '개 매핑 생성');

// 3. 2024 소스 파일 읽기 및 매핑 생성
const src2024Path = 'e:/Dev/github/GB-Back-Nest/uploads/2024정시-실제컷-정리.xlsx';
const src2024 = XLSX.readFile(src2024Path);
const src2024Data = XLSX.utils.sheet_to_json(src2024.Sheets[src2024.SheetNames[0]], { header: 1 });

const map2024 = {};
for (let i = 1; i < src2024Data.length; i++) {
  const row = src2024Data[i];
  const key = makeKey(row[1], row[2]); // 대학명, 모집단위
  if (key) {
    map2024[key] = {
      모집인원: row[3],
      경쟁률: row[4],
      충원합격순위: row[5],
      환산점수50: row[6],
      환산점수70: row[7],
      총점: row[8],
      백분위50: row[9],
      백분위70: row[10],
    };
  }
}
console.log('2024 데이터:', Object.keys(map2024).length, '개 매핑 생성\n');

// 4. 대상 파일에 데이터 삽입
const CH = colToIndex('CH'); // 85
const CP = colToIndex('CP'); // 93

let match2025 = 0, match2024 = 0, noMatch = 0;

// 헤더 추가 (1행)
if (!targetData[0]) targetData[0] = [];
targetData[0][CH] = '2025 입결';
targetData[0][CP] = '2024 입결';

// 서브헤더 추가 (2행)
if (!targetData[1]) targetData[1] = [];
const subHeaders = ['모집인원', '경쟁률', '충원순위', '환산50%', '환산70%', '총점', '백분위50%', '백분위70%'];
for (let i = 0; i < 8; i++) {
  targetData[1][CH + i] = subHeaders[i];
  targetData[1][CP + i] = subHeaders[i];
}

// 데이터 행 처리 (3행부터)
for (let i = 2; i < targetData.length; i++) {
  const row = targetData[i];
  if (!row || !row[1]) continue;

  const univName = row[1]; // 대학명
  const deptName = row[6]; // 모집단위명
  const key = makeKey(univName, deptName);

  // 2025 데이터
  const data2025 = map2025[key];
  if (data2025) {
    row[CH] = data2025.모집인원;
    row[CH+1] = data2025.경쟁률;
    row[CH+2] = data2025.충원합격순위;
    row[CH+3] = data2025.환산점수50;
    row[CH+4] = data2025.환산점수70;
    row[CH+5] = data2025.총점;
    row[CH+6] = data2025.백분위50;
    row[CH+7] = data2025.백분위70;
    match2025++;
  }

  // 2024 데이터
  const data2024 = map2024[key];
  if (data2024) {
    row[CP] = data2024.모집인원;
    row[CP+1] = data2024.경쟁률;
    row[CP+2] = data2024.충원합격순위;
    row[CP+3] = data2024.환산점수50;
    row[CP+4] = data2024.환산점수70;
    row[CP+5] = data2024.총점;
    row[CP+6] = data2024.백분위50;
    row[CP+7] = data2024.백분위70;
    match2024++;
  }

  if (!data2025 && !data2024) {
    noMatch++;
  }
}

console.log('=== 매칭 결과 ===');
console.log('2025 매칭:', match2025, '건');
console.log('2024 매칭:', match2024, '건');
console.log('미매칭:', noMatch, '건\n');

// 5. 결과 저장
const newSheet = XLSX.utils.aoa_to_sheet(targetData);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newSheet, targetSheetName);

const outputPath = 'e:/Dev/github/GB-Back-Nest/uploads/25 정시 1205 out 2_synced.xlsx';
XLSX.writeFile(newWb, outputPath);
console.log('저장 완료:', outputPath);
