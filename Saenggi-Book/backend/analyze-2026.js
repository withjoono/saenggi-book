const XLSX = require('xlsx');
const workbook = XLSX.readFile('./uploads/26 정시 계산식 2 out.xlsx');
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('=== 2026 정시 환산식 분석 ===\n');

// 컬럼 인덱스
const cols = {
  대학명: 0, 환산인자: 1, 수능반영방식: 2, 환산식코드: 3,
  국: 4, 수: 5, 영: 6, 탐: 7, 한: 8, 외: 9,
  선택2과목수: 10, 선택3과목수: 11, 탐구과목수: 12,
  필수: 13, 선택: 14, 가중택: 15, 추가가감: 16, 기본점수: 17,
  필수설명: 18, 선택설명: 19, 가중택설명: 20,
  수학선택: 21, 탐구합선택: 22, 한국사대체: 23, 제2외국어대체: 24
};

// 1. 과목 조합 패턴 분석
const patterns = {};
data.slice(1).forEach(row => {
  if (!row[cols.환산인자]) return;
  const key = `국${row[cols.국]||0}_수${row[cols.수]||0}_영${row[cols.영]||0}_탐${row[cols.탐]||0}_한${row[cols.한]||0}_외${row[cols.외]||0}`;
  if (!patterns[key]) patterns[key] = { count: 0, examples: [] };
  patterns[key].count++;
  if (patterns[key].examples.length < 2) {
    patterns[key].examples.push(row[cols.환산인자]);
  }
});

console.log('=== 과목 조합 패턴 (1=필수, 2=2선택, 3=3선택) ===');
Object.entries(patterns)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 20)
  .forEach(([key, val]) => {
    console.log(`${key}: ${val.count}개 (예: ${val.examples.join(', ')})`);
  });

// 2. 선택 공식 패턴 분석
console.log('\n=== 선택(LARGE/MAX) 공식 패턴 ===');
const selectPatterns = {};
data.slice(1).forEach(row => {
  const formula = row[cols.선택];
  if (formula && formula !== 0) {
    // 셀 참조 제거하고 패턴 추출
    const pattern = String(formula).replace(/[A-Z]\d*/g, '').replace(/\([^()]+\)/g, '(...)');
    if (!selectPatterns[pattern]) selectPatterns[pattern] = { count: 0, original: formula, examples: [] };
    selectPatterns[pattern].count++;
    if (selectPatterns[pattern].examples.length < 2) {
      selectPatterns[pattern].examples.push(row[cols.환산인자]);
    }
  }
});
Object.entries(selectPatterns)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 15)
  .forEach(([key, val]) => {
    console.log(`[${val.count}개] ${val.examples[0]}: ${val.original}`);
  });

// 3. 가중택 공식 패턴 분석
console.log('\n=== 가중택(가중치) 공식 패턴 ===');
const weightPatterns = {};
data.slice(1).forEach(row => {
  const formula = row[cols.가중택];
  if (formula && formula !== 0) {
    if (!weightPatterns[formula]) weightPatterns[formula] = { count: 0, examples: [] };
    weightPatterns[formula].count++;
    if (weightPatterns[formula].examples.length < 2) {
      weightPatterns[formula].examples.push(row[cols.환산인자]);
    }
  }
});
Object.entries(weightPatterns)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 15)
  .forEach(([key, val]) => {
    console.log(`[${val.count}개] ${val.examples[0]}: ${key.substring(0, 80)}...`);
  });

// 4. 추가가감 공식 패턴 분석
console.log('\n=== 추가가감 공식 패턴 ===');
const bonusPatterns = {};
data.slice(1).forEach(row => {
  const formula = row[cols.추가가감];
  if (formula && formula !== 0) {
    if (!bonusPatterns[formula]) bonusPatterns[formula] = { count: 0, examples: [] };
    bonusPatterns[formula].count++;
    if (bonusPatterns[formula].examples.length < 2) {
      bonusPatterns[formula].examples.push(row[cols.환산인자]);
    }
  }
});
Object.entries(bonusPatterns)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([key, val]) => {
    console.log(`[${val.count}개] ${val.examples[0]}: ${key.substring(0, 100)}...`);
  });

// 5. 특수 케이스 확인
console.log('\n=== 특수 케이스 (고려세, 경기, 이화 등) ===');
data.slice(1).forEach(row => {
  const name = row[cols.환산인자] || '';
  if (name.includes('고려세') || name.includes('경기') || name.includes('이화')) {
    console.log(`${name}: 국${row[cols.국]||'-'} 수${row[cols.수]||'-'} 영${row[cols.영]||'-'} 탐${row[cols.탐]||'-'}`);
  }
});

// 6. 누락 데이터 확인
console.log('\n=== 데이터 완성도 체크 ===');
let missingCount = { 탐구과목수: 0, 수학선택: 0, 탐구합선택: 0 };
data.slice(1).forEach(row => {
  if (!row[cols.탐구과목수]) missingCount.탐구과목수++;
  if (!row[cols.수학선택]) missingCount.수학선택++;
  if (!row[cols.탐구합선택]) missingCount.탐구합선택++;
});
console.log('탐구과목수 누락:', missingCount.탐구과목수);
console.log('수학선택 누락:', missingCount.수학선택);
console.log('탐구합선택 누락:', missingCount.탐구합선택);
console.log('총 행 수:', data.length - 1);
