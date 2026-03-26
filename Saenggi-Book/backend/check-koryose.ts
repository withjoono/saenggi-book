// check-koryose.ts
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

const 학교들 = ['고려세기계', '고려세빅데사', '고려세경통', '고려세문화'];
const 비율맵: Record<string, number> = {
  '고려세기계': 1.890949,
  '고려세빅데사': 1.890949,
  '고려세경통': 1.897742,
  '고려세문화': 1.906854,
};

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
  const 점수표합 = 국어 + 수학 + 영어 + 탐구합;
  const 비율 = 비율맵[학교];
  const 계산값 = 점수표합 * 비율;

  console.log(`\n점수표합: ${점수표합.toFixed(2)}`);
  console.log(`비율: ${비율}`);
  console.log(`계산값 (점수표합 × 비율): ${계산값.toFixed(2)}`);
});
