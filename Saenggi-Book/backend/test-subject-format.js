// 다양한 subjectName 형식으로 테스트
const calc2026Module = require('./dist/modules/jungsi/calculation/calculations/calc-2026');
const { calc정시환산점수2026 } = calc2026Module;

// 테스트 시나리오: 프론트엔드에서 보낼 수 있는 다양한 수학 과목명
const mathSubjectNameVariants = [
  '미적',        // 짧은 형식 (DB에서 가져오면 이 형식)
  '미적분',      // 긴 형식 (프론트엔드에서 보낼 수 있음)
  '미적분Ⅱ',    // 다른 형식
  '확통',        // 짧은 형식
  '확률과 통계', // 긴 형식
  '기하',        // 짧은 형식
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
  console.log('=== 수학 과목명 형식별 테스트 ===\n');
  console.log('대상 대학: 인제통합\n');

  for (const mathName of mathSubjectNameVariants) {
    const params = createTestParams(mathName);

    try {
      const result = await calc정시환산점수2026(params);

      if (result.success) {
        console.log(`✅ 수학(${mathName}): ${result.내점수}점`);
      } else {
        console.log(`❌ 수학(${mathName}): ${result.result}`);
      }
    } catch (e) {
      console.log(`🔥 수학(${mathName}): 예외 - ${e.message}`);
    }
  }

  console.log('\n=== 점수표에서 수학 관련 키 확인 ===');
  const fs = require('fs');
  const path = require('path');
  const scoreTable = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'dist/modules/jungsi/calculation/data/score-table-26-jungsi.json'), 'utf-8')
  );
  const mathKeys = Object.keys(scoreTable).filter(k => k.includes('수학'));
  console.log('점수표 내 수학 관련 키:', mathKeys);
}

runTests().catch(console.error);
