const fs = require('fs');
const filePath = 'src/modules/jungsi/calculation/calculations/calc-2026.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 국수영탐(1)한中가중택2 수정 - 한국사 제외하고 국수영탐 4과목 중 선택
const oldCase = `    // 국수영탐(1)한中가중택2 (대진인문/자연, 신한통합1)
    case '국수영탐(1)한中가중택2':
      return (
        6 * LARGE([국어, 수학, 영어], 1) +
        4 * Math.max(LARGE([국어, 수학, 영어], 2), 탐구합, 한국사)
      );`;

// 국수영탐(1)에서 '한'은 한국사 반영 여부를 나타내지만,
// 가중택 선택에서는 제외되고 별도로 처리되어야 할 수 있음
const newCase = `    // 국수영탐(1)한中가중택2 (대진인문/자연, 신한통합1)
    // 국수영탐(1) 4과목 중 상위 2개 × 가중치(6+4)
    case '국수영탐(1)한中가중택2':
      return (
        6 * LARGE([국어, 수학, 영어, 탐구합], 1) +
        4 * LARGE([국어, 수학, 영어, 탐구합], 2)
      );`;

if (content.includes(oldCase)) {
  content = content.replace(oldCase, newCase);
  console.log('✅ 국수영탐(1)한中가중택2 케이스 수정 완료');
} else {
  console.log('❌ 케이스를 찾을 수 없음');

  // 정규식으로 시도
  const regex = /\/\/ 국수영탐\(1\)한中가중택2[\s\S]*?case '국수영탐\(1\)한中가중택2':[\s\S]*?6 \* LARGE\(\[국어, 수학, 영어\], 1\)[\s\S]*?\);/;
  const match = content.match(regex);
  if (match) {
    console.log('정규식으로 찾음:', match[0].substring(0, 50));
    content = content.replace(regex, newCase);
    console.log('✅ 정규식으로 수정 완료');
  } else {
    console.log('❌ 정규식으로도 찾을 수 없음');
  }
}

fs.writeFileSync(filePath, content);
console.log('\n파일 저장 완료');
