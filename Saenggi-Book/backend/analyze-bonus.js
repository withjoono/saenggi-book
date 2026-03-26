const XLSX = require('xlsx');
const calcWb = XLSX.readFile('uploads/26 정시 계산식 2 out.xlsx');
const calcData = XLSX.utils.sheet_to_json(calcWb.Sheets['Sheet1']);

// 추가가감이 있는 대학들
const withBonus = calcData.filter(r => r['추가가감'] && r['추가가감'] !== '0' && r['추가가감'] !== 0);

console.log('=== 추가가감 대학별 상세 분석 ===\n');

withBonus.forEach(r => {
  const name = r['환산인자'];
  const formula = r['추가가감'];

  console.log(`[${name}]`);
  console.log(`수식: ${formula}`);

  // 패턴 분석
  let pattern = '';
  let implementation = '';

  // 패턴 1: 과탐 2개 선택시 탐구합 × N%
  if (formula.match(/COUNTIFS.*\$B\$20.*2.*탐구합.*(\d+)%/)) {
    const percent = formula.match(/(\d+)%/)?.[1] || '?';
    pattern = `과탐 2개 선택시 탐구합 × ${percent}%`;
    implementation = `if (과탐개수 >= 2) 추가점수 = 탐구합 * 0.${percent.padStart(2, '0')}`;
  }
  // 패턴 2: 과탐 2개 + 특정과목 선택시
  else if (formula.includes('OR($B$21') || formula.includes('OR($B$23')) {
    pattern = '과탐 2개 + 특정과목(화학II/생물II 등) 선택시 가산';
  }
  // 패턴 3: 과탐 과목수 × 고정점수
  else if (formula.match(/(\d+\.?\d*)\*COUNTIFS/)) {
    const points = formula.match(/(\d+\.?\d*)\*COUNTIFS/)?.[1];
    pattern = `과탐 과목수 × ${points}점`;
    implementation = `추가점수 = 과탐개수 * ${points}`;
  }
  // 패턴 4: 수학 > 국어 비교
  else if (formula.includes('수학') && (formula.includes('ROUND') || formula.includes('LARGE'))) {
    pattern = '수학 > 국어 조건시 가산';
  }
  // 패턴 5: 아주대 특수
  else if (formula.includes('탐구가산')) {
    pattern = '아주대 특수 탐구 가산';
  }
  // 기타
  else {
    pattern = '기타';
  }

  console.log(`패턴: ${pattern}`);
  if (implementation) console.log(`구현: ${implementation}`);
  console.log('');
});

// 요약
console.log('\n=== 패턴별 요약 ===');
const summary = {};
withBonus.forEach(r => {
  const formula = r['추가가감'];
  let pattern = '';

  if (formula.match(/COUNTIFS.*\$B\$20.*2.*(\d+)%.*탐구합/) || formula.match(/COUNTIFS.*\$B\$20.*2.*탐구합.*(\d+)%/)) {
    pattern = '과탐2개_탐구합%';
  } else if (formula.includes('OR($B$21') || formula.includes('OR($B$23')) {
    pattern = '과탐2개_특정과목%';
  } else if (formula.match(/\d+\.?\d*\*COUNTIFS/)) {
    pattern = '과탐수×고정점';
  } else if (formula.includes('수학') && (formula.includes('ROUND') || formula.includes('LARGE'))) {
    pattern = '수학>국어가산';
  } else if (formula.includes('탐구가산')) {
    pattern = '아주대특수';
  } else {
    pattern = '기타';
  }

  if (!summary[pattern]) summary[pattern] = [];
  summary[pattern].push(r['환산인자']);
});

Object.entries(summary).forEach(([pattern, names]) => {
  console.log(`\n[${pattern}] (${names.length}개)`);
  console.log(names.join(', '));
});
