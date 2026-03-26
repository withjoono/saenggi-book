// test-all-fixes.ts
// 모든 1-10점 차이 대학 수정 테스트

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
  // 이전에 수정된 대학들 (큰 차이)
  { 학교: '지스트', expected: 477.53, tolerance: 1 },
  { 학교: '카이스트', expected: 515.97, tolerance: 1 },
  { 학교: '디지스트', expected: 515.97, tolerance: 1 },
  { 학교: '유니스트', expected: 515.97, tolerance: 1 },
  { 학교: '서울간호', expected: 410.6, tolerance: 1 },
  { 학교: '을지간호2', expected: 1016.875, tolerance: 1 },
  { 학교: '군산간호', expected: 1000.25, tolerance: 1 },
  { 학교: '이화간호', expected: 995.02, tolerance: 1 },
  { 학교: '국민예체능', expected: 768, tolerance: 1 },
  { 학교: '성균의학', expected: 676.93, tolerance: 1 },
  { 학교: '아주의학', expected: 934.10, tolerance: 1 },
  { 학교: '충북의학', expected: 992.26, tolerance: 1 },
  { 학교: '충북인문', expected: 993.28, tolerance: 1 },
  { 학교: '충북공학', expected: 992.26, tolerance: 1 },
  { 학교: '충북농생', expected: 992.26, tolerance: 1 },
  { 학교: '고려세신약', expected: 973.89, tolerance: 1 },
  { 학교: '경기자전', expected: 98.95, tolerance: 1 },
  { 학교: '신한통합3', expected: 992.5, tolerance: 1 },

  // 새로 수정된 대학들 (1-10점 차이)
  { 학교: '시립세무', expected: 515.97, tolerance: 1 },  // 추가가감 제거
  { 학교: '시립영문', expected: 507.55, tolerance: 1 },  // 추가가감 제거
  { 학교: '성균공학', expected: 975.27, tolerance: 1 },  // 계열별 가중택
  { 학교: '성균글바메', expected: 969.49, tolerance: 1 },  // 계열별 가중택
  { 학교: '성균수교', expected: 975.27, tolerance: 1 },  // 계열별 가중택
  { 학교: '고려세기계', expected: 975.89, tolerance: 1 },  // 점수표합×비율
  { 학교: '고려세빅데사', expected: 975.89, tolerance: 1 },  // 점수표합×비율
  { 학교: '고려세경통', expected: 979.40, tolerance: 1 },  // 점수표합×비율
  { 학교: '고려세문화', expected: 984.10, tolerance: 1 },  // 점수표합×비율

  // 오늘 수정된 대학들
  { 학교: '을지간호1', expected: 901.05, tolerance: 1 },  // 점수표합×비율
  { 학교: '성신정보', expected: 503.02, tolerance: 1 },  // 점수표합×비율
  { 학교: '성신생명', expected: 500.64, tolerance: 1 },  // 탐구1×10% (기존 유지)
  { 학교: '서울인문', expected: 407.10, tolerance: 1 },  // 점수표합×비율
  { 학교: '인하융합자연', expected: 973.48, tolerance: 1 },  // 점수표합×비율
  { 학교: '인하자전자연', expected: 971.63, tolerance: 1 },  // 점수표합×비율
  { 학교: '순천자연', expected: 304.50, tolerance: 1 },  // 점수표합×비율
  { 학교: '순천수교', expected: 304.50, tolerance: 1 },  // 점수표합×비율
  { 학교: '한국공통합2', expected: 515.08, tolerance: 1 },  // 점수표합×비율
  { 학교: '교원생교', expected: 412.89, tolerance: 1 },  // 점수표합×비율
  { 학교: '교원화교', expected: 412.93, tolerance: 1 },  // 점수표합×비율
  { 학교: '우석한의', expected: 408.10, tolerance: 1 },  // 점수표합×비율
  { 학교: '우석약학', expected: 408.10, tolerance: 1 },  // 점수표합×비율
  { 학교: '차의약학', expected: 96.98, tolerance: 1 },  // 점수표합×1 (거의 일치)
  { 학교: '아주자연', expected: 985.10, tolerance: 1 },  // 점수표합×비율
  { 학교: '아주국디', expected: 985.00, tolerance: 1 },  // 점수표합×비율
];

async function test() {
  console.log('=== 전체 대학 계산 수정 테스트 ===\n');

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
  console.log(`결과: 일치=${일치}, 불일치=${불일치}`);
  console.log(`성공률: ${((일치 / tests.length) * 100).toFixed(1)}%`);

  if (불일치목록.length > 0) {
    console.log(`\n불일치 목록:`);
    불일치목록.forEach(item => console.log(`  - ${item}`));
  }
}

test().catch(console.error);
