// test-calc-2026-direct.ts
// calc정시환산점수2026 함수를 직접 호출하여 테스트

import { calc정시환산점수2026 } from './src/modules/jungsi/calculation/calculations/calc-2026';

async function test() {
  // 사용자가 보고한 테스트 데이터
  const testParams = {
    학교: '동아의학',
    이문과: '자연',
    국어: { 과목: '국어', 표준점수: 145, 등급: 1, 백분위: 99 },
    수학: { 과목: '수학(미적)', 표준점수: 130, 등급: 2, 백분위: 95 },
    영어: { 과목: '영어', 표준점수: 0, 등급: 1, 백분위: 99 },
    한국사: { 과목: '한국사', 표준점수: 0, 등급: 2, 백분위: 0 },
    과탐1: { 과목: '생명과학 Ⅰ', 표준점수: 69, 등급: 2, 백분위: 92 },
    과탐2: { 과목: '화학 Ⅰ', 표준점수: 68, 등급: 2, 백분위: 91 },
    사탐1: undefined,
    사탐2: undefined,
    제2외국어: undefined
  };

  console.log('=== calc정시환산점수2026 직접 호출 테스트 ===');
  console.log('입력 파라미터:', JSON.stringify(testParams, null, 2));
  console.log('');

  try {
    const result = await calc정시환산점수2026(testParams);
    console.log('계산 결과:', JSON.stringify(result, null, 2));
    console.log('');

    if (result.success) {
      console.log('내점수:', result.내점수);
      console.log('예상값: 619.85');
      console.log('차이:', Math.abs((result.내점수 || 0) - 619.85).toFixed(4));
    } else {
      console.log('실패 사유:', result.result);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

test();
