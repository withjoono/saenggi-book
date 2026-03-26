const XLSX = require('xlsx');

// 문제 대학 목록 추출
const wb = XLSX.readFile('uploads/260106 크롤링오류.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

const universities = [...new Set(data.map(r => r.대학명))];
console.log('문제 대학 목록 (' + universities.length + '개):');
universities.forEach((u, i) => {
  console.log((i+1) + '. ' + u);
});

// 각 대학별 데이터 샘플 확인
console.log('\n\n각 대학별 데이터 패턴 분석:');
universities.forEach(uniName => {
  const uniData = data.filter(r => r.대학명 === uniName);
  console.log('\n========================================');
  console.log('대학명:', uniName);
  console.log('데이터 개수:', uniData.length + '개');
  console.log('샘플 데이터 (첫 3개):');
  uniData.slice(0, 3).forEach(row => {
    console.log(JSON.stringify(row, null, 2));
  });
});
