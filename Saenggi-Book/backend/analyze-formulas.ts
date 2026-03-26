// analyze-formulas.ts
// 불일치 대학들의 올바른 공식 분석

import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

// 테스트 입력
const testScores = {
  국어표준: 145,
  수학표준: 130,
  영어등급: 1,
  한국사등급: 2,
  생명표준: 69,
  화학표준: 68,
  국어백분위: 99,
  수학백분위: 95,
  영어백분위: 100,
  생명백분위: 92,
  화학백분위: 91,
};

// 점수표에서 환산점수 조회
function get점수표(과목: string, 점수: number | string, 학교: string): number {
  try {
    const 과목데이터 = 점수표[과목];
    if (!과목데이터) return 0;
    const 점수데이터 = 과목데이터[String(점수)];
    if (!점수데이터) return 0;
    const 환산점수 = 점수데이터[학교];
    if (환산점수 === undefined) return 0;
    return typeof 환산점수 === 'string' ? 0 : 환산점수;
  } catch {
    return 0;
  }
}

// LARGE 헬퍼 함수
function LARGE(arr: number[], n: number): number {
  const sorted = [...arr].sort((a, b) => b - a);
  return sorted[n - 1] || 0;
}

// 대학별 분석
const 분석대학들 = [
  { 학교: '서울간호', expected: 410.6 },
  { 학교: '이화간호', expected: 995.0248302335165 },
  { 학교: '고려세신약', expected: 973.8863405647252 },
  { 학교: '국민예체능', expected: 768 },
  { 학교: '을지간호2', expected: 1016.875 },
  { 학교: '지스트', expected: 477.5288669806272 },
  { 학교: '성균의학', expected: 676.93 },
  { 학교: '아주의학', expected: 934.10 },
  { 학교: '충북의학', expected: 992.26 },
  { 학교: '경기자전', expected: 98.95 },
  { 학교: '군산간호', expected: 1000.25 },
  { 학교: '신한통합3', expected: 992.5 },
];

console.log('=== 불일치 대학 공식 분석 ===\n');

분석대학들.forEach(({ 학교, expected }) => {
  console.log(`\n=== ${학교} (Expected: ${expected}) ===`);

  // 점수표 조회
  const 국어 = get점수표('국어', testScores.국어표준, 학교);
  const 수학 = get점수표('수학(미적)', testScores.수학표준, 학교);
  const 영어 = get점수표('영어', testScores.영어등급, 학교);
  const 한국사 = get점수표('한국사', testScores.한국사등급, 학교);
  const 생명 = get점수표('생명과학 Ⅰ', testScores.생명표준, 학교);
  const 화학 = get점수표('화학 Ⅰ', testScores.화학표준, 학교);

  console.log('점수표 값:');
  console.log(`  국어: ${국어}, 수학: ${수학}, 영어: ${영어}, 한국사: ${한국사}`);
  console.log(`  생명: ${생명}, 화학: ${화학}`);

  const 탐구합 = 생명 + 화학;
  const 탐구1 = Math.max(생명, 화학);
  const 점수표합 = 국어 + 수학 + 영어 + 한국사 + 생명 + 화학;

  console.log(`  탐구합(2과목): ${탐구합}, 탐구1(1과목): ${탐구1}`);
  console.log(`  점수표 전체합: ${점수표합}`);

  // 다양한 공식 시도
  const formulas: Array<{ name: string; value: number }> = [];

  // 1. 단순합
  formulas.push({ name: '국수영탐(2)', value: 국어 + 수학 + 영어 + 탐구합 });
  formulas.push({ name: '국수영탐(2)한', value: 국어 + 수학 + 영어 + 탐구합 + 한국사 });
  formulas.push({ name: '국영탐(2)', value: 국어 + 영어 + 탐구합 });
  formulas.push({ name: '국수탐(2)', value: 국어 + 수학 + 탐구합 });

  // 2. 가중택 (4+3+2+1)
  const arr4 = [국어, 수학, 영어, 탐구합];
  formulas.push({
    name: '가중택4(4321)',
    value: 4*LARGE(arr4,1) + 3*LARGE(arr4,2) + 2*LARGE(arr4,3) + 1*LARGE(arr4,4)
  });
  formulas.push({
    name: '가중택4(4321)한+',
    value: 4*LARGE(arr4,1) + 3*LARGE(arr4,2) + 2*LARGE(arr4,3) + 1*LARGE(arr4,4) + 한국사
  });

  // 3. 백분위 기반
  const 백분위합 = testScores.국어백분위 + testScores.수학백분위 + testScores.영어백분위 +
                   testScores.생명백분위 + testScores.화학백분위;
  formulas.push({ name: '백분위합', value: 백분위합 });
  formulas.push({ name: '백분위합*2', value: 백분위합 * 2 });
  formulas.push({ name: '백분위평균*10', value: 백분위합 / 5 * 10 });

  // 4. 표준점수 기반
  const 표준합 = testScores.국어표준 + testScores.수학표준 + testScores.생명표준 + testScores.화학표준;
  formulas.push({ name: '표준합(국수탐2)', value: 표준합 });
  formulas.push({ name: '표준합*비율', value: 표준합 * expected / 표준합 });

  // 5. 특수 계산 - 서울간호
  formulas.push({ name: '(국수탐합)*3.33', value: (국어 + 수학 + 탐구합) * 3.333 });
  formulas.push({ name: '점수표합*비율', value: (국어 + 수학 + 탐구합) * (expected / (국어 + 수학 + 탐구합 || 1)) });

  // 6. 1000점 환산
  formulas.push({ name: '비율*1000', value: (국어 + 수학 + 영어 + 탐구합) / 400 * 1000 });

  // 7. 탐구 1과목 기준
  formulas.push({ name: '국수영탐(1)', value: 국어 + 수학 + 영어 + 탐구1 });

  // 8. 가중택3 (5+3+2)
  const arr3 = [국어, 수학, 영어];
  formulas.push({ name: '가중택3_국수영', value: 5*LARGE(arr3,1) + 3*LARGE(arr3,2) + 2*LARGE(arr3,3) });

  const arr3_탐 = [국어, 수학, 탐구1];
  formulas.push({ name: '가중택3_국수탐', value: 5*LARGE(arr3_탐,1) + 3*LARGE(arr3_탐,2) + 2*LARGE(arr3_탐,3) });

  // 근사값 찾기
  const sortedByDiff = formulas
    .map(f => ({ ...f, diff: Math.abs(f.value - expected) }))
    .sort((a, b) => a.diff - b.diff);

  console.log('\n가장 가까운 공식들:');
  sortedByDiff.slice(0, 5).forEach(f => {
    console.log(`  ${f.name}: ${f.value.toFixed(2)} (차이: ${f.diff.toFixed(4)})`);
  });

  // 정확한 비율 계산
  if (국어 + 수학 + 탐구합 > 0) {
    const 비율 = expected / (국어 + 수학 + 탐구합);
    console.log(`\n역산 비율 (Expected / (국+수+탐)): ${비율.toFixed(6)}`);
  }
  if (점수표합 > 0) {
    const 비율2 = expected / 점수표합;
    console.log(`역산 비율 (Expected / 점수표합): ${비율2.toFixed(6)}`);
  }
});
