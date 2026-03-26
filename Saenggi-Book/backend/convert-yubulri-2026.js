/**
 * 2026 정시 유불리 엑셀 -> JSON 변환 스크립트
 * 사용법: node convert-yubulri-2026.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'uploads', '26 유불리 out.xlsx');
const OUTPUT_FILE = path.join(__dirname, 'src/modules/jungsi/calculation/data', '2026정시유불리.json');

function convertExcelToJson() {
  console.log('=== 2026 정시 유불리 데이터 변환 시작 ===');
  console.log(`입력 파일: ${INPUT_FILE}`);
  console.log(`출력 파일: ${OUTPUT_FILE}`);

  // 엑셀 파일 읽기
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`오류: 입력 파일이 존재하지 않습니다: ${INPUT_FILE}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(INPUT_FILE);
  const result = {};

  // 모든 시트 처리
  workbook.SheetNames.forEach((sheetName) => {
    console.log(`\n시트 처리 중: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];

    // 시트를 JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    if (jsonData.length === 0) {
      console.log(`  - 빈 시트, 건너뜀`);
      return;
    }

    // 첫 번째 컬럼이 '점수환산'인지 확인
    const firstRow = jsonData[0];
    const keys = Object.keys(firstRow);
    console.log(`  - 컬럼 수: ${keys.length}`);
    console.log(`  - 행 수: ${jsonData.length}`);
    console.log(`  - 첫 번째 컬럼: ${keys[0]}`);

    // 점수환산 컬럼이 있는지 확인하고 데이터 정리
    const processedData = jsonData.map((row, index) => {
      const processedRow = {};

      for (const [key, value] of Object.entries(row)) {
        // 컬럼명 정리 (공백 제거)
        const cleanKey = key.trim();

        // 숫자 값 처리
        if (value === null || value === undefined || value === '') {
          processedRow[cleanKey] = null;
        } else if (typeof value === 'number') {
          processedRow[cleanKey] = value;
        } else if (typeof value === 'string') {
          const numValue = parseFloat(value);
          processedRow[cleanKey] = isNaN(numValue) ? value : numValue;
        } else {
          processedRow[cleanKey] = value;
        }
      }

      return processedRow;
    });

    // 점수환산 기준 내림차순 정렬 (높은 점수가 먼저)
    processedData.sort((a, b) => {
      const scoreA = a['점수환산'] || a['점수'] || 0;
      const scoreB = b['점수환산'] || b['점수'] || 0;
      return scoreB - scoreA;
    });

    result[sheetName] = processedData;

    // 샘플 데이터 출력
    if (processedData.length > 0) {
      const sampleKeys = Object.keys(processedData[0]).slice(0, 5);
      console.log(`  - 샘플 컬럼: ${sampleKeys.join(', ')}`);
      console.log(`  - 첫 번째 행 점수환산: ${processedData[0]['점수환산'] || processedData[0]['점수']}`);
      console.log(`  - 마지막 행 점수환산: ${processedData[processedData.length - 1]['점수환산'] || processedData[processedData.length - 1]['점수']}`);
    }
  });

  // JSON 파일 저장
  const jsonContent = JSON.stringify(result, null, 2);
  fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf-8');

  console.log(`\n=== 변환 완료 ===`);
  console.log(`출력 파일: ${OUTPUT_FILE}`);
  console.log(`파일 크기: ${(jsonContent.length / 1024).toFixed(2)} KB`);

  // 결과 요약
  console.log('\n=== 결과 요약 ===');
  for (const [sheetName, data] of Object.entries(result)) {
    console.log(`${sheetName}: ${data.length}개 행, ${Object.keys(data[0] || {}).length}개 컬럼`);
  }
}

convertExcelToJson();
