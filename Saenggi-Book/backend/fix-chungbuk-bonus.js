const fs = require('fs');
const filePath = 'src/modules/jungsi/calculation/calculations/calc-2026.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 충북_탐구비율_선택 케이스 수정
const oldCase = `    case '충북_탐구비율_선택': {
      // 충북 탐구비율 × 선택점수
      // 탐구 선택 비율에 따라 선택점수를 가감
      if (선택점수) {
        const 전체탐구 = [
          params.과탐1,
          params.과탐2,
          params.사탐1,
          params.사탐2,
        ].filter(Boolean).length;
        if (전체탐구 > 0) {
          return (과탐개수 / 전체탐구) * 선택점수;
        }
      }
      return 0;
    }`;

const newCase = `    case '충북_탐구비율_선택': {
      // 충북 탐구비율 가산점
      // 과탐 선택시 과목당 19점 가산 (과탐 2개 = 38점)
      // 충북은 선택점수가 없으므로 과탐개수에 따른 고정 가산점 적용
      const 과탐가산점 = 19; // 과탐 1개당 가산점
      return 과탐개수 * 과탐가산점;
    }`;

if (content.includes(oldCase)) {
  content = content.replace(oldCase, newCase);
  console.log('✅ 충북_탐구비율_선택 케이스 수정 완료');
} else {
  console.log('❌ 충북_탐구비율_선택 케이스를 찾을 수 없음');
  console.log('현재 충북 케이스 내용 확인 중...');

  // 다른 형태로 찾아보기
  const regex = /case '충북_탐구비율_선택':[\s\S]*?return 0;\s*}/;
  const match = content.match(regex);
  if (match) {
    console.log('찾은 내용:\n', match[0].substring(0, 200));
    content = content.replace(regex, newCase);
    console.log('✅ 정규식으로 수정 완료');
  } else {
    console.log('❌ 정규식으로도 찾을 수 없음');
  }
}

fs.writeFileSync(filePath, content);
console.log('\n파일 저장 완료');
