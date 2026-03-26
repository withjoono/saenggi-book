const fs = require('fs');
const path = 'src/modules/jungsi/calculation/calculations/calc-2026.ts';
let content = fs.readFileSync(path, 'utf8');

let modified = false;

// 수정 1: 환산점수계산기에서 이화간호일 때 이화인문 값 사용
const old1 = 'const 환산점수 = 점수데이터[학교];\n  if (환산점수 === undefined) throw new Error(`환산점수 데이터 없음: ${학교}`);';
const new1 = '// 이화간호는 이화인문 점수표 값 사용\n  const 조회학교 = 학교 === \'이화간호\' ? \'이화인문\' : 학교;\n  const 환산점수 = 점수데이터[조회학교];\n  if (환산점수 === undefined) throw new Error(`환산점수 데이터 없음: ${조회학교}`);';

if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('수정 1 완료: 환산점수계산기에서 이화간호→이화인문 리다이렉트 추가');
  modified = true;
} else {
  console.log('수정 1 실패: 기존 코드를 찾을 수 없습니다');
}

// 수정 2: 이화간호 패턴 변경
const old2 = "이화간호: {\n    패턴키: '국0_수0_영0_탐0_한0_외0',\n    패턴: {\n      국: 0,\n      수: 0,\n      영: 0,\n      탐: 0,\n      한: 0,\n      외: 0,\n    },";
const new2 = "이화간호: {\n    패턴키: '국1_수1_영1_탐1_한0_외0',\n    패턴: {\n      국: 1,\n      수: 1,\n      영: 1,\n      탐: 1,\n      한: 0,\n      외: 0,\n    },";

if (content.includes(old2)) {
  content = content.replace(old2, new2);
  console.log('수정 2 완료: 이화간호 패턴을 국1_수1_영1_탐1_한0_외0으로 변경');
  modified = true;
} else {
  console.log('수정 2 실패: 기존 패턴을 찾을 수 없습니다');
}

// 수정 3: calc이화2026에서 이화간호 특수 처리 제거
const old3 = "// 이화간호: 인문/자연 중 유리한 것 선택\n  if (학교 === '이화간호') {\n    const 인문점수 = calc이화단일(params, 0.3, 0.3, 0.2, 0.2, false);\n    const 자연점수 = calc이화단일(params, 0.25, 0.3, 0.2, 0.25, true);\n    const 내점수 = Math.max(인문점수, 자연점수);\n\n    const 탐구표준점수 = [\n      params.과탐1,\n      params.과탐2,\n      params.사탐1,\n      params.사탐2,\n    ]\n      .filter((과목): 과목 is 과목점수Type => !!과목)\n      .map((과목) => 과목.표준점수 || 0)\n      .sort((a, b) => b - a)\n      .slice(0, 2)\n      .reduce((sum, score) => sum + score, 0);\n\n    const 표점합 =\n      (params.국어.표준점수 || 0) + (params.수학.표준점수 || 0) + 탐구표준점수;\n    return { success: true, 내점수, 표점합 };\n  }\n\n  // 이화인문, 이화자연: 일반 패턴 계산";
const new3 = "// 이화간호, 이화인문, 이화자연: 일반 패턴 계산 (이화간호는 환산점수계산기에서 이화인문 값 사용)";

if (content.includes(old3)) {
  content = content.replace(old3, new3);
  console.log('수정 3 완료: calc이화2026에서 이화간호 특수 처리 제거');
  modified = true;
} else {
  console.log('수정 3 실패: 기존 코드를 찾을 수 없습니다');
  // 현재 calc이화2026 코드 위치 출력
  const idx = content.indexOf('const calc이화2026 =');
  if (idx > -1) {
    console.log('calc이화2026 위치:', idx);
    console.log('코드 샘플:', content.substring(idx, idx + 200));
  }
}

if (modified) {
  fs.writeFileSync(path, content, 'utf8');
  console.log('\n파일 저장 완료');
} else {
  console.log('\n수정사항 없음');
}
