const XLSX = require('xlsx');
const wb = XLSX.readFile('UWAY_수시_경쟁률_상세_2026-01-05.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('원본 데이터: ' + data.length + '개');

// 잘못된 데이터 필터링
const valid = data.filter(row => {
  const mojip = String(row['모집인원'] || '').replace(/,/g, '');
  const ratio = String(row['경쟁률'] || '');

  // 모집인원이 숫자인지 체크
  const isMojipNumber = /^\d+$/.test(mojip);

  // 경쟁률에 ':'가 있는지 체크
  const hasColon = ratio.includes(':');

  return isMojipNumber && hasColon;
});

console.log('정상 데이터: ' + valid.length + '개');
console.log('제거된 데이터: ' + (data.length - valid.length) + '개');

// 제거된 데이터 샘플
const removed = data.filter(row => {
  const mojip = String(row['모집인원'] || '').replace(/,/g, '');
  const ratio = String(row['경쟁률'] || '');
  const isMojipNumber = /^\d+$/.test(mojip);
  const hasColon = ratio.includes(':');
  return !(isMojipNumber && hasColon);
});

console.log('\n=== 제거된 데이터 샘플 (처음 10개) ===');
removed.slice(0, 10).forEach((r, i) => {
  console.log((i+1) + '. ' + r['대학명'] + ' / ' + r['모집단위'] + ' / ' + r['모집인원'] + ' / ' + r['경쟁률']);
});

// 대학별 제거 통계
const removedByUni = {};
removed.forEach(r => {
  const uni = r['대학명'];
  removedByUni[uni] = (removedByUni[uni] || 0) + 1;
});

console.log('\n=== 대학별 제거 통계 ===');
Object.entries(removedByUni).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([uni, cnt]) => {
  console.log('  ' + uni + ': ' + cnt + '개');
});
