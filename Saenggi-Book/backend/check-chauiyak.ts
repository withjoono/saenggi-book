// check-chauiyak.ts
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

const 학교 = '차의약학';

console.log(`=== ${학교} 점수표 값 ===\n`);

const 국어 = 점수표['국어']?.['145']?.[학교];
const 수학 = 점수표['수학(미적)']?.['130']?.[학교];
const 영어 = 점수표['영어']?.['1']?.[학교];
const 한국사 = 점수표['한국사']?.['2']?.[학교];
const 생명 = 점수표['생명과학 Ⅰ']?.['69']?.[학교];
const 화학 = 점수표['화학 Ⅰ']?.['68']?.[학교];

console.log(`국어(145): ${국어}`);
console.log(`수학(130): ${수학}`);
console.log(`영어(1등급): ${영어}`);
console.log(`한국사(2등급): ${한국사}`);
console.log(`생명(69): ${생명}`);
console.log(`화학(68): ${화학}`);

const 탐구합 = (생명 || 0) + (화학 || 0);
const 점수표합 = (국어 || 0) + (수학 || 0) + (영어 || 0) + 탐구합;

console.log(`\n탐구합: ${탐구합}`);
console.log(`점수표합: ${점수표합}`);

// 차의약학 조건 확인
console.log(`\n=== 차의약학 조건 확인 ===`);
// 추가가감이 있는지 확인해야 함
