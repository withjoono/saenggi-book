const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 엑셀 파일 읽기 (새 파일)
const workbook = XLSX.readFile(path.join(__dirname, '../Uploads/2026 표점 백분 등급 변환표 out.xlsx'));

// 결과 객체 생성
const result = {};

// Sheet3: 모든 과목 데이터
const sheet3 = workbook.Sheets['Sheet3'];
const sheet3Data = XLSX.utils.sheet_to_json(sheet3, { header: 1 });

// 데이터 처리 (헤더 제외)
sheet3Data.slice(1).forEach(row => {
  const [영역, 표준점수, 백분위, 등급] = row;

  if (!영역 || !표준점수 || 백분위 === undefined || !등급) return;

  // 과목 객체 초기화
  if (!result[영역]) {
    result[영역] = {};
  }

  // 표준점수를 키로 사용 (정수로 변환)
  const scoreKey = String(Math.round(표준점수));

  // 이미 해당 점수가 있으면 스킵 (첫 번째 데이터만 사용)
  if (result[영역][scoreKey]) return;

  result[영역][scoreKey] = {
    "백분위": String(Math.round(백분위)),
    "등급": String(Math.round(등급)),
    "누백": "0"
  };
});

// 결과 확인
console.log('\n=== 변환된 과목 목록 ===');
Object.keys(result).sort().forEach(subject => {
  const scores = Object.keys(result[subject]);
  console.log(subject + ': ' + scores.length + '개 점수 (' + Math.min(...scores.map(Number)) + ' ~ ' + Math.max(...scores.map(Number)) + ')');
});

console.log('\n총 과목 수:', Object.keys(result).length);

// JSON 파일로 저장
const outputPath = path.join(__dirname, '../src/components/services/mock-exam/표점백분변환표.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
console.log('\n✅ 저장 완료:', outputPath);
