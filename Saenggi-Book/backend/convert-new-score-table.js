/**
 * 새로운 점수표 Excel -> JSON 변환
 * 점수표 - 26 정시 1205.xlsx -> 점수표-26-정시.json
 */

const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('uploads/점수표 - 26 정시 1205.xlsx');
console.log('시트 목록:', wb.SheetNames);

// Sheet1 데이터 읽기
const ws = wb.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(ws);

console.log('데이터 행 수:', data.length);

// 첫 번째 행의 키 출력 (대학명 목록)
const firstRow = data[0];
const universities = Object.keys(firstRow).filter(key =>
  !['과목', '표준점수', '백분위', '등급', '누적(%)'].includes(key)
);
console.log('대학/환산식 수:', universities.length);
console.log('대학/환산식 샘플:', universities.slice(0, 10));

// 기존 점수표 형식으로 변환
// { "국어": { "147": { "가천의학": 250, "가천통합백": 100, ... }, ... }, ... }
const scoreTable = {};

data.forEach(row => {
  const subject = row['과목'];
  const standardScore = row['표준점수'];

  if (!subject || standardScore === undefined) return;

  if (!scoreTable[subject]) {
    scoreTable[subject] = {};
  }

  const scoreData = {};
  universities.forEach(univ => {
    if (row[univ] !== undefined && row[univ] !== null && row[univ] !== '') {
      scoreData[univ] = row[univ];
    }
  });

  scoreTable[subject][standardScore] = scoreData;
});

// 과목별 점수 범위 출력
console.log('\n=== 과목별 표준점수 범위 ===');
Object.keys(scoreTable).forEach(subject => {
  const scores = Object.keys(scoreTable[subject]).map(Number).filter(n => !isNaN(n));
  if (scores.length > 0) {
    console.log(`${subject}: ${Math.min(...scores)} ~ ${Math.max(...scores)} (${scores.length}개)`);
  }
});

// JSON 파일로 저장
const outputPath = 'src/modules/jungsi/calculation/data/점수표-26-정시.json';
fs.writeFileSync(outputPath, JSON.stringify(scoreTable, null, 2), 'utf8');
console.log('\n✅ JSON 파일 저장 완료:', outputPath);

// dist 폴더에도 복사
const distPath = 'dist/src/modules/jungsi/calculation/data/점수표-26-정시.json';
try {
  fs.mkdirSync('dist/src/modules/jungsi/calculation/data', { recursive: true });
  fs.writeFileSync(distPath, JSON.stringify(scoreTable, null, 2), 'utf8');
  console.log('✅ dist 폴더에도 복사 완료:', distPath);
} catch (e) {
  console.log('dist 폴더 복사 실패 (서버 재시작 시 자동 복사됨)');
}

// 파일 크기 확인
const stats = fs.statSync(outputPath);
console.log('파일 크기:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
