// 환산점수 실패 대학 분석 및 직접 계산 테스트 스크립트
const fs = require('fs');
const path = require('path');

// ts-node 등록
require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.json'),
  compilerOptions: { module: 'commonjs', esModuleInterop: true },
  transpileOnly: true,
});

// 점수표 로드
const 점수표Path = path.join(__dirname, 'src/modules/jungsi/calculation/data/score-table-26-jungsi.json');
const 점수표 = JSON.parse(fs.readFileSync(점수표Path, 'utf-8'));

// calc-2026.ts에서 학교조건2026 추출 (직접 파싱)
const calc2026Path = path.join(__dirname, 'src/modules/jungsi/calculation/calculations/calc-2026.ts');
const calc2026Content = fs.readFileSync(calc2026Path, 'utf-8');

// 학교조건2026의 키들 추출
const schoolConditionKeys = [];
const regex = /^\s+([가-힣A-Za-z0-9]+):\s*\{/gm;
let match;
// const 학교조건2026: Record<string, 학교조건2026Type> = { 이후부터 }; 까지
const startIdx = calc2026Content.indexOf('const 학교조건2026: Record<string, 학교조건2026Type> = {');
const endIdx = calc2026Content.indexOf('};', startIdx) + 2;
const schoolConditionBlock = calc2026Content.substring(startIdx, endIdx);

while ((match = regex.exec(schoolConditionBlock)) !== null) {
  schoolConditionKeys.push(match[1]);
}

console.log(`=== 학교조건2026에 정의된 대학 수: ${schoolConditionKeys.length}개 ===\n`);

// 점수표의 모든 대학 키 추출 (국어 점수표에서)
const 점수표Universities = new Set();
const 국어점수표 = 점수표['국어'];
for (const score in 국어점수표) {
  const scoreData = 국어점수표[score];
  for (const univ in scoreData) {
    점수표Universities.add(univ);
  }
}
console.log(`=== 점수표에 정의된 대학 수: ${점수표Universities.size}개 ===\n`);

// 문제가 되는 대학들 검색
const targetUnivs = ['전남', '울산', '대전', '동신', '조선', '전북'];

console.log('=== 점수표에 있지만 학교조건2026에 없는 대학들 ===');
const missingInCondition = [];
for (const univ of 점수표Universities) {
  if (targetUnivs.some(t => univ.includes(t))) {
    if (!schoolConditionKeys.includes(univ)) {
      missingInCondition.push(univ);
      console.log(`❌ ${univ}: 점수표에는 있지만 학교조건2026에 없음`);
    }
  }
}

console.log('\n=== 학교조건2026에 있지만 점수표에 없는 대학들 ===');
const missingInScoreTable = [];
for (const univ of schoolConditionKeys) {
  if (targetUnivs.some(t => univ.includes(t))) {
    if (!점수표Universities.has(univ)) {
      missingInScoreTable.push(univ);
      console.log(`❌ ${univ}: 학교조건2026에는 있지만 점수표에 없음`);
    }
  }
}

console.log('\n=== 양쪽 모두에 있는 대학들 (점수표 값 확인) ===');
for (const univ of schoolConditionKeys) {
  if (targetUnivs.some(t => univ.includes(t))) {
    if (점수표Universities.has(univ)) {
      // 국어 140점 기준 점수표 값 확인
      const korScore = 국어점수표['140']?.[univ];
      const status = korScore === 0 ? '⚠️ 값=0' : korScore === undefined ? '❌ 값없음' : `✅ 값=${korScore}`;
      console.log(`${univ}: ${status}`);
    }
  }
}

// 점수표에서 0인 대학들 확인
console.log('\n=== 점수표에서 국어 140점이 0인 모든 대학 ===');
const zeroScoreUnivs = [];
for (const univ of 점수표Universities) {
  const korScore = 국어점수표['140']?.[univ];
  if (korScore === 0) {
    zeroScoreUnivs.push(univ);
  }
}
console.log(`총 ${zeroScoreUnivs.length}개 대학이 0점: ${zeroScoreUnivs.join(', ')}`);

// 학교조건2026에 없는 대학 전체 목록
console.log('\n=== 점수표에만 있고 학교조건2026에는 없는 전체 대학 목록 ===');
const allMissingInCondition = [];
for (const univ of 점수표Universities) {
  if (!schoolConditionKeys.includes(univ)) {
    allMissingInCondition.push(univ);
  }
}
console.log(`총 ${allMissingInCondition.length}개: ${allMissingInCondition.join(', ')}`);

// === 직접 계산 테스트 ===
const { calc정시환산점수2026 } = require('./src/modules/jungsi/calculation/calculations/calc-2026');

const testUniversities = [
  '울산인문', '울산자연', '울산의학', '울산간호',
  '전남인문', '전남농생', '전남의학',
  '전북인문', '전북이공', '전북의학',
  '대전통합', '대전한의', '대전간호',
  '동신한의',
  '조선사회', '조선자연', '조선의학',
];

async function runCalcTests() {
  console.log('\n\n=== 직접 계산 테스트 ===');
  console.log('입력: 국어 140, 수학(미적) 140, 영어 1등급, 한국사 1등급');
  console.log('탐구: 물리학Ⅰ 70, 화학Ⅰ 68 / 생활과윤리 70, 사회문화 68\n');

  for (const univ of testUniversities) {
    const isNatural = univ.includes('자연') || univ.includes('이공') ||
                      univ.includes('의학') || univ.includes('간호') || univ.includes('농생');

    const params = {
      학교: univ,
      이문과: isNatural ? '자연' : '인문',
      국어: { 과목: '국어', 표준점수: 140, 등급: 1, 백분위: 98 },
      수학: { 과목: '수학(미적)', 표준점수: 140, 등급: 1, 백분위: 98 },
      영어: { 과목: '영어', 표준점수: 1, 등급: 1, 백분위: 0 },
      한국사: { 과목: '한국사', 표준점수: 1, 등급: 1, 백분위: 0 },
      사탐1: isNatural ? undefined : { 과목: '생활과 윤리', 표준점수: 70, 등급: 1, 백분위: 98 },
      사탐2: isNatural ? undefined : { 과목: '사회·문화', 표준점수: 68, 등급: 1, 백분위: 97 },
      과탐1: isNatural ? { 과목: '물리학 Ⅰ', 표준점수: 70, 등급: 1, 백분위: 98 } : undefined,
      과탐2: isNatural ? { 과목: '화학 Ⅰ', 표준점수: 68, 등급: 1, 백분위: 97 } : undefined,
      제2외국어: undefined,
    };

    try {
      const result = await calc정시환산점수2026(params);
      if (result.success) {
        const score = result.내점수 ? result.내점수.toFixed(2) : 'N/A';
        console.log(`✅ ${univ}: ${score}점 (표점합: ${result.표점합})`);
      } else {
        console.log(`❌ ${univ}: 실패 - ${result.result}`);
      }
    } catch (error) {
      console.log(`💥 ${univ}: 예외 - ${error.message}`);
    }
  }
}

runCalcTests().catch(console.error);
