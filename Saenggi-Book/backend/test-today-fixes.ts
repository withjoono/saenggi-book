// test-today-fixes.ts
// 오늘 수정한 1-10점 차이 대학들 테스트

import { calc정시환산점수2026 } from './src/modules/jungsi/calculation/calculations/calc-2026';

const testInput = {
  국어: { 과목: '국어', 표준점수: 145, 등급: 1, 백분위: 99 },
  수학: { 과목: '수학(미적)', 표준점수: 130, 등급: 2, 백분위: 95 },
  영어: { 과목: '영어', 표준점수: 0, 등급: 1, 백분위: 99 },
  한국사: { 과목: '한국사', 표준점수: 0, 등급: 2, 백분위: 0 },
  과탐1: { 과목: '생명과학 Ⅰ', 표준점수: 69, 등급: 2, 백분위: 92 },
  과탐2: { 과목: '화학 Ⅰ', 표준점수: 68, 등급: 2, 백분위: 91 },
};

// 오늘 수정한 대학들 (Excel 분석 기반 expected 값)
const tests = [
  // 을지간호1 - 점수표합 × 0.864561 (한국사 포함)
  { 학교: '을지간호1', expected: 901.05, tolerance: 1 },

  // 성신정보 - 점수표합 × 1.020066 (한국사 포함)
  { 학교: '성신정보', expected: 503.02, tolerance: 1 },

  // 성신생명 - 탐구1×10% (기존 유지)
  { 학교: '성신생명', expected: 500.64, tolerance: 1 },

  // 서울인문 - 점수표합 × 0.991476 (한국사 미포함)
  { 학교: '서울인문', expected: 407.10, tolerance: 1 },

  // 인하융합자연 - 점수표합 × 2.483283 (한국사 미포함)
  { 학교: '인하융합자연', expected: 973.48, tolerance: 1 },

  // 인하자전자연 - 점수표합 × 2.497088 (한국사 미포함)
  { 학교: '인하자전자연', expected: 971.63, tolerance: 1 },

  // 순천자연 - 점수표합 × 0.762203 (한국사 미포함)
  { 학교: '순천자연', expected: 304.50, tolerance: 1 },

  // 순천수교 - 점수표합 × 0.771863 (한국사 미포함)
  { 학교: '순천수교', expected: 304.50, tolerance: 1 },

  // 한국공통합2 - 점수표합 × 2.053339 (한국사 미포함)
  { 학교: '한국공통합2', expected: 515.08, tolerance: 1 },

  // 교원생교 - 점수표합 × 1.006030 (한국사 미포함)
  { 학교: '교원생교', expected: 412.89, tolerance: 1 },

  // 교원화교 - 점수표합 × 1.006128 (한국사 미포함)
  { 학교: '교원화교', expected: 412.93, tolerance: 1 },

  // 우석한의 - 점수표합 × 0.995269 (한국사 포함)
  { 학교: '우석한의', expected: 408.10, tolerance: 1 },

  // 우석약학 - 점수표합 × 0.995269 (한국사 포함)
  { 학교: '우석약학', expected: 408.10, tolerance: 1 },

  // 차의약학 - 점수표합 그대로 (추가가감 제거)
  { 학교: '차의약학', expected: 96.98, tolerance: 1 },

  // 아주자연 - 점수표합 × 1.101272 (한국사 미포함)
  { 학교: '아주자연', expected: 985.10, tolerance: 1 },

  // 아주국디 - 점수표합 × 1.379279 (한국사 미포함)
  { 학교: '아주국디', expected: 985.00, tolerance: 1 },
];

async function test() {
  console.log('=== 오늘 수정한 대학 계산 테스트 ===\n');

  let 일치 = 0;
  let 불일치 = 0;
  const 불일치목록: string[] = [];

  for (const { 학교, expected, tolerance } of tests) {
    const params = {
      학교,
      이문과: 학교.includes('인문') ? '인문' : '자연',
      ...testInput,
      사탐1: undefined,
      사탐2: undefined,
      제2외국어: undefined,
    };
    try {
      const result = await calc정시환산점수2026(params);
      const 계산값 = result.success ? result.내점수 : null;
      const 차이 = 계산값 !== null ? Math.abs(계산값 - expected) : null;
      const match = 차이 !== null && 차이 < tolerance;

      if (match) 일치++;
      else {
        불일치++;
        불일치목록.push(`${학교}: 예상=${expected}, 계산=${계산값?.toFixed(2)}, 차이=${차이?.toFixed(4)}`);
      }

      const status = match ? '✅' : '❌';
      console.log(`${status} ${학교}: 예상=${expected}, 계산=${계산값?.toFixed(2)}, 차이=${차이?.toFixed(4)}`);
    } catch (e: any) {
      불일치++;
      불일치목록.push(`${학교}: Error - ${e.message}`);
      console.log(`❌ ${학교}: Error - ${e.message}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`결과: 일치=${일치}/${tests.length} (${((일치 / tests.length) * 100).toFixed(1)}%)`);

  if (불일치목록.length > 0) {
    console.log(`\n불일치 목록:`);
    불일치목록.forEach(item => console.log(`  - ${item}`));
  }
}

test().catch(console.error);
