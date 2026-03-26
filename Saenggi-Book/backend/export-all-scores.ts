// export-all-scores.ts
// 모든 대학/학과의 환산점수를 Excel로 저장

import * as XLSX from 'xlsx';
import { calc정시환산점수2026 } from './src/modules/jungsi/calculation/calculations/calc-2026';

// 테스트 입력 데이터
const testInput = {
  국어: { 과목: '국어', 표준점수: 145, 등급: 1, 백분위: 99 },
  수학: { 과목: '수학(미적)', 표준점수: 130, 등급: 2, 백분위: 95 },
  영어: { 과목: '영어', 표준점수: 0, 등급: 1, 백분위: 99 },
  한국사: { 과목: '한국사', 표준점수: 0, 등급: 2, 백분위: 0 },
  과탐1: { 과목: '생명과학 Ⅰ', 표준점수: 69, 등급: 2, 백분위: 92 },
  과탐2: { 과목: '화학 Ⅰ', 표준점수: 68, 등급: 2, 백분위: 91 },
};

async function exportAllScores() {
  // 원본 Excel 파일 읽기
  const workbook = XLSX.readFile('uploads/환산점수 오류 체크 1215.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  console.log('계산 시작...');

  const results: any[][] = [
    ['점수환산', 'Excel예상값', '계산값', '차이', '일치여부', '대학교', '전공', '에러']
  ];

  let processed = 0;
  const total = data.length - 1;

  // 헤더 제외하고 데이터 처리
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 4) continue;

    const [점수환산, 예상값, 대학교, 전공] = row;
    if (!점수환산) continue;

    const params = {
      학교: 점수환산 as string,
      이문과: (점수환산 as string).includes('인문') ? '인문' : '자연',
      ...testInput,
      사탐1: undefined,
      사탐2: undefined,
      제2외국어: undefined,
    };

    let 계산값: number | string = '';
    let 차이: number | string = '';
    let 일치여부 = '';
    let 에러 = '';

    try {
      const result = await calc정시환산점수2026(params);
      if (result.success && result.내점수 !== undefined) {
        계산값 = result.내점수;
        if (typeof 예상값 === 'number') {
          차이 = Math.abs(계산값 - 예상값);
          일치여부 = 차이 < 0.01 ? 'O' : 'X';
        }
      } else {
        에러 = result.result || '계산 실패';
      }
    } catch (error: any) {
      에러 = error.message || String(error);
    }

    results.push([
      점수환산,
      예상값,
      계산값,
      차이,
      일치여부,
      대학교,
      전공,
      에러
    ]);

    processed++;
    if (processed % 500 === 0) {
      console.log(`진행: ${processed}/${total} (${(processed/total*100).toFixed(1)}%)`);
    }
  }

  console.log(`완료: ${processed}개 처리됨`);

  // 새 워크북 생성
  const newWorkbook = XLSX.utils.book_new();
  const newSheet = XLSX.utils.aoa_to_sheet(results);

  // 컬럼 너비 설정
  newSheet['!cols'] = [
    { wch: 15 },  // 점수환산
    { wch: 15 },  // Excel예상값
    { wch: 15 },  // 계산값
    { wch: 10 },  // 차이
    { wch: 8 },   // 일치여부
    { wch: 25 },  // 대학교
    { wch: 30 },  // 전공
    { wch: 30 },  // 에러
  ];

  XLSX.utils.book_append_sheet(newWorkbook, newSheet, '환산점수 검증');

  // 파일 저장
  const outputPath = 'uploads/환산점수_계산결과_수정후.xlsx';
  XLSX.writeFile(newWorkbook, outputPath);

  console.log(`\n저장 완료: ${outputPath}`);

  // 요약 출력
  const 일치수 = results.filter(r => r[4] === 'O').length;
  const 불일치수 = results.filter(r => r[4] === 'X').length;
  console.log(`\n일치: ${일치수}개, 불일치: ${불일치수}개`);
}

exportAllScores().catch(console.error);
