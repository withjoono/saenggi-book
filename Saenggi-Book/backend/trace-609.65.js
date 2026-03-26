// trace-609.65.js
// 609.65가 어떻게 나올 수 있는지 역추적

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

const 학교 = '동아의학';

console.log('=== 619.85 정상 계산 ===');
console.log('국어(145):', 점수표['국어']['145'][학교]);
console.log('수학(130):', 점수표['수학(미적)']['130'][학교]);
console.log('영어(1등급):', 점수표['영어']['1'][학교]);
console.log('한국사(2등급):', 점수표['한국사']['2'][학교]);
console.log('생명과학(69):', 점수표['생명과학 Ⅰ']['69'][학교]);
console.log('화학(68):', 점수표['화학 Ⅰ']['68'][학교]);

const 정상합계 = 145 + 130 + 200 + 1 + 72.45 + 71.4;
console.log('합계:', 정상합계);

console.log('\n=== 609.65 역산 ===');
console.log('619.85 - 609.65 =', 619.85 - 609.65);

// 가설 1: 수학이 다르게 계산됨
console.log('\n가설 1: 수학 점수 문제');
// 609.65 = 145 + X + 200 + 1 + 143.85
// X = 609.65 - 145 - 200 - 1 - 143.85 = 119.8
console.log('수학이 119.8이면 총점:', 145 + 119.8 + 200 + 1 + 72.45 + 71.4);

// 수학 130점 표준점수로 다른 학교 환산점수 확인
console.log('\n수학(미적) 130점의 각 학교별 환산점수:');
const 수학130점 = 점수표['수학(미적)']['130'];
if (수학130점) {
  const schools = ['동아의학', '동아인문', '동아자연', '동아방송'];
  schools.forEach(s => {
    console.log(`  ${s}:`, 수학130점[s]);
  });
}

// 가설 2: 탐구 점수 문제
console.log('\n가설 2: 탐구 점수 문제');
// 609.65 = 145 + 130 + 200 + 1 + X
// X = 609.65 - 476 = 133.65
console.log('탐구합이 133.65면 총점:', 145 + 130 + 200 + 1 + 133.65);
console.log('정상 탐구합:', 72.45 + 71.4, '= 143.85');
console.log('차이:', 143.85 - 133.65, '= 10.2');

// 가설 3: 수학(확통)으로 계산됨
console.log('\n가설 3: 수학(확통)으로 계산?');
if (점수표['수학(확통)'] && 점수표['수학(확통)']['130']) {
  console.log('수학(확통) 130점 동아의학:', 점수표['수학(확통)']['130'][학교]);
}

// 가설 4: 점수표에서 잘못된 키로 조회
console.log('\n=== 점수표 키 확인 ===');
console.log('수학 관련 키:', Object.keys(점수표).filter(k => k.includes('수학')));

// 가설 5: 수학이 표준점수 대신 다른 값으로 조회됨
console.log('\n가설 5: 수학 표준점수 119~121점대 환산점수');
['119', '120', '121'].forEach(score => {
  const val = 점수표['수학(미적)']?.[score]?.[학교];
  if (val !== undefined) {
    console.log(`  수학(미적) ${score}점:`, val);
    const total = 145 + val + 200 + 1 + 72.45 + 71.4;
    console.log(`    총합: ${total}`);
  }
});

// 609.65 정확히 맞추는 조합 찾기
console.log('\n=== 609.65 정확히 맞추는 조합 찾기 ===');
const targetScore = 609.65;
const 영어 = 200;
const 한국사 = 1;
const 탐구 = 143.85;

// 국어+수학 조합 찾기
const 필요한국수합 = targetScore - 영어 - 한국사 - 탐구;
console.log('국어+수학 필요합:', 필요한국수합);

// 국어 145점일 때 수학
console.log('국어 145일 때 수학:', 필요한국수합 - 145);

// 수학 130점일 때 국어
console.log('수학 130일 때 국어:', 필요한국수합 - 130);

// 점수표에서 수학 119.8 근처 값 찾기
console.log('\n=== 수학(미적) 환산점수 119~120 근처 ===');
Object.keys(점수표['수학(미적)']).forEach(score => {
  const val = 점수표['수학(미적)'][score][학교];
  if (typeof val === 'number' && val >= 118 && val <= 122) {
    console.log(`수학(미적) 표준점수 ${score}: 환산점수 ${val}`);
  }
});
