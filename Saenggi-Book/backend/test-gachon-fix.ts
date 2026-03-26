// test-gachon-fix.ts
// 가천대 수정 확인 테스트

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
  { 학교: '가천통합백', expected: 987 },
  { 학교: '가천통합표', expected: 700.5 },
  { 학교: '가천의학', expected: 980.75 },
  { 학교: '가천한의', expected: 980.75 },
];

async function test() {
  console.log('=== 가천대 계산 수정 확인 ===\n');

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
      const 일치 = 차이 !== null && 차이 < 0.01;

      console.log(`${학교}:`);
      console.log(`  예상값: ${expected}`);
      console.log(`  계산값: ${계산값}`);
      console.log(`  차이: ${차이?.toFixed(4)}`);
      console.log(`  결과: ${일치 ? '✅ 일치' : '❌ 불일치'}`);
      console.log('');
    } catch (e: any) {
      console.log(`${학교}: ❌ Error - ${e.message}\n`);
    }
  }
}

test().catch(console.error);
