// 직접 calc정시환산점수2026 함수를 호출하여 테스트

// dist 디렉토리에서 calc-2026.js 로드
const calc2026Module = require('./dist/modules/jungsi/calculation/calculations/calc-2026');
const { calc정시환산점수2026 } = calc2026Module;

// 테스트 파라미터 생성 함수
function createTestParams(scoreCalculation, major = '자연') {
  return {
    학교: scoreCalculation,
    이문과: major,
    국어: { 과목: '국어', 표준점수: 130, 등급: 1, 백분위: 95 },
    수학: { 과목: '수학(미적)', 표준점수: 135, 등급: 1, 백분위: 97 },
    영어: { 과목: '영어', 표준점수: 0, 등급: 1, 백분위: 100 },
    한국사: { 과목: '한국사', 표준점수: 0, 등급: 1, 백분위: 100 },
    과탐1: { 과목: '물리학 Ⅰ', 표준점수: 65, 등급: 1, 백분위: 93 },
    과탐2: { 과목: '화학 Ⅰ', 표준점수: 62, 등급: 1, 백분위: 90 },
    사탐1: null,
    사탐2: null,
    제2외국어: null,
  };
}

// 테스트할 대학 score_calculation 목록
const testUniversities = [
  // 인제대학교
  { name: '인제글로컬', major: '인문' },
  { name: '인제의학', major: '자연' },
  { name: '인제통합', major: '자연' },
  // 전남대학교
  { name: '전남농생', major: '자연' },
  { name: '전남물리', major: '자연' },
  { name: '전남의학', major: '자연' },
  { name: '전남인문', major: '인문' },
  // 충북대학교 (비교용)
  { name: '충북예체능', major: '예체능' },
  { name: '충북인문', major: '인문' },
  { name: '충북자연', major: '자연' },
  { name: '충북의학', major: '자연' },
];

async function runTests() {
  console.log('=== 인제/전남/충북 대학 환산점수 계산 테스트 ===\n');

  const results = { success: [], fail: [] };

  for (const univ of testUniversities) {
    const params = createTestParams(univ.name, univ.major);

    try {
      const result = await calc정시환산점수2026(params);

      if (result.success) {
        console.log(`✅ ${univ.name} (${univ.major}): ${result.내점수}점`);
        results.success.push({ ...univ, score: result.내점수 });
      } else {
        console.log(`❌ ${univ.name} (${univ.major}): ${result.result}`);
        results.fail.push({ ...univ, reason: result.result });
      }
    } catch (e) {
      console.log(`🔥 ${univ.name} (${univ.major}): 예외 - ${e.message}`);
      results.fail.push({ ...univ, reason: `예외: ${e.message}` });
    }
  }

  console.log('\n=== 결과 요약 ===');
  console.log(`성공: ${results.success.length}개`);
  console.log(`실패: ${results.fail.length}개`);

  if (results.fail.length > 0) {
    console.log('\n=== 실패 목록 ===');
    results.fail.forEach(f => console.log(`  - ${f.name}: ${f.reason}`));
  }
}

runTests().catch(console.error);
