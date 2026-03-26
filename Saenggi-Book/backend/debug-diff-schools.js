const XLSX = require('xlsx');

// Excel 파일 읽기
const calcWb = XLSX.readFile('uploads/26 정시 계산식 2 out.xlsx');
const calcData = XLSX.utils.sheet_to_json(calcWb.Sheets['Sheet1']);

// 문제 대학들 검색
const targetSchools = ['서강인문', '서강자연', '항공통합', '동덕인문', '동덕자연', '수원자연1', '수원인문1', '성결통합'];

console.log('=== 문제 대학 상세 분석 ===\n');

targetSchools.forEach(school => {
  const row = calcData.find(r => r['환산인자'] === school);
  if (row) {
    console.log(`[${school}]`);
    console.log(`  필수: ${row['필수'] || 'N/A'}`);
    console.log(`  선택: ${row['선택'] || 'N/A'}`);
    console.log(`  가중택: ${row['가중택'] || 'N/A'}`);
    console.log(`  수능환산(필수): ${(row['수능환산(필수)'] || '').toString().substring(0, 80)}`);
    console.log(`  수능환산(선택): ${(row['수능환산(선택)'] || '').toString().substring(0, 80)}`);
    console.log(`  수능환산(가중택): ${(row['수능환산(가중택)'] || '').toString().substring(0, 100)}`);
    console.log(`  추가가감: ${row['추가가감'] || 'N/A'}`);
    console.log(`  기본점수: ${row['기본점수'] || 0}`);
    console.log('');
  } else {
    console.log(`[${school}] - 데이터 없음\n`);
  }
});
