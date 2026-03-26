// 서강인문, 항공통합 계산 추적
const XLSX = require('xlsx');

// 테스트 입력값 (calculate-accurate-scores.ts에서 사용하는 값)
const INPUT_SCORES = {
  국어: { 표준점수: 120, 등급: 2, 백분위: 88 },
  수학: { 표준점수: 120, 등급: 2, 백분위: 88, 과목: '수학(미적)' },
  영어: { 등급: 2 },
  한국사: { 등급: 2 },
  탐구1: { 표준점수: 60, 등급: 3, 백분위: 75, 과목: '물리학 Ⅰ' },
  탐구2: { 표준점수: 60, 등급: 3, 백분위: 75, 과목: '생명과학 Ⅰ' },
};

// Excel 점수표 읽기
const 점수표Wb = XLSX.readFile('uploads/26 정시 점수표.xlsx');
const 점수표Data = XLSX.utils.sheet_to_json(점수표Wb.Sheets['Sheet1']);

// 대학별 점수표 조회 함수
function get점수표(schoolName, subject, score, type = '표준점수') {
  const row = 점수표Data.find(r =>
    r['학교'] === schoolName &&
    r['과목'] === subject &&
    r[type] === score
  );
  return row ? row['환산점수'] : null;
}

// 대학별 환산점수 시뮬레이션
function simulate(schoolName, 필수설명, 가중택설명, 탐구과목수) {
  console.log(`\n=== ${schoolName} 계산 시뮬레이션 ===`);
  console.log(`필수설명: ${필수설명}, 가중택설명: ${가중택설명}, 탐구과목수: ${탐구과목수}`);

  // 환산점수 조회 (점수표에서)
  const 국어환산 = get점수표(schoolName, '국어', INPUT_SCORES.국어.표준점수) || 0;
  const 수학환산 = get점수표(schoolName, INPUT_SCORES.수학.과목, INPUT_SCORES.수학.표준점수) || 0;
  const 영어환산 = get점수표(schoolName, '영어', INPUT_SCORES.영어.등급, '등급') || 0;
  const 탐구1환산 = get점수표(schoolName, INPUT_SCORES.탐구1.과목, INPUT_SCORES.탐구1.표준점수) || 0;
  const 탐구2환산 = get점수표(schoolName, INPUT_SCORES.탐구2.과목, INPUT_SCORES.탐구2.표준점수) || 0;

  console.log(`\n환산점수:`);
  console.log(`  국어: ${국어환산} (표점 ${INPUT_SCORES.국어.표준점수})`);
  console.log(`  수학: ${수학환산} (표점 ${INPUT_SCORES.수학.표준점수})`);
  console.log(`  영어: ${영어환산} (${INPUT_SCORES.영어.등급}등급)`);
  console.log(`  탐구1: ${탐구1환산} (표점 ${INPUT_SCORES.탐구1.표준점수})`);
  console.log(`  탐구2: ${탐구2환산} (표점 ${INPUT_SCORES.탐구2.표준점수})`);

  // 탐구합 계산
  const 탐구점수들 = [탐구1환산, 탐구2환산].sort((a,b) => b-a);
  const 탐구합 = 탐구과목수 === 1 ? 탐구점수들[0] : 탐구점수들[0] + 탐구점수들[1];
  console.log(`  탐구합 (${탐구과목수}과목): ${탐구합}`);

  // 필수점수 계산
  let 필수점수 = 0;
  if (필수설명.includes('국')) 필수점수 += 국어환산;
  if (필수설명.includes('수')) 필수점수 += 수학환산;
  if (필수설명.includes('영')) 필수점수 += 영어환산;
  if (필수설명.includes('탐')) 필수점수 += 탐구합;
  console.log(`\n필수점수 (${필수설명}): ${필수점수}`);

  // 가중택 계산
  let 가중택점수 = 0;
  if (가중택설명 === '국수(2)中가중택2') {
    가중택점수 = Math.max(국어환산 * 1.1 + 수학환산 * 1.3, 국어환산 * 1.3 + 수학환산 * 1.1);
    console.log(`가중택 (${가중택설명}):`);
    console.log(`  MAX(${국어환산}*1.1 + ${수학환산}*1.3, ${국어환산}*1.3 + ${수학환산}*1.1)`);
    console.log(`  = MAX(${국어환산*1.1} + ${수학환산*1.3}, ${국어환산*1.3} + ${수학환산*1.1})`);
    console.log(`  = MAX(${국어환산*1.1 + 수학환산*1.3}, ${국어환산*1.3 + 수학환산*1.1})`);
    console.log(`  = ${가중택점수}`);
  } else if (가중택설명 === '국수(1)中가중택2') {
    가중택점수 = Math.max(2.5 * 국어환산 + 3 * 수학환산, 3 * 국어환산 + 2.5 * 수학환산);
    console.log(`가중택 (${가중택설명}):`);
    console.log(`  MAX(2.5*${국어환산} + 3*${수학환산}, 3*${국어환산} + 2.5*${수학환산})`);
    console.log(`  = MAX(${2.5*국어환산} + ${3*수학환산}, ${3*국어환산} + ${2.5*수학환산})`);
    console.log(`  = MAX(${2.5*국어환산 + 3*수학환산}, ${3*국어환산 + 2.5*수학환산})`);
    console.log(`  = ${가중택점수}`);
  } else if (가중택설명 === '국수中가중택1') {
    const LARGE = (arr, n) => [...arr].sort((a,b) => b-a)[n-1] || 0;
    가중택점수 = 3.5 * LARGE([국어환산, 수학환산], 1) + 2.5 * LARGE([국어환산, 수학환산], 2);
    console.log(`가중택 (${가중택설명}):`);
    console.log(`  3.5*LARGE([${국어환산},${수학환산}],1) + 2.5*LARGE([${국어환산},${수학환산}],2)`);
    console.log(`  = 3.5*${LARGE([국어환산, 수학환산], 1)} + 2.5*${LARGE([국어환산, 수학환산], 2)}`);
    console.log(`  = ${가중택점수}`);
  }

  const 총점 = 필수점수 + 가중택점수;
  console.log(`\n총점: 필수점수(${필수점수}) + 가중택점수(${가중택점수}) = ${총점}`);

  return { 필수점수, 가중택점수, 총점, 환산점수: { 국어환산, 수학환산, 영어환산, 탐구1환산, 탐구2환산 } };
}

// 오류 대학 Excel 데이터 확인
const errorWb = XLSX.readFile('uploads/환산점수 오류 대학.xlsx');
const errorData = XLSX.utils.sheet_to_json(errorWb.Sheets['Sheet1']);

console.log('=== 오류 파일 내 기대값 확인 ===');
['서강인문', '서강자연', '항공통합', '동덕인문'].forEach(school => {
  const row = errorData.find(r => r['점수환산'] === school);
  if (row) {
    console.log(`${school}: 기대값=${row['나와야 할 환산점수']}, 프로덕션값=${row['프로덕션에서 나온 점수']}, 차이=${(row['프로덕션에서 나온 점수'] || 0) - (row['나와야 할 환산점수'] || 0)}`);
  }
});

// 시뮬레이션 실행
simulate('서강인문', '영탐(2)', '국수(2)中가중택2', 2);
simulate('항공통합', '영탐(1)', '국수(1)中가중택2', 1);
simulate('동덕인문', '영탐(1)', '국수中가중택1', 1);
