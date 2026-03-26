/**
 * 정시 환산점수 정확한 계산 - 대학별 환산식 적용
 * 국어 120, 수학(미적) 120, 영어 2등급, 한국사 2등급, 물리학1 60, 생명과학1 60
 *
 * 실행: npx ts-node calculate-accurate-scores.ts
 */

import * as XLSX from 'xlsx';
import {
  calc정시환산점수2026,
  get지원대학목록2026,
} from './src/modules/jungsi/calculation/calculations/calc-2026';

// 입력 점수 (점수표의 과목명 형식에 맞춤)
const INPUT_SCORES = {
  국어: {
    과목명: '국어',
    표준점수: 120,
    등급: 2,
    백분위: 88,
  },
  수학: {
    과목명: '수학(미적)',  // 점수표 형식: 수학(미적), 수학(기하), 수학(확통)
    표준점수: 120,
    등급: 2,
    백분위: 88,
  },
  영어: {
    과목명: '영어',
    등급: 2,
    표준점수: 2,  // 영어는 등급을 표준점수로 사용
  },
  한국사: {
    과목명: '한국사',
    등급: 2,
    표준점수: 2,  // 한국사도 등급을 표준점수로 사용
  },
  탐구1: {
    과목명: '물리학 Ⅰ',
    표준점수: 60,
    등급: 3,
    백분위: 75,
  },
  탐구2: {
    과목명: '생명과학 Ⅰ',
    표준점수: 60,
    등급: 3,
    백분위: 75,
  },
};

interface CalcResult {
  학교코드: string;
  성공여부: boolean;
  환산점수: number | null;
  표준점수합: number | null;
  에러메시지: string;
}

