const XLSX = require('xlsx');
const fs = require('fs');

// 유불리 데이터 로드 (첫 번째 row = 점수환산 432)
const 유불리Raw = JSON.parse(fs.readFileSync('src/modules/jungsi/calculation/data/2026정시유불리.json', 'utf-8'));
const 유불리 = 유불리Raw.Sheet1[0]; // 점수환산 432 (국120+수120+탐60+탐60+영2+한2 기준)

// 계산 결과 로드
const wb = XLSX.readFile('jungsi-accurate-scores-20251206.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// 비교
const errors = [];
data.forEach(row => {
  const 학교 = row['학교/모집단위'];
  const 계산값 = row['환산점수'];
  const 기대값 = 유불리[학교];

  if (기대값 !== undefined && 계산값 !== null) {
    const 차이 = Math.round((계산값 - 기대값) * 10) / 10;
    if (Math.abs(차이) > 5) { // 5점 이상 차이
      errors.push({ 학교, 계산값: Math.round(계산값*10)/10, 기대값: Math.round(기대값*10)/10, 차이 });
    }
  }
});

// 차이 절대값 기준 정렬
errors.sort((a, b) => Math.abs(b.차이) - Math.abs(a.차이));

console.log('=== 5점 이상 오차 대학 (' + errors.length + '개) ===');
console.log('학교             | 계산값   | 기대값   | 차이');
console.log('------------------------------------------------');
errors.forEach(e => {
  console.log(e.학교.padEnd(16) + ' | ' + String(e.계산값).padStart(8) + ' | ' + String(e.기대값).padStart(8) + ' | ' + (e.차이 > 0 ? '+' : '') + e.차이);
});

// 요약
console.log('\n=== 오차 유형별 분석 ===');
const positive = errors.filter(e => e.차이 > 0);
const negative = errors.filter(e => e.차이 < 0);
console.log('계산값 > 기대값 (+ 오차):', positive.length + '개');
console.log('계산값 < 기대값 (- 오차):', negative.length + '개');
