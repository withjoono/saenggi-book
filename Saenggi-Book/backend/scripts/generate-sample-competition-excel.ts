#!/usr/bin/env ts-node
/**
 * 경쟁률 데이터 샘플 Excel 파일 생성 스크립트
 *
 * 사용법:
 * ts-node scripts/generate-sample-competition-excel.ts [출력파일명]
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

// 샘플 데이터
const sampleData = [
  {
    'unified_id': 'U0094121',
    '대학명': '서울대학교',
    '모집단위명': '컴퓨터공학과',
    '전형명': '일반전형',
    '2024학년도경쟁률': '5.5:1',
    '2023학년도경쟁률': '4.8:1',
    '2022학년도경쟁률': '6.2:1',
    '2021학년도경쟁률': '5.1:1',
    '2020학년도경쟁률': '4.9:1',
  },
  {
    'unified_id': 'U0094122',
    '대학명': '연세대학교',
    '모집단위명': '경영학과',
    '전형명': '학생부종합',
    '2024학년도경쟁률': '3.2',
    '2023학년도경쟁률': '3.5',
    '2022학년도경쟁률': '3.1',
    '2021학년도경쟁률': '3.3',
    '2020학년도경쟁률': '3.0',
  },
  {
    'unified_id': 'U0094123',
    '대학명': '고려대학교',
    '모집단위명': '전기전자공학부',
    '전형명': '일반전형',
    '2024학년도경쟁률': '7.8:1',
    '2023학년도경쟁률': '8.1:1',
    '2022학년도경쟁률': '7.5:1',
    '2021학년도경쟁률': '7.9:1',
    '2020학년도경쟁률': '8.3:1',
  },
  {
    '대학명': '서울시립대학교',
    '모집단위명': '도시공학과',
    '전형명': '학생부교과',
    '2024학년도경쟁률': '4.2:1',
    '2023학년도경쟁률': '4.5:1',
    '2022학년도경쟁률': '4.0:1',
    '2021학년도경쟁률': '-',
    '2020학년도경쟁률': '-',
  },
  {
    'unified_id': 'U0094125',
    '대학명': '한양대학교',
    '모집단위명': '건축학부',
    '전형명': '일반전형',
    '2024학년도경쟁률': '6.5',
    '2023학년도경쟁률': '6.8',
    '2022학년도경쟁률': '-',
    '2021학년도경쟁률': '-',
    '2020학년도경쟁률': '-',
  },
];

function generateSampleExcel(outputFileName?: string) {
  // 워크북 생성
  const workbook = XLSX.utils.book_new();

  // 데이터를 워크시트로 변환
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // 컬럼 너비 설정
  const columnWidths = [
    { wch: 12 }, // unified_id
    { wch: 15 }, // 대학명
    { wch: 20 }, // 모집단위명
    { wch: 15 }, // 전형명
    { wch: 15 }, // 2024학년도경쟁률
    { wch: 15 }, // 2023학년도경쟁률
    { wch: 15 }, // 2022학년도경쟁률
    { wch: 15 }, // 2021학년도경쟁률
    { wch: 15 }, // 2020학년도경쟁률
  ];
  worksheet['!cols'] = columnWidths;

  // 워크시트를 워크북에 추가
  XLSX.utils.book_append_sheet(workbook, worksheet, '경쟁률');

  // 파일명 설정
  const fileName = outputFileName || `competition-rate-sample_${new Date().toISOString().split('T')[0]}.xlsx`;
  const filePath = path.resolve(process.cwd(), fileName);

  // Excel 파일 생성
  XLSX.writeFile(workbook, filePath);

  console.log(`✅ 샘플 Excel 파일 생성 완료!`);
  console.log(`📁 파일 위치: ${filePath}`);
  console.log(`\n📊 샘플 데이터 ${sampleData.length}개 포함:`);
  sampleData.forEach((row, index) => {
    console.log(`   ${index + 1}. ${row.대학명} - ${row.모집단위명}`);
  });
  console.log(`\n💡 이 파일을 템플릿으로 사용하여 실제 데이터를 입력하세요.`);
  console.log(`\n🚀 Import 실행:`);
  console.log(`   ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts "${fileName}"`);
}

// 메인 함수
function main() {
  const args = process.argv.slice(2);
  const outputFileName = args[0];

  try {
    generateSampleExcel(outputFileName);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
