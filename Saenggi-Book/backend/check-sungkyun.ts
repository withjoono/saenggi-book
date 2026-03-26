// check-sungkyun.ts
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

const 학교들 = ['성균공학', '성균글바메', '성균수교'];

학교들.forEach(학교 => {
  console.log(`\n=== ${학교} 점수표 값 ===`);

  const 국어 = 점수표['국어']?.['145']?.[학교] || 0;
  const 수학 = 점수표['수학(미적)']?.['130']?.[학교] || 0;
  const 영어 = 점수표['영어']?.['1']?.[학교] || 0;
  const 한국사 = 점수표['한국사']?.['2']?.[학교] || 0;
  const 생명 = 점수표['생명과학 Ⅰ']?.['69']?.[학교] || 0;
  const 화학 = 점수표['화학 Ⅰ']?.['68']?.[학교] || 0;

  console.log(`국어(145): ${국어}`);
  console.log(`수학(130): ${수학}`);
  console.log(`영어(1등급): ${영어}`);
  console.log(`한국사(2등급): ${한국사}`);
  console.log(`생명(69): ${생명}`);
  console.log(`화학(68): ${화학}`);

  const 탐구합 = 생명 + 화학;
  console.log(`탐구합: ${탐구합}`);

  // 자연계 공식: 3*국 + 4*수 + 1*영 + 2*탐
  const 자연공식 = 3 * 국어 + 4 * 수학 + 1 * 영어 + 2 * 탐구합;
  // 인문계 공식: 4*국 + 3*수 + 1*영 + 2*탐
  const 인문공식 = 4 * 국어 + 3 * 수학 + 1 * 영어 + 2 * 탐구합;
  // MAX 공식: 4*LARGE1 + 3*LARGE2 + 2*LARGE3 + 1*LARGE4
  const 항목들 = [국어, 수학, 영어, 탐구합].sort((a, b) => b - a);
  const MAX공식 = 4 * 항목들[0] + 3 * 항목들[1] + 2 * 항목들[2] + 1 * 항목들[3];

  console.log(`\n계산 결과:`);
  console.log(`  자연공식 (3*국+4*수+1*영+2*탐): ${자연공식.toFixed(2)}`);
  console.log(`  인문공식 (4*국+3*수+1*영+2*탐): ${인문공식.toFixed(2)}`);
  console.log(`  MAX공식 (4*L1+3*L2+2*L3+1*L4): ${MAX공식.toFixed(2)}`);
});
