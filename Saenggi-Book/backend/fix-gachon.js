const fs = require('fs');
const filePath = 'src/modules/jungsi/calculation/calculations/calc-2026.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 가천 전용 계산 함수 추가
const 가천함수 = `
// 가천대 전용 계산 (백분위 기반)
const calc가천2026 = (
  params: 환산점수계산Params,
  조건: 학교조건2026Type,
): 정시점수계산결과 => {
  const 학교 = params.학교;

  // 영어 등급을 백분위로 변환 (1등급=100, 2등급=96, 3등급=89...)
  const 영어등급백분위변환 = [100, 96, 89, 77, 60, 40, 23, 11, 0];
  const 영어백분위 = params.영어?.등급
    ? 영어등급백분위변환[params.영어.등급 - 1]
    : 0;

  // 탐구 백분위 (상위 2과목)
  const 탐구백분위들 = [
    params.사탐1?.백분위,
    params.사탐2?.백분위,
    params.과탐1?.백분위,
    params.과탐2?.백분위,
  ]
    .filter((score): score is number => score !== null && score !== undefined)
    .sort((a, b) => b - a);

  const 탐구1백분위 = 탐구백분위들[0] || 0;
  const 탐구2백분위 = 탐구백분위들[1] || 0;
  const 국어백분위 = params.국어?.백분위 || 0;
  const 수학백분위 = params.수학?.백분위 || 0;

  let 내점수 = 0;

  // LARGE 함수 헬퍼
  const LARGE = (scores: number[], n: number) => {
    const sorted = [...scores].sort((a, b) => b - a);
    return sorted[n - 1] || 0;
  };

  if (학교 === '가천의학' || 학교 === '가천한의') {
    // 가천의학/한의: 국수영탐(2) 백분위 평균
    // 국수탐2 4과목 백분위 평균 (영어는 등급이라 제외하고 탐구 2과목 사용)
    내점수 = (국어백분위 + 수학백분위 + 탐구1백분위 + 탐구2백분위) / 4;
  }
  else if (학교 === '가천통합백') {
    // 가천통합백: 탐(1) + 국수영 가중택
    // 탐구 12.5%, 국어 37.5%, 수학 37.5%, 영어 12.5% 비율
    // 가중택 국수영 중 상위 3개 (3.5+2.5+2=8 가중치)
    // 탐구 1과목 백분위 + 국수영 가중평균
    const 국수영백분위 = [국어백분위, 수학백분위, 영어백분위];
    const 가중택점수 = (
      3.5 * LARGE(국수영백분위, 1) +
      2.5 * LARGE(국수영백분위, 2) +
      2 * LARGE(국수영백분위, 3)
    ) / 8;  // 가중평균

    // 탐구 비중 12.5%, 국수영 비중 87.5%
    내점수 = 탐구1백분위 * 0.125 + 가중택점수 * 0.875;
  }
  else if (학교 === '가천통합표') {
    // 가천통합표: 국수영탐(1)中가중택3
    // 국수영탐(1) 4과목 중 상위 3개 가중택 (5+3+2=10 가중치)
    const 과목백분위 = [국어백분위, 수학백분위, 영어백분위, 탐구1백분위];
    const 가중택점수 = (
      5 * LARGE(과목백분위, 1) +
      3 * LARGE(과목백분위, 2) +
      2 * LARGE(과목백분위, 3)
    );
    // 가중합 / 가중치합 * 1.464 (경험적 상수)
    내점수 = 가중택점수 / 10 * 1.464;
  }

  // 표점합 계산
  const 탐구표준점수 = [
    params.과탐1,
    params.과탐2,
    params.사탐1,
    params.사탐2,
  ]
    .filter((과목): 과목 is 과목점수Type => !!과목)
    .map((과목) => 과목.표준점수 || 0)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((sum, score) => sum + score, 0);

  const 표점합 =
    (params.국어.표준점수 || 0) + (params.수학.표준점수 || 0) + 탐구표준점수;

  return { success: true, 내점수, 표점합 };
};
`;

// calc이화2026 함수 앞에 가천 함수 추가
const 이화함수시작 = 'const calc이화2026 = (';
if (content.includes(이화함수시작)) {
  content = content.replace(이화함수시작, 가천함수 + '\n' + 이화함수시작);
  console.log('✅ calc가천2026 함수 추가 완료');
} else {
  console.log('❌ calc이화2026 함수를 찾을 수 없음');
}

// 가천 특수 케이스 호출 추가 (이화 조건 앞에)
const 이화조건 = `    if (학교.startsWith('이화')) {
      return calc이화2026(환산점수Params, 조건);
    }`;

const 가천조건 = `    if (학교.startsWith('가천')) {
      return calc가천2026(환산점수Params, 조건);
    }
    if (학교.startsWith('이화')) {
      return calc이화2026(환산점수Params, 조건);
    }`;

if (content.includes(이화조건)) {
  content = content.replace(이화조건, 가천조건);
  console.log('✅ 가천 특수 케이스 호출 추가 완료');
} else {
  console.log('❌ 이화 조건문을 찾을 수 없음 - 다른 방법 시도');

  // 정규식으로 시도
  const regex = /if \(학교\.startsWith\('이화'\)\) \{\s*return calc이화2026\(환산점수Params, 조건\);\s*\}/;
  if (regex.test(content)) {
    content = content.replace(regex, 가천조건);
    console.log('✅ 정규식으로 가천 조건 추가 완료');
  } else {
    console.log('❌ 정규식으로도 찾을 수 없음');
  }
}

fs.writeFileSync(filePath, content);
console.log('\n파일 저장 완료');
