const XLSX = require('xlsx');
const wb = XLSX.readFile('uploads/26 정시 계산식 2 out.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1']);

// Find all universities with 가중택
const withGajungtaek = data.filter(r => r['가중택'] && r['가중택'] !== 'N/A' && r['가중택'] !== '0' && r['가중택'] !== 0);

console.log('=== 가중택 패턴별 분류 (' + withGajungtaek.length + '개) ===');

const patterns = {};
withGajungtaek.forEach(r => {
  const pattern = r['가중택'];
  const formula = (r['수능환산(가중택)'] || '').toString().substring(0, 80);
  const key = pattern;
  if (!patterns[key]) {
    patterns[key] = { formula, schools: [] };
  }
  patterns[key].schools.push(r['환산인자']);
});

Object.entries(patterns).sort((a, b) => b[1].schools.length - a[1].schools.length).forEach(([pattern, info]) => {
  console.log('');
  console.log('[' + pattern + '] (' + info.schools.length + '개)');
  console.log('공식: ' + info.formula);
  console.log('대학: ' + info.schools.slice(0, 10).join(', ') + (info.schools.length > 10 ? ' ...' : ''));
});
