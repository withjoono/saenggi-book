// test-special-schools.ts
// 특수 대학 계산 수정 테스트

import { calc정시환산점수2026 } from './src/modules/jungsi/calculation/calculations/calc-2026';

const testInput = {
  국어: { 과목: '국어', 표준점수: 145, 등급: 1, 백분위: 99 },
  수학: { 과목: '수학(미적)', 표준점수: 130, 등급: 2, 백분위: 95 },
  영어: { 과목: '영어', 표준점수: 0, 등급: 1, 백분위: 99 },
  한국사: { 과목: '한국사', 표준점수: 0, 등급: 2, 백분위: 0 },
  과탐1: { 과목: '생명과학 Ⅰ', 표준점수: 69, 등급: 2, 백분위: 92 },
  과탐2: { 과목: '화학 Ⅰ', 표준점수: 68, 등급: 2, 백분위: 91 },
};

const tests = [
  // 과학기술원 계열
  { 학교: '지스트', expected: 477.53 },
  { 학교: '카이스트', expected: 515.97 },  // 점수표합
  { 학교: '디지스트', expected: 515.97 },
  { 학교: '유니스트', expected: 515.97 },

  // 간호 계열
  { 학교: '서울간호', expected: 410.6 },
  { 학교: '을지간호2', expected: 1016.875 },
  { 학교: '군산간호', expected: 1000.25 },
  { 학교: '이화간호', expected: 995.02 },

  // 의학/예체능
  { 학교: '국민예체능', expected: 768 },
  { 학교: '성균의학', expected: 676.93 },
  { 학교: '아주의학', expected: 934.10 },

  // 충북 계열
  { 학교: '충북의학', expected: 992.26 },
  { 학교: '충북인문', expected: 993.28 },
  { 학교: '충북공학', expected: 992.26 },
  { 학교: '충북농생', expected: 992.26 },

  // 기타 특수
  { 학교: '고려세신약', expected: 973.89 },
  { 학교: '경기자전', expected: 98.95 },
  { 학교: '신한통합3', expected: 992.5 },
];

async function test() {
  console.log('=== 특수 대학 계산 수정 테스트 ===\n');

  let 일치 = 0;
  let 불일치 = 0;

  for (const { 학교, expected } of tests) {
    const params = {
      학교,
      이문과: '자연',
      ...testInput,
      사탐1: undefined,
      사탐2: undefined,
      제2외국어: undefined,
    };
    try {
      const result = await calc정시환산점수2026(params);
      const 계산값 = result.success ? result.내점수 : null;
      const 차이 = 계산값 !== null ? Math.abs(계산값 - expected) : null;
      const match = 차이 !== null && 차이 < 1;

      if (match) 일치++;
      else 불일치++;

      const status = match ? '✅' : '❌';
      console.log(`${status} ${학교}: 예상=${expected}, 계산=${계산값?.toFixed(2)}, 차이=${차이?.toFixed(4)}`);
    } catch (e: any) {
      불일치++;
      console.log(`❌ ${학교}: Error - ${e.message}`);
    }
  }

  console.log(`\n결과: 일치=${일치}, 불일치=${불일치}`);
}

test().catch(console.error);
