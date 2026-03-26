const fs = require('fs');
const filePath = 'src/modules/jungsi/calculation/calculations/calc-2026.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 아주대_탐구가산 케이스 수정 - 총 환산점수를 기준으로 계산
const oldCase = `    case '아주대_탐구가산': {
      // 아주대 특수 탐구 가산: 과탐 II 선택시 과목당 3%, 과탐 I 선택시 과목당 1.5%
      let 가산점 = 0;
      const 탐구환산합 = 탐구환산점수합 || 0;
      for (const 과탐 of 과탐목록) {
        if (과탐) {
          if (과탐II과목.includes(과탐.과목)) {
            // 과탐 II: 3%
            가산점 += 탐구환산합 * 0.03;
          } else if (과탐.과목.includes('Ⅰ')) {
            // 과탐 I: 1.5%
            가산점 += 탐구환산합 * 0.015;
          }
        }
      }
      return 가산점;
    }`;

const newCase = `    case '아주대_탐구가산': {
      // 아주대 특수 탐구 가산: 과탐 II 선택시 과목당 3%, 과탐 I 선택시 과목당 1.5%
      // 가산점 = 총 환산점수(국+수+영+탐) × 퍼센트
      let 가산점 = 0;
      const 총환산점수 = (params.국어환산점수 || 0) +
                        (params.수학환산점수 || 0) +
                        (params.영어환산점수 || 0) +
                        (탐구환산점수합 || 0);

      for (const 과탐 of 과탐목록) {
        if (과탐) {
          if (과탐II과목.includes(과탐.과목)) {
            // 과탐 II: 총환산 × 3%
            가산점 += 총환산점수 * 0.03;
          } else if (과탐.과목.includes('Ⅰ')) {
            // 과탐 I: 총환산 × 1.5%
            가산점 += 총환산점수 * 0.015;
          }
        }
      }
      return 가산점;
    }`;

if (content.includes(oldCase)) {
  content = content.replace(oldCase, newCase);
  console.log('✅ 아주대_탐구가산 케이스 수정 완료 (총환산점수 기준으로 변경)');
} else {
  console.log('❌ 아주대_탐구가산 케이스를 찾을 수 없음');
  console.log('정규식으로 시도 중...');

  // 다른 형태로 찾아보기
  const regex = /case '아주대_탐구가산': \{[\s\S]*?return 가산점;\s*\}/;
  const match = content.match(regex);
  if (match) {
    console.log('찾은 내용 (처음 100자):\n', match[0].substring(0, 100));
    content = content.replace(regex, newCase);
    console.log('✅ 정규식으로 수정 완료');
  } else {
    console.log('❌ 정규식으로도 찾을 수 없음');
  }
}

fs.writeFileSync(filePath, content);
console.log('\n파일 저장 완료');
