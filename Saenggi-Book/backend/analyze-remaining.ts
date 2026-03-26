// analyze-remaining.ts
// 남은 1-10점 차이 대학 분석

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
  생명백분위: 92,
  화학백분위: 91,
};

// 점수표에서 환산점수 조회
function get점수표(과목: string, 점수: number | string, 학교: string): number | null {
  try {
    const 과목데이터 = 점수표[과목];
    if (!과목데이터) return null;
    const 점수데이터 = 과목데이터[String(점수)];
    if (!점수데이터) return null;
    const 환산점수 = 점수데이터[학교];
    if (환산점수 === undefined) return null;
    return typeof 환산점수 === 'string' ? 0 : 환산점수;
  } catch {
    return null;
  }
}

// 분석할 대학들
const 분석대학들 = [
  { 학교: '을지간호1', expected: 901.05 },
  { 학교: '성신정보', expected: 503.02 },
  { 학교: '성신생명', expected: 500.64 },
  { 학교: '서울인문', expected: 407.10 },
  { 학교: '인하융합자연', expected: 973.48 },
  { 학교: '인하자전자연', expected: 971.63 },
  { 학교: '순천자연', expected: 304.50 },
  { 학교: '순천수교', expected: 304.50 },
  { 학교: '한국공통합2', expected: 515.08 },
  { 학교: '교원생교', expected: 412.89 },
  { 학교: '교원화교', expected: 412.93 },
  { 학교: '우석한의', expected: 408.10 },
  { 학교: '우석약학', expected: 408.10 },
  { 학교: '차의약학', expected: 96.98 },
  { 학교: '아주자연', expected: 985.10 },
  { 학교: '아주국디', expected: 985.00 },
];

console.log('=== 남은 1-10점 차이 대학 분석 ===\n');

분석대학들.forEach(({ 학교, expected }) => {
  const 국어 = get점수표('국어', testScores.국어표준, 학교);
  const 수학 = get점수표('수학(미적)', testScores.수학표준, 학교);
  const 영어 = get점수표('영어', testScores.영어등급, 학교);
  const 한국사 = get점수표('한국사', testScores.한국사등급, 학교);
  const 생명 = get점수표('생명과학 Ⅰ', testScores.생명표준, 학교);
  const 화학 = get점수표('화학 Ⅰ', testScores.화학표준, 학교);

  const 탐구합 = (생명 || 0) + (화학 || 0);
  const 탐구1 = Math.max(생명 || 0, 화학 || 0);
  const 점수표합 = (국어 || 0) + (수학 || 0) + (영어 || 0) + (한국사 || 0) + (생명 || 0) + (화학 || 0);
  const 국수영탐합 = (국어 || 0) + (수학 || 0) + (영어 || 0) + 탐구합;
  const 비율 = 점수표합 > 0 ? expected / 점수표합 : 0;
  const 비율_국수영탐 = 국수영탐합 > 0 ? expected / 국수영탐합 : 0;

  console.log(`${학교}:`);
  console.log(`  Expected: ${expected}`);
  console.log(`  국어: ${국어}, 수학: ${수학}, 영어: ${영어}, 한국사: ${한국사}`);
  console.log(`  생명: ${생명}, 화학: ${화학}, 탐구합: ${탐구합}, 탐구1: ${탐구1}`);
  console.log(`  점수표합: ${점수표합}`);
  console.log(`  국수영탐합: ${국수영탐합}`);
  console.log(`  비율(점수표합): ${비율.toFixed(6)}`);
  console.log(`  비율(국수영탐): ${비율_국수영탐.toFixed(6)}`);

  // 추가 분석
  console.log(`  --- 추가 분석 ---`);
  console.log(`  점수표합 + 탐구1×10%: ${점수표합 + 탐구1 * 0.1}`);
  console.log(`  국수영탐합 + 탐구1×10%: ${국수영탐합 + 탐구1 * 0.1}`);
  console.log(`  점수표합 - 탐구1×10%: ${점수표합 - 탐구1 * 0.1}`);
  console.log(`  (국+수+탐)×2: ${((국어 || 0) + (수학 || 0) + 탐구합) * 2}`);
  console.log('');
});
