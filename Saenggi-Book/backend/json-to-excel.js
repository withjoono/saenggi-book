/**
 * 정시 환산점수 JSON을 Excel 파일로 변환
 */

const XLSX = require('xlsx');
const fs = require('fs');

// JSON 파일 읽기
const jsonFile = 'jungsi-calc-result-20251205.json';
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

console.log('JSON 파일 로드 완료');
console.log(`- 전체 항목: ${data.data.scores.length}개`);

// 엑셀용 데이터 변환
const excelData = data.data.scores.map((score, index) => ({
  '번호': index + 1,
  '대학ID': score.universityId,
  '대학명': score.universityName,
  '환산방식': score.scoreCalculation,
  '계열': score.major,
  '성공여부': score.success ? 'O' : 'X',
  '환산점수': score.convertedScore ? Math.round(score.convertedScore * 100) / 100 : '',
  '표준점수합': score.standardScoreSum,
  '최적점수': score.optimalScore ? Math.round(score.optimalScore * 100) / 100 : '',
  '점수차이': score.scoreDifference ? Math.round(score.scoreDifference * 100) / 100 : '',
  '에러메시지': score.errorMessage || ''
}));

// 워크시트 생성
const worksheet = XLSX.utils.json_to_sheet(excelData);

// 컬럼 너비 설정
worksheet['!cols'] = [
  { wch: 6 },   // 번호
  { wch: 8 },   // 대학ID
  { wch: 15 },  // 대학명
  { wch: 15 },  // 환산방식
  { wch: 10 },  // 계열
  { wch: 8 },   // 성공여부
  { wch: 12 },  // 환산점수
  { wch: 12 },  // 표준점수합
  { wch: 12 },  // 최적점수
  { wch: 12 },  // 점수차이
  { wch: 30 },  // 에러메시지
];

// 워크북 생성
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, '환산점수결과');

// 메타데이터 시트 추가
const metaData = [
  { '항목': '계산일시', '값': data.data.calculatedAt },
  { '항목': '전체 대학/학과', '값': data.data.totalUniversities },
  { '항목': '성공', '값': data.data.successCount },
  { '항목': '실패', '값': data.data.failedCount },
  { '항목': '', '값': '' },
  { '항목': '입력 점수', '값': '' },
  { '항목': '국어 표점', '값': 120 },
  { '항목': '수학(미적) 표점', '값': 120 },
  { '항목': '영어', '값': '2등급' },
  { '항목': '한국사', '값': '2등급' },
  { '항목': '물리학 Ⅰ 표점', '값': 60 },
  { '항목': '생명과학 Ⅰ 표점', '값': 60 },
];
const metaSheet = XLSX.utils.json_to_sheet(metaData);
metaSheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
XLSX.utils.book_append_sheet(workbook, metaSheet, '입력정보');

// 파일 저장
const excelFile = 'jungsi-calc-result-20251205.xlsx';
XLSX.writeFile(workbook, excelFile);

console.log(`\n✅ 엑셀 파일 생성 완료: ${excelFile}`);
