const XLSX = require('xlsx');
const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== 70% cut 데이터 확인 ===\n');

// 서울대학교 데이터 찾기
let inSeoulUniv = false;
for (let i = 0; i < data.length; i++) {
  const row = data[i];

  if (row[1] && row[1].includes('서울대학교')) {
    inSeoulUniv = true;
    console.log(`\n${i}행: 서울대학교 발견`);
    continue;
  }

  if (inSeoulUniv && row[1] && row[1].includes('대학')) {
    break; // 다음 대학 시작
  }

  if (inSeoulUniv && row[3]) {
    console.log(`${i}행: ${row[3]}`);
    console.log(`  [9] 50%cut: ${row[9]}, [10] 70%cut: ${row[10]}`);
    console.log(`  전체 row: ${JSON.stringify(row.slice(0, 15))}`);
  }
}

// 50%cut과 70%cut이 같은 값인 경우 확인
console.log('\n\n=== 50%cut == 70%cut 확인 ===');
let sameCount = 0;
let diffCount = 0;
let only50 = 0;

for (let i = 8; i < data.length; i++) {
  const row = data[i];
  if (row[3] && typeof row[3] === 'string' && !['모집단위', '구분'].includes(row[3])) {
    const cut50 = parseFloat(row[9]);
    const cut70 = parseFloat(row[10]);

    if (!isNaN(cut50) && !isNaN(cut70)) {
      if (cut50 === cut70) sameCount++;
      else diffCount++;
    } else if (!isNaN(cut50)) {
      only50++;
    }
  }
}

console.log(`50%==70%: ${sameCount}개`);
console.log(`50%!=70%: ${diffCount}개`);
console.log(`50%만 있음: ${only50}개`);
