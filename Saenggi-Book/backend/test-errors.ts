import { calc정시환산점수2026 } from './src/modules/jungsi/calculation/calculations/calc-2026';

const testSchools = [
  { name: '이화간호', expected: 897.85 },
  { name: '고려세경통', expected: 860.78 },
  { name: '고려세문화', expected: 858.22 },
  { name: '고려세신약', expected: 872.77 },
  { name: '고려세기계', expected: 865.96 },
  { name: '경기자전', expected: 83.65 },
  { name: '가천의학', expected: 828.25 },
  { name: '아주의학', expected: 839.53 },
];

const INPUT = {
  국어: { 과목: '국어', 표준점수: 120, 등급: 2, 백분위: 88 },
  수학: { 과목: '수학(미적)', 표준점수: 120, 등급: 2, 백분위: 88 },
  영어: { 과목: '영어', 등급: 2, 표준점수: 2 },
  한국사: { 과목: '한국사', 등급: 2, 표준점수: 2 },
  과탐1: { 과목: '물리학 Ⅰ', 표준점수: 60, 등급: 3, 백분위: 75 },
  과탐2: { 과목: '생명과학 Ⅰ', 표준점수: 60, 등급: 3, 백분위: 75 },
};

async function test() {
  console.log('=== 오류 대학 환산점수 테스트 ===\n');

  for (const { name, expected } of testSchools) {
    try {
      const result = await calc정시환산점수2026({
        학교: name,
        이문과: '자연',
        국어: INPUT.국어,
        수학: INPUT.수학,
        영어: INPUT.영어,
        한국사: INPUT.한국사,
        과탐1: INPUT.과탐1,
        과탐2: INPUT.과탐2,
      });

      if (result.success) {
        const diff = result.내점수 - expected;
        const status = Math.abs(diff) < 1.5 ? '✓' : 'X';
        console.log(name + ': ' + expected.toFixed(2) + ' -> ' + result.내점수.toFixed(2) + ' (차이: ' + diff.toFixed(2) + ') ' + status);
      } else {
        console.log(name + ': 계산 실패 - ' + result.result);
      }
    } catch (e: any) {
      console.log(name + ': 오류 - ' + e.message);
    }
  }
}

test();
