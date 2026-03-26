// test-subjectname-issue.js
// 영어/한국사 과목명이 다를 경우 어떤 일이 일어나는지 테스트

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

// 점수표에 있는 영어/한국사 관련 키 확인
console.log('=== 점수표 영어/한국사 관련 키 ===');
const keys = Object.keys(점수표);
keys.filter(k => k.includes('영어') || k.includes('한국사') || k.includes('English') || k.includes('History')).forEach(k => {
  console.log('키:', k);
});

console.log('');
console.log('=== 영어 데이터 샘플 ===');
console.log('영어 1등급 동아의학:', 점수표['영어']?.['1']?.['동아의학']);
console.log('영어 0점 동아의학:', 점수표['영어']?.['0']?.['동아의학']);

console.log('');
console.log('=== 한국사 데이터 샘플 ===');
console.log('한국사 2등급 동아의학:', 점수표['한국사']?.['2']?.['동아의학']);
console.log('한국사 0점 동아의학:', 점수표['한국사']?.['0']?.['동아의학']);

// 만약 subjectName이 빈 문자열이거나 다른 값이면?
console.log('');
console.log('=== 잘못된 과목명 시뮬레이션 ===');

// 시나리오 1: 영어의 과목명이 빈 문자열
console.log('빈 문자열 키 존재?', 점수표[''] !== undefined);

// 시나리오 2: 영어의 과목명이 'English'
console.log('English 키 존재?', 점수표['English'] !== undefined);

// 환산점수계산기 시뮬레이션
function 환산점수계산기(과목, 학교) {
  if (!과목?.과목 || !과목?.등급) {
    return { error: `${과목?.과목 || '과목'} 성적 없음` };
  }

  const 과목데이터 = 점수표[과목.과목];
  if (!과목데이터) return { error: `과목 데이터 없음: ${과목.과목}` };

  // 영어와 한국사는 등급으로 조회, 나머지는 표준점수로 조회
  const 조회키 =
    과목.과목 === '영어' || 과목.과목 === '한국사'
      ? String(과목.등급)
      : String(과목.표준점수);

  const 점수데이터 = 과목데이터[조회키];
  if (!점수데이터) {
    return { error: `점수 데이터 없음: ${과목.과목} ${조회키}` };
  }

  const 환산점수 = 점수데이터[학교];
  if (환산점수 === undefined) return { error: `환산점수 데이터 없음: ${학교}` };

  return { value: typeof 환산점수 === 'string' ? 0 : 환산점수 };
}

console.log('');
console.log('=== 환산점수 계산 테스트 ===');

// 정상 케이스
console.log('영어(과목명="영어", 등급=1):', 환산점수계산기({ 과목: '영어', 등급: 1, 표준점수: 0 }, '동아의학'));
console.log('한국사(과목명="한국사", 등급=2):', 환산점수계산기({ 과목: '한국사', 등급: 2, 표준점수: 0 }, '동아의학'));

// 비정상 케이스 - 빈 문자열
console.log('영어(과목명="", 등급=1):', 환산점수계산기({ 과목: '', 등급: 1, 표준점수: 0 }, '동아의학'));
console.log('한국사(과목명="", 등급=2):', 환산점수계산기({ 과목: '', 등급: 2, 표준점수: 0 }, '동아의학'));

// 프론트엔드가 보낼 수 있는 값들
const possibleNames = ['영어', 'English', '영어영역', '', undefined, null];
console.log('');
console.log('=== 가능한 영어 과목명 테스트 ===');
possibleNames.forEach(name => {
  const result = 환산점수계산기({ 과목: name, 등급: 1, 표준점수: 0 }, '동아의학');
  console.log(`과목명="${name}":`, result);
});

// 10.2점 차이 역산
console.log('');
console.log('=== 10.2점 차이 역산 ===');
// 619.85 - X = 609.65
// X = 10.2

// 영어 200점에서 10.2를 빼면? 189.8
// 한국사 1점에서 10.2를 빼면? -9.2

// 영어가 아예 계산되지 않으면? (200 빠짐)
console.log('영어 200점이 빠지면: 619.85 - 200 =', 619.85 - 200);
// 한국사가 아예 계산되지 않으면? (1점 빠짐)
console.log('한국사 1점이 빠지면: 619.85 - 1 =', 619.85 - 1);

// 탐구 1개가 빠지면?
console.log('생명과학 72.45가 빠지면: 619.85 - 72.45 =', 619.85 - 72.45);
console.log('화학 71.4가 빠지면: 619.85 - 71.4 =', 619.85 - 71.4);

// 한국사가 자동추가 안되면?
console.log('');
console.log('=== 한국사 자동추가 문제? ===');
// 패턴: 국1_수1_영1_탐1_한0_외0
// 한국사 패턴이 0이면 자동으로 추가되어야 함
// 만약 안되면 1점 차이

// 영어가 200이 아닌 다른 값?
console.log('');
console.log('=== 영어 등급별 점수 ===');
for (let i = 1; i <= 9; i++) {
  const score = 점수표['영어']?.[String(i)]?.['동아의학'];
  if (score !== undefined) {
    console.log(`영어 ${i}등급:`, score);
    console.log(`  619.85 - ${score} + (missing) =`, 619.85 - 200 + score);
  }
}
