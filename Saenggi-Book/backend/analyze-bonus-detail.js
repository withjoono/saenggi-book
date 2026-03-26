const XLSX = require('xlsx');
const wb = XLSX.readFile('uploads/26 정시 계산식 2 out.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1']);

// 추가가감이 있는 대학들
const withBonus = data.filter(r => r['추가가감'] && r['추가가감'] !== '0' && r['추가가감'] !== 0);

console.log('=== 추가가감 대학별 상세 분석 ===');
console.log('총 ' + withBonus.length + '개 대학\n');

const results = [];

withBonus.forEach(r => {
  const name = r['환산인자'];
  const formula = String(r['추가가감']);

  let 타입 = '없음';
  let 퍼센트 = 0;
  let 고정점수 = 0;
  let 특정과목 = [];
  let 특정과목퍼센트 = 0;

  // 패턴 분석
  // 1. 과탐 2개 선택시 탐구합 × N%
  const pattern1 = formula.match(/COUNTIFS.*\$B\$20.*[>=]+\s*2.*탐구합.*(\d+)%/i) ||
                   formula.match(/탐구합.*(\d+)%.*COUNTIFS.*\$B\$20.*[>=]+\s*2/i) ||
                   formula.match(/IF\(COUNTIFS.*\$B\$20.*[>=]+\s*2.*탐구합.*(\d+)%/i);

  // 2. 서울대 과탐II 가산
  if (formula.includes('서울') || (formula.includes('$B$21') && formula.includes('$B$23'))) {
    if (formula.includes('OR($B$21') || formula.includes('OR($B$23')) {
      타입 = '서울대_과탐II_가산';
    }
  }

  // 3. 아주대 특수
  if (formula.includes('탐구가산')) {
    타입 = '아주대_탐구가산';
  }

  // 4. 과탐수 × 고정점수
  const pattern4 = formula.match(/(\d+\.?\d*)\s*\*\s*COUNTIFS/i);
  if (pattern4 && !formula.includes('%')) {
    타입 = '과탐수_고정점수';
    고정점수 = parseFloat(pattern4[1]);
  }

  // 5. 수학 > 국어 비교
  if (formula.includes('수학') && (formula.includes('ROUND') || formula.includes('LARGE') || formula.includes('MIN') || formula.includes('MAX'))) {
    타입 = '수학_국어비교_가산';
  }

  // 6. 과탐2개 + 탐구합 %
  if (pattern1) {
    타입 = '과탐2개_탐구합_퍼센트';
    퍼센트 = parseInt(pattern1[1]);
  }

  // 더 정밀한 % 추출
  const percentMatch = formula.match(/(\d+)%/);
  if (percentMatch && 타입 === '없음') {
    퍼센트 = parseInt(percentMatch[1]);
    if (formula.includes('탐구합')) {
      타입 = '과탐2개_탐구합_퍼센트';
    }
  }

  // 특정과목 체크 (화학II, 생물II, 물리II, 지구과학II)
  if (formula.includes('화학') || formula.includes('생물') || formula.includes('물리') || formula.includes('지구')) {
    if (formula.includes('화학')) 특정과목.push('화학');
    if (formula.includes('생물')) 특정과목.push('생물');
    if (formula.includes('물리')) 특정과목.push('물리');
    if (formula.includes('지구')) 특정과목.push('지구과학');

    if (타입 === '없음' || 타입 === '과탐2개_탐구합_퍼센트') {
      if (formula.includes('OR($B$21') || formula.includes('OR($B$23')) {
        타입 = '과탐2개_특정과목_퍼센트';
      }
    }
  }

  results.push({
    name,
    formula: formula.substring(0, 100),
    타입,
    퍼센트,
    고정점수,
    특정과목: 특정과목.join(','),
  });

  console.log(`${name}: ${타입} (${퍼센트}%, ${고정점수}점, [${특정과목.join(',')}])`);
});

console.log('\n=== JSON 형식 ===\n');
console.log(JSON.stringify(results, null, 2));
