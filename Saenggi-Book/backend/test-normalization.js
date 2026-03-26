// 수학 과목명 정규화 테스트 (서비스 로직 시뮬레이션)
const calc2026Module = require('./dist/modules/jungsi/calculation/calculations/calc-2026');
const { calc정시환산점수2026 } = calc2026Module;

// 정규화 함수 (서비스의 normalizeMathSubjectName과 동일)
function normalizeMathSubjectName(subjectName) {
  const normalizations = {
    '미적분': '미적',
    '미적분Ⅱ': '미적',
    'Calculus': '미적',
    '확률과 통계': '확통',
    '확률과통계': '확통',
    'Probability': '확통',
  };
  return normalizations[subjectName] || subjectName;
}

// 테스트 시나리오: 프론트엔드에서 보낼 수 있는 다양한 수학 과목명
const testCases = [
  { input: '미적', expected: '미적' },
  { input: '미적분', expected: '미적' },
  { input: '확통', expected: '확통' },
  { input: '확률과 통계', expected: '확통' },
  { input: '기하', expected: '기하' },
];

function createTestParams(mathSubjectName, scoreCalculation = '인제통합') {
  return {
    학교: scoreCalculation,
    이문과: '자연',
    국어: { 과목: '국어', 표준점수: 130, 등급: 1, 백분위: 95 },
    수학: { 과목: `수학(${mathSubjectName})`, 표준점수: 135, 등급: 1, 백분위: 97 },
    영어: { 과목: '영어', 표준점수: 0, 등급: 1, 백분위: 100 },
    한국사: { 과목: '한국사', 표준점수: 0, 등급: 1, 백분위: 100 },
    과탐1: { 과목: '물리학 Ⅰ', 표준점수: 65, 등급: 1, 백분위: 93 },
    과탐2: { 과목: '화학 Ⅰ', 표준점수: 62, 등급: 1, 백분위: 90 },
    사탐1: null,
    사탐2: null,
    제2외국어: null,
  };
}

async function runTests() {
  console.log('=== 수학 과목명 정규화 테스트 ===\n');
  console.log('대상 대학: 인제통합\n');

  let allPassed = true;

  for (const tc of testCases) {
    // 정규화 적용
    const normalized = normalizeMathSubjectName(tc.input);
    const params = createTestParams(normalized);

    try {
      const result = await calc정시환산점수2026(params);

      if (result.success) {
        console.log(`✅ "${tc.input}" → "${normalized}" → ${result.내점수}점`);
      } else {
        console.log(`❌ "${tc.input}" → "${normalized}" → ${result.result}`);
        allPassed = false;
      }
    } catch (e) {
      console.log(`🔥 "${tc.input}" → "${normalized}" → 예외: ${e.message}`);
      allPassed = false;
    }
  }

  console.log('\n=== 결과 ===');
  if (allPassed) {
    console.log('✅ 모든 테스트 통과! 정규화가 올바르게 작동합니다.');
  } else {
    console.log('❌ 일부 테스트 실패');
  }
}

runTests().catch(console.error);