async function main() {
  console.log('=== 정시 대학환산점수 정확한 계산 ===');
  console.log('입력 점수:');
  console.log(`- 국어 표점: ${INPUT_SCORES.국어.표준점수}`);
  console.log(`- 수학(${INPUT_SCORES.수학.과목명}) 표점: ${INPUT_SCORES.수학.표준점수}`);
  console.log(`- 영어: ${INPUT_SCORES.영어.등급}등급`);
  console.log(`- 한국사: ${INPUT_SCORES.한국사.등급}등급`);
  console.log(`- ${INPUT_SCORES.탐구1.과목명} 표점: ${INPUT_SCORES.탐구1.표준점수}`);
  console.log(`- ${INPUT_SCORES.탐구2.과목명} 표점: ${INPUT_SCORES.탐구2.표준점수}`);
  console.log('');

  // 모든 학교 코드 가져오기
  const schoolCodes = get지원대학목록2026();
  console.log(`총 ${schoolCodes.length}개 학교/모집단위 계산 시작...`);
  console.log('');

  const results: CalcResult[] = [];

  for (const schoolCode of schoolCodes) {
    try {
      // 계열 판단 (자연계열 탐구과목 사용)
      const 이문과 = '자연';

      const result = await calc정시환산점수2026({
        학교: schoolCode,
        이문과,
        국어: {
          과목: INPUT_SCORES.국어.과목명,
          표준점수: INPUT_SCORES.국어.표준점수,
          등급: INPUT_SCORES.국어.등급,
          백분위: INPUT_SCORES.국어.백분위,
        },
        수학: {
          과목: INPUT_SCORES.수학.과목명,
          표준점수: INPUT_SCORES.수학.표준점수,
          등급: INPUT_SCORES.수학.등급,
          백분위: INPUT_SCORES.수학.백분위,
        },
        영어: {
          과목: INPUT_SCORES.영어.과목명,
          표준점수: INPUT_SCORES.영어.표준점수,
          등급: INPUT_SCORES.영어.등급,
        },
        한국사: {
          과목: INPUT_SCORES.한국사.과목명,
          표준점수: INPUT_SCORES.한국사.표준점수,
          등급: INPUT_SCORES.한국사.등급,
        },
        과탐1: {
          과목: INPUT_SCORES.탐구1.과목명,
          표준점수: INPUT_SCORES.탐구1.표준점수,
          등급: INPUT_SCORES.탐구1.등급,
          백분위: INPUT_SCORES.탐구1.백분위,
        },
        과탐2: {
          과목: INPUT_SCORES.탐구2.과목명,
          표준점수: INPUT_SCORES.탐구2.표준점수,
          등급: INPUT_SCORES.탐구2.등급,
          백분위: INPUT_SCORES.탐구2.백분위,
        },
      });

      if (result.success) {
        results.push({
          학교코드: schoolCode,
          성공여부: true,
          환산점수: result.내점수 ?? null,
          표준점수합: result.표점합 ?? null,
          에러메시지: '',
        });
      } else {
        results.push({
          학교코드: schoolCode,
          성공여부: false,
          환산점수: null,
          표준점수합: null,
          에러메시지: String(result.result || '계산 실패'),
        });
      }
    } catch (error) {
      results.push({
        학교코드: schoolCode,
        성공여부: false,
        환산점수: null,
        표준점수합: null,
        에러메시지: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  }

  // 결과 통계
  const successCount = results.filter(r => r.성공여부).length;
  const failedCount = results.filter(r => !r.성공여부).length;

  console.log(`계산 완료!`);
  console.log(`- 성공: ${successCount}개`);
  console.log(`- 실패: ${failedCount}개`);

  // 엑셀 데이터 변환
  const excelData = results.map((r, index) => ({
    '번호': index + 1,
    '학교/모집단위': r.학교코드,
    '성공여부': r.성공여부 ? 'O' : 'X',
    '환산점수': r.환산점수 !== null ? Math.round(r.환산점수 * 100) / 100 : '',
    '표준점수합': r.표준점수합 || '',
    '에러메시지': r.에러메시지,
  }));

  // 성공한 결과만 환산점수 내림차순 정렬
  const sortedExcelData = [...excelData].sort((a, b) => {
    if (a.성공여부 === 'X' && b.성공여부 === 'O') return 1;
    if (a.성공여부 === 'O' && b.성공여부 === 'X') return -1;
    const scoreA = typeof a.환산점수 === 'number' ? a.환산점수 : -Infinity;
    const scoreB = typeof b.환산점수 === 'number' ? b.환산점수 : -Infinity;
    return scoreB - scoreA;
  }).map((r, index) => ({ ...r, '번호': index + 1 }));

  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(sortedExcelData);
  worksheet['!cols'] = [
    { wch: 6 },   // 번호
    { wch: 25 },  // 학교/모집단위
    { wch: 8 },   // 성공여부
    { wch: 12 },  // 환산점수
    { wch: 12 },  // 표준점수합
    { wch: 25 },  // 에러메시지
  ];

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '환산점수결과');

  // 입력정보 시트 추가
  const metaData = [
    { '항목': '계산일시', '값': new Date().toISOString() },
    { '항목': '전체 학교/모집단위', '값': schoolCodes.length },
    { '항목': '성공', '값': successCount },
    { '항목': '실패', '값': failedCount },
    { '항목': '', '값': '' },
    { '항목': '=== 입력 점수 ===', '값': '' },
    { '항목': '국어 표점', '값': INPUT_SCORES.국어.표준점수 },
    { '항목': '수학 선택', '값': INPUT_SCORES.수학.과목명 },
    { '항목': '수학 표점', '값': INPUT_SCORES.수학.표준점수 },
    { '항목': '영어', '값': `${INPUT_SCORES.영어.등급}등급` },
    { '항목': '한국사', '값': `${INPUT_SCORES.한국사.등급}등급` },
    { '항목': INPUT_SCORES.탐구1.과목명, '값': INPUT_SCORES.탐구1.표준점수 },
    { '항목': INPUT_SCORES.탐구2.과목명, '값': INPUT_SCORES.탐구2.표준점수 },
  ];
  const metaSheet = XLSX.utils.json_to_sheet(metaData);
  metaSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, metaSheet, '입력정보');

  // 실패 목록 시트 추가
  const failedResults = results.filter(r => !r.성공여부);
  if (failedResults.length > 0) {
    const failedData = failedResults.map((r, index) => ({
      '번호': index + 1,
      '학교/모집단위': r.학교코드,
      '에러메시지': r.에러메시지,
    }));
    const failedSheet = XLSX.utils.json_to_sheet(failedData);
    failedSheet['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, failedSheet, '실패목록');
  }

  // 파일 저장
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `jungsi-accurate-scores-${dateStr}.xlsx`;
  XLSX.writeFile(workbook, filename);

  console.log(`\n엑셀 파일 저장 완료: ${filename}`);

  // 성공한 결과 상위 20개 출력
  console.log('\n=== 환산점수 상위 20개 ===');
  const sortedResults = results
    .filter(r => r.성공여부 && r.환산점수 !== null)
    .sort((a, b) => (b.환산점수 || 0) - (a.환산점수 || 0));

  sortedResults.slice(0, 20).forEach((r, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${r.학교코드.padEnd(15)}: ${r.환산점수?.toFixed(2)} (표점합: ${r.표준점수합})`);
  });

  // 실패한 결과 상위 10개 출력 (에러 종류별)
  if (failedCount > 0) {
    console.log('\n=== 실패 사유별 현황 ===');
    const errorCounts: Record<string, number> = {};
    results.filter(r => !r.성공여부).forEach(r => {
      const msg = r.에러메시지 || '알 수 없음';
      errorCounts[msg] = (errorCounts[msg] || 0) + 1;
    });
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([msg, count]) => {
        console.log(`- ${msg}: ${count}개`);
      });
  }
}

main().catch(console.error);
