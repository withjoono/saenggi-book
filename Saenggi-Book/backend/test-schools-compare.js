const 점수표 = require('./src/modules/jungsi/calculation/data/점수표-26-정시.json');
const schools = ['동아의학', '동아인문', '동아자연', '동아방송'];

console.log('=== 동아* 학교별 환산점수 비교 ===');
schools.forEach(school => {
  const 국어 = 점수표['국어']['145'] ? 점수표['국어']['145'][school] : undefined;
  const 수학 = 점수표['수학(미적)']['130'] ? 점수표['수학(미적)']['130'][school] : undefined;
  const 영어 = 점수표['영어']['1'] ? 점수표['영어']['1'][school] : undefined;
  const 한국사 = 점수표['한국사']['2'] ? 점수표['한국사']['2'][school] : undefined;
  const 탐구1 = 점수표['생명과학 Ⅰ']['69'] ? 점수표['생명과학 Ⅰ']['69'][school] : undefined;
  const 탐구2 = 점수표['화학 Ⅰ']['68'] ? 점수표['화학 Ⅰ']['68'][school] : undefined;

  console.log(school + ':');
  console.log('  국어(145):', 국어);
  console.log('  수학(130):', 수학);
  console.log('  영어(1등급):', 영어);
  console.log('  한국사(2등급):', 한국사);
  console.log('  생명과학Ⅰ(69):', 탐구1);
  console.log('  화학Ⅰ(68):', 탐구2);

  const 탐구합 = ((탐구1 || 0) + (탐구2 || 0));
  const 계산값 = (국어 || 0) + (수학 || 0) + (영어 || 0) + (한국사 || 0) + 탐구합;
  console.log('  탐구합:', 탐구합.toFixed(2));
  console.log('  총 계산값:', 계산값.toFixed(2));
  console.log('');
});

// 609.65가 어디서 나올 수 있는지 역산
console.log('=== 609.65 역추적 ===');
const targetScore = 609.65;
console.log('619.85 - 609.65 =', 619.85 - 609.65);

// 한국사가 0이면?
console.log('한국사 없이 (동아의학): 145 + 130 + 200 + 0 + 143.85 =', 145 + 130 + 200 + 0 + 143.85);

// 탐구 1개만?
console.log('탐구 1개만 (동아의학): 145 + 130 + 200 + 1 + 72.45 =', 145 + 130 + 200 + 1 + 72.45);
