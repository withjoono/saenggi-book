// test-multiple-universities.ts
// 여러 대학의 계산 결과를 Excel 예상값과 비교

import { calc정시환산점수2026 } from './src/modules/jungsi/calculation/calculations/calc-2026';

// 테스트 입력 데이터 (사용자 제공)
const testInput = {
  국어: { 과목: '국어', 표준점수: 145, 등급: 1, 백분위: 99 },
  수학: { 과목: '수학(미적)', 표준점수: 130, 등급: 2, 백분위: 95 },
  영어: { 과목: '영어', 표준점수: 0, 등급: 1, 백분위: 99 },
  한국사: { 과목: '한국사', 표준점수: 0, 등급: 2, 백분위: 0 },
  과탐1: { 과목: '생명과학 Ⅰ', 표준점수: 69, 등급: 2, 백분위: 92 },
  과탐2: { 과목: '화학 Ⅰ', 표준점수: 68, 등급: 2, 백분위: 91 },
};

// Excel에서 가져온 예상값 (일부)
const expectedScores: Record<string, number> = {
  '가천의학': 980.75,
  '관동의학': 1008.125,
  '가톨릭의학': 653.1362575,
  '강원의학': 507.3,
  '건국글의학': 961.381287828822,
  '건양의학': 983.5,
  '경북간호': 738.460625,
  '경상의학': 963.4465429373366,
  '경희자연': 415.87649999999996,
  '계명의학': 398.9,
  '고려자연': 689.13921875,
  '고신의학': 679.5,
  '단국천의학': 972.6867689521852,
  '대가의학': 529.4107346783403,
  '동국경의학': 994.5,
  '동아의학': 619.85,
  '동아인문': 613,
  '동아자연': 616.9,
};

async function testUniversities() {
  console.log('=== 여러 대학 계산 테스트 ===\n');

  const results: Array<{
    학교: string;
    예상값: number;
    계산값: number | null;
    차이: number | null;
    일치: boolean;
  }> = [];

  for (const [학교, 예상값] of Object.entries(expectedScores)) {
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
      const 계산값 = result.success ? result.내점수 || 0 : null;
      const 차이 = 계산값 !== null ? Math.abs(계산값 - 예상값) : null;
      const 일치 = 차이 !== null && 차이 < 0.01;

      results.push({
        학교,
        예상값,
        계산값,
        차이,
        일치,
      });

      if (!일치) {
        console.log(`❌ ${학교}: 예상=${예상값}, 계산=${계산값}, 차이=${차이?.toFixed(2)}`);
        if (!result.success) {
          console.log(`   에러: ${result.result}`);
        }
      } else {
        console.log(`✅ ${학교}: ${계산값}`);
      }
    } catch (error) {
      console.log(`❌ ${학교}: 에러 - ${error}`);
      results.push({
        학교,
        예상값,
        계산값: null,
        차이: null,
        일치: false,
      });
    }
  }

  console.log('\n=== 요약 ===');
  const 일치수 = results.filter(r => r.일치).length;
  const 불일치수 = results.filter(r => !r.일치).length;
  console.log(`일치: ${일치수}/${results.length}`);
  console.log(`불일치: ${불일치수}/${results.length}`);

  // 불일치 목록
  if (불일치수 > 0) {
    console.log('\n불일치 목록:');
    results.filter(r => !r.일치).forEach(r => {
      console.log(`  ${r.학교}: 예상=${r.예상값}, 계산=${r.계산값}, 차이=${r.차이?.toFixed(2)}`);
    });
  }
}

testUniversities();
