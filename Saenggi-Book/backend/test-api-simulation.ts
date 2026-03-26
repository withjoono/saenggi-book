// test-api-simulation.ts
// API 호출 시뮬레이션 - prepare정시환산점수 로직 포함

import { calc정시환산점수2026 } from './src/modules/jungsi/calculation/calculations/calc-2026';

interface MockExamScoreInput {
  subjectCategory: string;
  subjectName: string;
  standardScore: string;
  grade: number;
  percentile: number;
}

interface 과목점수Type {
  과목: string;
  표준점수: number;
  등급: number;
  백분위: number;
}

interface 정시점수계산Params {
  학교: string;
  이문과: string;
  국어: 과목점수Type;
  수학: 과목점수Type;
  영어: 과목점수Type;
  한국사: 과목점수Type;
  과탐1?: 과목점수Type;
  과탐2?: 과목점수Type;
  사탐1?: 과목점수Type;
  사탐2?: 과목점수Type;
  제2외국어?: 과목점수Type;
}

// 서비스의 prepare정시환산점수 로직 복제
function prepare정시환산점수(
  mockExamScores: MockExamScoreInput[],
  item: { score_calculation: string; major: string }
): 정시점수계산Params {
  const params: 정시점수계산Params = {
    학교: item.score_calculation,
    이문과: item.major,
    국어: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
    수학: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
    영어: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
    한국사: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
    과탐1: undefined,
    과탐2: undefined,
    사탐1: undefined,
    사탐2: undefined,
    제2외국어: undefined,
  };

  mockExamScores.forEach((score) => {
    const subjectScore: 과목점수Type = {
      과목: score.subjectName,
      표준점수: parseInt(score.standardScore),
      등급: score.grade,
      백분위: score.percentile,
    };

    switch (score.subjectCategory) {
      case 'kor':
        subjectScore.과목 = '국어';
        params.국어 = subjectScore;
        break;
      case 'math':
        subjectScore.과목 = `수학(${score.subjectName})`;
        params.수학 = subjectScore;
        break;
      case 'eng':
        params.영어 = subjectScore;
        break;
      case 'history':
        params.한국사 = subjectScore;
        break;
      case 'society':
        if (!params.사탐1) params.사탐1 = subjectScore;
        else if (!params.사탐2) params.사탐2 = subjectScore;
        break;
      case 'science':
        if (!params.과탐1) params.과탐1 = subjectScore;
        else if (!params.과탐2) params.과탐2 = subjectScore;
        break;
      case 'lang':
        params.제2외국어 = subjectScore;
        break;
    }
  });

  return params;
}

async function test() {
  // 프론트엔드가 보낼 것 같은 형식의 입력 데이터
  const mockExamScores: MockExamScoreInput[] = [
    { subjectCategory: 'kor', subjectName: '언어와매체', standardScore: '145', grade: 1, percentile: 99 },
    { subjectCategory: 'math', subjectName: '미적', standardScore: '130', grade: 2, percentile: 95 },
    { subjectCategory: 'eng', subjectName: '영어', standardScore: '0', grade: 1, percentile: 99 },
    { subjectCategory: 'history', subjectName: '한국사', standardScore: '0', grade: 2, percentile: 0 },
    { subjectCategory: 'science', subjectName: '생명과학 Ⅰ', standardScore: '69', grade: 2, percentile: 92 },
    { subjectCategory: 'science', subjectName: '화학 Ⅰ', standardScore: '68', grade: 2, percentile: 91 },
  ];

  console.log('=== API 시뮬레이션 테스트 ===');
  console.log('');
  console.log('1. 입력 데이터 (프론트엔드):');
  console.log(JSON.stringify(mockExamScores, null, 2));
  console.log('');

  // prepare정시환산점수 로직 실행
  const params = prepare정시환산점수(mockExamScores, {
    score_calculation: '동아의학',
    major: '자연'
  });

  console.log('2. prepare정시환산점수 결과:');
  console.log(JSON.stringify(params, null, 2));
  console.log('');

  // 특히 영어와 한국사의 과목명 확인
  console.log('3. 영어/한국사 과목명 확인:');
  console.log('   영어.과목:', JSON.stringify(params.영어.과목));
  console.log('   한국사.과목:', JSON.stringify(params.한국사.과목));
  console.log('');

  // calc정시환산점수2026 호출
  try {
    const result = await calc정시환산점수2026(params);
    console.log('4. 계산 결과:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (result.success) {
      console.log('내점수:', result.내점수);
      console.log('예상값: 619.85');
      console.log('차이:', Math.abs((result.내점수 || 0) - 619.85).toFixed(4));
    } else {
      console.log('실패 사유:', result.result);
    }
  } catch (error) {
    console.error('에러:', error);
  }
}

test();
