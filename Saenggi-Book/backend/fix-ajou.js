const fs = require('fs');
const path = 'src/modules/jungsi/calculation/calculations/calc-2026.ts';
let content = fs.readFileSync(path, 'utf8');

// 아주대 탐구가산 로직 수정 - 학과별 다른 비율 적용
const oldCode = `case '아주대_탐구가산': {
      // 아주대 특수 탐구 가산: 과탐 II 선택시 과목당 5%, 과탐 I 선택시 과목당 5%
      // 가산점 = 총 환산점수(국+수+영+탐) × 퍼센트
      let 가산점 = 0;
      const 총환산점수 = (params.국어환산점수 || 0) +
                        (params.수학환산점수 || 0) +
                        (params.영어환산점수 || 0) +
                        (탐구환산점수합 || 0);

      for (const 과탐 of 과탐목록) {
        if (과탐) {
          if (과탐II과목.includes(과탐.과목)) {
            // 과탐 II: 총환산 × 5%
            가산점 += 총환산점수 * 0.05;
          } else if (과탐.과목.includes('Ⅰ')) {
            // 과탐 I: 총환산 × 5%
            가산점 += 총환산점수 * 0.05;
          }
        }
      }
      return 가산점;
    }`;

const newCode = `case '아주대_탐구가산': {
      // 아주대 특수 탐구 가산: 학과별 다른 비율 적용
      // 자연계열(의학,자연,국디): 과탐I/II 5%, 경영: 3.2%, 인문: 4.1%
      let 가산점 = 0;
      const 총환산점수 = (params.국어환산점수 || 0) +
                        (params.수학환산점수 || 0) +
                        (params.영어환산점수 || 0) +
                        (탐구환산점수합 || 0);

      // 학과별 가산 비율 설정
      let 과탐비율 = 0.05; // 기본값 5%

      if (params.학교 === '아주경영') {
        과탐비율 = 0.032; // 경영: 3.2%
      } else if (params.학교 === '아주인문') {
        과탐비율 = 0.041; // 인문: 4.1%
      }

      for (const 과탐 of 과탐목록) {
        if (과탐) {
          if (과탐II과목.includes(과탐.과목) || 과탐.과목.includes('Ⅰ')) {
            가산점 += 총환산점수 * 과탐비율;
          }
        }
      }
      return 가산점;
    }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(path, content, 'utf8');
  console.log('아주대 학과별 탐구가산 비율 수정 완료');
} else {
  console.log('코드를 찾을 수 없습니다. 현재 코드 확인 필요');
  // 현재 아주대 코드 출력
  const idx = content.indexOf("case '아주대_탐구가산'");
  if (idx > -1) {
    console.log('현재 코드:');
    console.log(content.substring(idx, idx + 800));
  }
}
