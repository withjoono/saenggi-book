// check-silib.ts
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

const 학교 = '시립세무';

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
const 점수표합_한국사포함 = 점수표합 + (한국사 || 0);

console.log(`\n탐구합: ${탐구합}`);
console.log(`점수표합(국수영탐): ${점수표합}`);
console.log(`점수표합(한국사포함): ${점수표합_한국사포함}`);

// 시립영문도 확인
const 학교2 = '시립영문';
console.log(`\n=== ${학교2} 점수표 값 ===\n`);

const 국어2 = 점수표['국어']?.['145']?.[학교2];
const 수학2 = 점수표['수학(미적)']?.['130']?.[학교2];
const 영어2 = 점수표['영어']?.['1']?.[학교2];
const 한국사2 = 점수표['한국사']?.['2']?.[학교2];
const 생명2 = 점수표['생명과학 Ⅰ']?.['69']?.[학교2];
const 화학2 = 점수표['화학 Ⅰ']?.['68']?.[학교2];

console.log(`국어(145): ${국어2}`);
console.log(`수학(130): ${수학2}`);
console.log(`영어(1등급): ${영어2}`);
console.log(`한국사(2등급): ${한국사2}`);
console.log(`생명(69): ${생명2}`);
console.log(`화학(68): ${화학2}`);

const 탐구합2 = (생명2 || 0) + (화학2 || 0);
const 점수표합2 = (국어2 || 0) + (수학2 || 0) + (영어2 || 0) + 탐구합2;

console.log(`\n탐구합: ${탐구합2}`);
console.log(`점수표합(국수영탐): ${점수표합2}`);
