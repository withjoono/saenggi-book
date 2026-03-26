/**
 * 입결 데이터를 메인 Excel 파일에 병합하는 스크립트
 * - 2025정시-실제컷-정리.xlsx → CH~CO 컬럼
 * - 2024정시-실제컷-정리.xlsx → CP~CW 컬럼
 */

const XLSX = require('xlsx');

// 대학명 정규화 함수
function normalizeUnivName(name) {
  if (!name) return '';
  return name
    .replace(/국립/g, '')
    .replace(/대학교/g, '대')
    .replace(/대학/g, '대')
    .replace(/\s+/g, '')
    .toLowerCase();
}

// 모집단위명 정규화 함수
function normalizeRecruitName(name) {
  if (!name) return '';
  return name
    .replace(/[·\-\s()（）\[\]]/g, '')
    .replace(/학과$/, '')
    .replace(/학부$/, '')
    .replace(/전공$/, '')
    .toLowerCase();
}

async function main() {
  console.log('=== 입결 데이터 병합 시작 ===\n');

  // 1. 메인 Excel 파일 읽기
  console.log('1. 메인 Excel 파일 읽는 중...');
  const mainPath = 'uploads/2026 정시 디비 251205 칼럼변경.xlsx';
  const mainWb = XLSX.readFile(mainPath);
  const mainSheetName = mainWb.SheetNames[0];
  const mainSheet = mainWb.Sheets[mainSheetName];

  // 범위 확인
  const range = XLSX.utils.decode_range(mainSheet['!ref']);
  console.log(`   메인 Excel 범위: ${mainSheet['!ref']}`);
  console.log(`   행 수: ${range.e.r + 1}`);

  // 2. 2025 입결 파일 읽기
  console.log('\n2. 2025 입결 파일 읽는 중...');
  const wb2025 = XLSX.readFile('uploads/2025정시-실제컷-정리.xlsx');
  const data2025 = XLSX.utils.sheet_to_json(wb2025.Sheets[wb2025.SheetNames[0]]);
  console.log(`   2025 입결 행 수: ${data2025.length}`);

  // 2025 데이터 맵 생성
  const map2025ByCode = new Map();
  const map2025ByName = new Map();
  for (const row of data2025) {
    const code = row['대학코드'] || '';
    const recruit = normalizeRecruitName(row['모집단위']);
    const univName = normalizeUnivName(row['대학명']);

    if (code) {
      map2025ByCode.set(`${code}|${recruit}`, row);
    }
    map2025ByName.set(`${univName}|${recruit}`, row);
  }

  // 3. 2024 입결 파일 읽기
  console.log('\n3. 2024 입결 파일 읽는 중...');
  const wb2024 = XLSX.readFile('uploads/2024정시-실제컷-정리.xlsx');
  const data2024 = XLSX.utils.sheet_to_json(wb2024.Sheets[wb2024.SheetNames[0]]);
  console.log(`   2024 입결 행 수: ${data2024.length}`);

  // 2024 데이터 맵 생성
  const map2024ByCode = new Map();
  const map2024ByName = new Map();
  for (const row of data2024) {
    const code = row['대학코드'] || '';
    const recruit = normalizeRecruitName(row['모집단위']);
    const univName = normalizeUnivName(row['대학명']);

    if (code) {
      map2024ByCode.set(`${code}|${recruit}`, row);
    }
    map2024ByName.set(`${univName}|${recruit}`, row);
  }

  // 4. 메인 시트에 직접 셀 값 설정
  console.log('\n4. 데이터 병합 중...');
  let match2025 = 0, match2024 = 0;
  let noMatch2025 = 0, noMatch2024 = 0;

  // 셀 값 가져오기 헬퍼
  function getCellValue(sheet, col, row) {
    const cell = sheet[XLSX.utils.encode_cell({ c: col, r: row })];
    return cell ? cell.v : '';
  }

  // 셀 값 설정 헬퍼
  function setCellValue(sheet, col, row, value) {
    const cellRef = XLSX.utils.encode_cell({ c: col, r: row });
    if (value !== undefined && value !== null && value !== '') {
      sheet[cellRef] = { t: typeof value === 'number' ? 'n' : 's', v: value };
    }
  }

  // 컬럼 인덱스
  const colB = 1;   // 대학명
  const colG = 6;   // 모집단위
  const colCG = 84; // 대학코드

  // 2025 입결 컬럼 (CH=85 ~ CO=92)
  const col2025 = { CH: 85, CI: 86, CJ: 87, CK: 88, CL: 89, CM: 90, CN: 91, CO: 92 };
  // 2024 입결 컬럼 (CP=93 ~ CW=100)
  const col2024 = { CP: 93, CQ: 94, CR: 95, CS: 96, CT: 97, CU: 98, CV: 99, CW: 100 };

  // 데이터 행 처리 (row 2부터 = 0-indexed row 2)
  for (let r = 2; r <= range.e.r; r++) {
    const univCode = getCellValue(mainSheet, colCG, r) || '';
    const univName = normalizeUnivName(getCellValue(mainSheet, colB, r));
    const recruitName = normalizeRecruitName(getCellValue(mainSheet, colG, r));

    // 2025 입결 매칭
    let matched2025 = map2025ByCode.get(`${univCode}|${recruitName}`)
                   || map2025ByName.get(`${univName}|${recruitName}`);

    if (matched2025) {
      match2025++;
      setCellValue(mainSheet, col2025.CH, r, matched2025['모집인원(최종)']);
      setCellValue(mainSheet, col2025.CI, r, matched2025['경쟁률']);
      setCellValue(mainSheet, col2025.CJ, r, matched2025['충원합격순위']);
      setCellValue(mainSheet, col2025.CK, r, matched2025['환산점수 50%컷']);
      setCellValue(mainSheet, col2025.CL, r, matched2025['환산점수 70%컷']);
      setCellValue(mainSheet, col2025.CM, r, matched2025['총점(수능)']);
      setCellValue(mainSheet, col2025.CN, r, matched2025['백분위50%컷']);
      setCellValue(mainSheet, col2025.CO, r, matched2025['백분위70%컷']);
    } else {
      noMatch2025++;
    }

    // 2024 입결 매칭
    let matched2024 = map2024ByCode.get(`${univCode}|${recruitName}`)
                   || map2024ByName.get(`${univName}|${recruitName}`);

    if (matched2024) {
      match2024++;
      setCellValue(mainSheet, col2024.CP, r, matched2024['모집인원(최종)']);
      setCellValue(mainSheet, col2024.CQ, r, matched2024['경쟁률']);
      setCellValue(mainSheet, col2024.CR, r, matched2024['충원합격순위']);
      setCellValue(mainSheet, col2024.CS, r, matched2024['환산점수 50%컷']);
      setCellValue(mainSheet, col2024.CT, r, matched2024['환산점수 70%컷']);
      setCellValue(mainSheet, col2024.CU, r, matched2024['총점(수능)']);
      setCellValue(mainSheet, col2024.CV, r, matched2024['백분위50%컷']);
      setCellValue(mainSheet, col2024.CW, r, matched2024['백분위70%컷']);
    } else {
      noMatch2024++;
    }
  }

  console.log(`\n=== 매칭 결과 ===`);
  console.log(`2025 입결: 매칭 ${match2025}개, 미매칭 ${noMatch2025}개`);
  console.log(`2024 입결: 매칭 ${match2024}개, 미매칭 ${noMatch2024}개`);

  // 5. 새 Excel 파일 저장
  console.log('\n5. 병합된 Excel 파일 저장 중...');
  const outputPath = 'uploads/2026-정시-디비-입결병합.xlsx';
  XLSX.writeFile(mainWb, outputPath);
  console.log(`   저장 완료: ${outputPath}`);

  console.log('\n=== 병합 완료 ===');
  console.log(`다음 단계: POST /core/regular-admission/upload 로 ${outputPath} 파일 업로드`);
}

main().catch(console.error);
