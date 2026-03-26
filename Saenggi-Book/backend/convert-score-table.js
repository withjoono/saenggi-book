/**
 * 2026 표점 백분 등급 변환표 Excel -> JSON 변환
 */

const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('uploads/2026 표점 백분 등급 변환표.xlsx');

// Sheet3 사용 (간단 변환표: 영역, 표준점수, 백분위, 등급)
const ws = wb.Sheets['Sheet3'];
const data = XLSX.utils.sheet_to_json(ws);

console.log('데이터 로드 완료:', data.length, '행');

// 영역별로 그룹화
const conversionTable = {};

data.forEach(row => {
  const area = row['영역'];
  const standardScore = row['표준점수'];
  const percentile = row['백분위'];
  const grade = row['등급'];

  if (!conversionTable[area]) {
    conversionTable[area] = {};
  }

  conversionTable[area][standardScore] = {
    percentile: percentile,
    grade: grade
  };
});

// 영역 목록 출력
console.log('영역 목록:', Object.keys(conversionTable));

// 각 영역별 표준점수 범위 출력
Object.keys(conversionTable).forEach(area => {
  const scores = Object.keys(conversionTable[area]).map(Number);
  console.log(`${area}: ${Math.min(...scores)} ~ ${Math.max(...scores)}`);
});

// JSON 파일로 저장
const outputPath = 'src/modules/jungsi/calculation/data/2026-표점-등급-백분위-변환표.json';
fs.writeFileSync(outputPath, JSON.stringify(conversionTable, null, 2), 'utf8');
console.log('\n✅ JSON 파일 저장 완료:', outputPath);

// Sheet1 사용 (상세 변환표: 선택과목별)
const wsDetail = wb.Sheets['Sheet1'];
const dataDetail = XLSX.utils.sheet_to_json(wsDetail);

console.log('\n상세 데이터 로드 완료:', dataDetail.length, '행');

// 과목별로 그룹화 (선택과목 포함)
const detailTable = {};

dataDetail.forEach(row => {
  const area = row['영역'];
  const subject = row['과목명'];
  const standardScore = row['표준점수'];
  const percentile = row['백분위'];
  const grade = row['등급'];

  const key = subject ? `${area}_${subject}` : area;

  if (!detailTable[key]) {
    detailTable[key] = {};
  }

  detailTable[key][standardScore] = {
    percentile: percentile,
    grade: grade
  };
});

// 상세 테이블도 저장
const detailOutputPath = 'src/modules/jungsi/calculation/data/2026-표점-등급-백분위-변환표-상세.json';
fs.writeFileSync(detailOutputPath, JSON.stringify(detailTable, null, 2), 'utf8');
console.log('✅ 상세 JSON 파일 저장 완료:', detailOutputPath);
