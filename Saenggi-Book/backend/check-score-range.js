/**
 * 점수표 JSON에서 표준점수 범위 확인
 */
const data = require('./src/modules/jungsi/calculation/data/점수표-25-정시-1210-점수표.json');

console.log('=== 국어 표준점수 범위 ===');
const korKeys = Object.keys(data['국어']);
console.log('국어 최소:', Math.min(...korKeys.map(Number)));
console.log('국어 최대:', Math.max(...korKeys.map(Number)));
console.log('120 존재:', data['국어']['120'] ? 'Yes' : 'No');

console.log('');
console.log('=== 수학(미적) 표준점수 범위 ===');
const mathKeys = Object.keys(data['수학(미적)']);
console.log('수학 최소:', Math.min(...mathKeys.map(Number)));
console.log('수학 최대:', Math.max(...mathKeys.map(Number)));
console.log('120 존재:', data['수학(미적)']['120'] ? 'Yes' : 'No');

console.log('');
console.log('=== 영어 데이터 구조 ===');
if (data['영어']) {
  const engKeys = Object.keys(data['영어']);
  console.log('영어 키 종류:', engKeys.slice(0, 10));
  console.log('0 존재:', data['영어']['0'] ? 'Yes' : 'No');
} else {
  console.log('영어 데이터 없음');
}

console.log('');
console.log('=== 한국사 데이터 구조 ===');
if (data['한국사']) {
  const histKeys = Object.keys(data['한국사']);
  console.log('한국사 키 종류:', histKeys.slice(0, 10));
  console.log('0 존재:', data['한국사']['0'] ? 'Yes' : 'No');
} else {
  console.log('한국사 데이터 없음');
}

console.log('');
console.log('=== 물리학 Ⅰ 표준점수 범위 ===');
const physicsKeys = Object.keys(data['물리학 Ⅰ']);
console.log('물리학 최소:', Math.min(...physicsKeys.map(Number)));
console.log('물리학 최대:', Math.max(...physicsKeys.map(Number)));
console.log('60 존재:', data['물리학 Ⅰ']['60'] ? 'Yes' : 'No');

console.log('');
console.log('=== 생명과학 Ⅰ 표준점수 범위 ===');
const bioKeys = Object.keys(data['생명과학 Ⅰ']);
console.log('생명과학 최소:', Math.min(...bioKeys.map(Number)));
console.log('생명과학 최대:', Math.max(...bioKeys.map(Number)));
console.log('60 존재:', data['생명과학 Ⅰ']['60'] ? 'Yes' : 'No');
