const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel 파일 읽기
const workbook = XLSX.readFile(path.join(__dirname, 'uploads', '대학 환산점수별 누적백분위.xlsx'));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 시트를 JSON으로 변환
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('총 행 수:', data.length);
console.log('총 열 수:', data[0]?.length);

// 헤더 추출 (대학/모집단위명)
const headers = data[0];

console.log('첫 번째 열 이름:', headers[0]);
console.log('대학 열 샘플:', headers.slice(1, 10));

// 데이터 구조: 각 대학별로 [백분위, 환산점수] 배열 생성
// 조회 방식: 주어진 환산점수보다 작거나 같은 환산점수를 가진 행의 백분위 찾기
const percentileLookup = {};

for (let colIdx = 1; colIdx < headers.length; colIdx++) {
  const univName = headers[colIdx];
  if (!univName) continue;

  // [백분위, 환산점수] 배열 생성 - 백분위 오름차순
  const scoreTable = [];

  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const percentile = data[rowIdx][0]; // 백분위 (%)
    const convertedScore = data[rowIdx][colIdx]; // 환산점수

    if (percentile !== undefined && convertedScore !== undefined && !isNaN(convertedScore)) {
      scoreTable.push([percentile, convertedScore]);
    }
  }

  // 백분위 오름차순 정렬 (0.01%, 0.02%, ... 100%)
  scoreTable.sort((a, b) => a[0] - b[0]);

  percentileLookup[univName] = scoreTable;
}

// 결과 저장
const outputPath = path.join(__dirname, 'src', 'modules', 'jungsi', 'calculation', 'data', 'percentile-lookup.json');

// 디렉토리 생성
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(percentileLookup, null, 2), 'utf-8');

console.log('\n변환 완료!');
console.log('출력 파일:', outputPath);
console.log('대학 수:', Object.keys(percentileLookup).length);

// 샘플 출력
const sampleUniv = '가천의학 이과';
if (percentileLookup[sampleUniv]) {
  console.log(`\n샘플 (${sampleUniv}) - 상위 10개:`, percentileLookup[sampleUniv].slice(0, 10));
  console.log(`샘플 (${sampleUniv}) - 하위 10개:`, percentileLookup[sampleUniv].slice(-10));
}

// 조회 함수 예시
function findPercentile(univName, convertedScore) {
  const table = percentileLookup[univName];
  if (!table) return null;

  // 환산점수가 해당 백분위의 점수보다 높거나 같으면 해당 백분위
  // 상위누적백분위: 낮은 값 = 상위권
  for (let i = 0; i < table.length; i++) {
    const [percentile, scoreThreshold] = table[i];
    if (convertedScore >= scoreThreshold) {
      return percentile;
    }
  }

  // 모든 점수보다 낮으면 100% (하위권)
  return 100;
}

// 테스트
console.log('\n조회 테스트:');
console.log(`가천의학 이과 - 점수 990 → 백분위:`, findPercentile('가천의학 이과', 990));
console.log(`가천의학 이과 - 점수 900 → 백분위:`, findPercentile('가천의학 이과', 900));
console.log(`가천의학 이과 - 점수 800 → 백분위:`, findPercentile('가천의학 이과', 800));
