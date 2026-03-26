const XLSX = require('xlsx');

const wb1 = XLSX.readFile('UWAY_수시_경쟁률_상세_2026-01-05.xlsx');
const crawled = XLSX.utils.sheet_to_json(wb1.Sheets['경쟁률_상세']);

const wb2 = XLSX.readFile('uploads/2026 수시 통통.xlsx');
const tongTong = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);

const crawledUniCount = {};
crawled.forEach(row => {
  const uni = row['대학명'];
  crawledUniCount[uni] = (crawledUniCount[uni] || 0) + 1;
});

const tongTongUniCount = {};
tongTong.forEach(row => {
  const uni = row['대학교'];
  tongTongUniCount[uni] = (tongTongUniCount[uni] || 0) + 1;
});

console.log('=== 대학 수 비교 ===');
console.log('크롤링 대학 수: ' + Object.keys(crawledUniCount).length);
console.log('수시 통통 대학 수: ' + Object.keys(tongTongUniCount).length);

// 수시 통통에만 있는 대학
const tongTongOnly = Object.keys(tongTongUniCount).filter(uni => !(uni in crawledUniCount));
console.log('\n=== 수시 통통에만 있는 대학 (' + tongTongOnly.length + '개) ===');
let tongTongOnlyTotal = 0;
tongTongOnly.sort().forEach(uni => {
  console.log('  ' + uni + ': ' + tongTongUniCount[uni] + '개');
  tongTongOnlyTotal += tongTongUniCount[uni];
});
console.log('  >> 소계: ' + tongTongOnlyTotal + '개 데이터');

// 크롤링에만 있는 대학
const crawledOnly = Object.keys(crawledUniCount).filter(uni => !(uni in tongTongUniCount));
console.log('\n=== 크롤링에만 있는 대학 (' + crawledOnly.length + '개) ===');
crawledOnly.forEach(uni => {
  console.log('  ' + uni + ': ' + crawledUniCount[uni] + '개');
});

// 양쪽에 있지만 이름이 다른 대학 찾기 (유사도 체크)
console.log('\n=== 대학명 유사성 분석 (이름 매칭 시도) ===');
const tongTongUnis = Object.keys(tongTongUniCount);
const crawledUnis = Object.keys(crawledUniCount);

crawledOnly.forEach(cUni => {
  tongTongOnly.forEach(tUni => {
    // 부분 문자열 매칭
    if (cUni.includes(tUni.replace(/대학교?$/, '')) || tUni.includes(cUni.replace(/대학교?$/, ''))) {
      console.log('  가능한 매칭: "' + cUni + '" (크롤링) <-> "' + tUni + '" (수시통통)');
    }
  });
});

// 양쪽 모두 있는 대학 비교
console.log('\n=== 양쪽 모두 있는 대학의 데이터 수 차이 (상위 20개) ===');
const bothExist = crawledUnis.filter(uni => uni in tongTongUniCount);
const diffs = bothExist.map(uni => ({
  대학명: uni,
  크롤링: crawledUniCount[uni],
  수시통통: tongTongUniCount[uni],
  차이: tongTongUniCount[uni] - crawledUniCount[uni]
})).filter(d => d.차이 !== 0).sort((a, b) => b.차이 - a.차이);

console.log('양쪽 모두 있는 대학: ' + bothExist.length + '개');
console.log('데이터 수 차이 있는 대학: ' + diffs.length + '개');
console.table(diffs.slice(0, 20));

// 총 차이 계산
const totalDiffInBoth = diffs.reduce((sum, d) => sum + d.차이, 0);
console.log('\n=== 차이 요약 ===');
console.log('수시 통통에만 있는 대학 데이터: ' + tongTongOnlyTotal + '개');
console.log('양쪽 모두 있는 대학에서 차이: ' + totalDiffInBoth + '개');
console.log('전체 차이: ' + (tongTongOnlyTotal + totalDiffInBoth) + '개');
