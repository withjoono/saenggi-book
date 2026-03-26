// 군외 대학 환산점수 계산 테스트
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'ES2021'
  },
  transpileOnly: true
});

const { calc정시환산점수2026, get지원대학목록2026 } = require('./src/modules/jungsi/calculation/calculations/calc-2026.ts');

// 군외 대학 테스트
const gunoeUnivs = ['카이스트', '디지스트', '유니스트', '지스트', '켄텍'];

async function test() {
  console.log('=== 군외 대학 환산점수 계산 테스트 ===\n');

  // 지원 대학 목록에서 군외 대학 확인
  const allUnivs = get지원대학목록2026();
  console.log('학교조건2026에 등록된 군외 대학:');
  gunoeUnivs.forEach(univ => {
    const exists = allUnivs.includes(univ) ? 'O' : 'X';
    console.log(`  ${univ}: ${exists}`);
  });

  console.log('\n=== 계산 실행 (이과 학생 샘플) ===');

  for (const 학교 of gunoeUnivs) {
    try {
      const params = {
        학교,
        국어: { 표준점수: 131, 백분위: 93, 등급: 2 },
        수학: { 표준점수: 140, 백분위: 97, 등급: 1, 선택과목: '미적' },
        영어: { 백분위: 95, 등급: 1 },
        한국사: { 등급: 3 },
        과탐1: { 표준점수: 68, 백분위: 95, 등급: 1, 과목명: '물리학Ⅰ' },
        과탐2: { 표준점수: 66, 백분위: 93, 등급: 2, 과목명: '화학Ⅰ' },
        사탐1: null,
        사탐2: null,
        제2외국어: null,
        이문과: '자연'
      };

      const result = await calc정시환산점수2026(params);
      console.log(`\n${학교}:`);
      console.log(`  성공: ${result.success}`);
      if (result.success) {
        console.log(`  환산점수: ${result.환산점수}`);
        if (result.표점합) console.log(`  표점합: ${result.표점합}`);
        if (result.점수표합) console.log(`  점수표합: ${result.점수표합}`);
      } else {
        console.log(`  실패 사유: ${result.result}`);
      }
    } catch (err) {
      console.log(`\n${학교}: 에러 - ${err.message}`);
    }
  }

  console.log('\n=== 테스트 완료 ===');
}

test().catch(console.error);
