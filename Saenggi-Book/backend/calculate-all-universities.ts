/**
 * 정시 환산점수 계산 - 모든 대학/모집단위
 * 국어 120, 수학(미적) 120, 영어 2등급, 한국사 2등급, 물리학1 60, 생명과학1 60
 *
 * 실행: npx ts-node calculate-all-universities.ts
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// 점수표 로드
const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표: Record<string, Record<string, Record<string, number>>> = JSON.parse(
  fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8')
);
const 유불리Data = JSON.parse(
  fs.readFileSync(path.join(dataDir, '2026정시유불리.json'), 'utf-8')
);

// 입력 점수
const INPUT_SCORES = {
  국어표점: 120,
  수학표점: 120,
  수학선택: '미적',  // 미적분 선택
  영어등급: 2,
  한국사등급: 2,
  탐구1과목: '물리학 Ⅰ',
  탐구1표점: 60,
  탐구2과목: '생명과학 Ⅰ',
  탐구2표점: 60,
};

// 환산점수 조회 함수
function getConvertedScore(
  subject: string,
  score: number,
  schoolCode: string
): number | null {
  const subjectData = 점수표[subject];
  if (!subjectData) return null;

  const scoreData = subjectData[String(score)];
  if (!scoreData) return null;

  return scoreData[schoolCode] ?? null;
}

// 표점합 계산 (국어 + 수학 + 탐구상위2)
function calculateStandardScoreSum(): number {
  return INPUT_SCORES.국어표점 + INPUT_SCORES.수학표점 +
         INPUT_SCORES.탐구1표점 + INPUT_SCORES.탐구2표점;
}

// 유불리 점수 조회
function getAdvantageScore(schoolCode: string, 표점합: number): number | null {
  const rows = 유불리Data.Sheet1 || 유불리Data;
  if (!Array.isArray(rows)) return null;

  // 가장 가까운 표점합 찾기
  let closest = rows[0];
  let minDiff = Math.abs((closest['점수환산'] || closest['표점합']) - 표점합);

  for (const row of rows) {
    const rowScore = row['점수환산'] || row['표점합'];
    const diff = Math.abs(rowScore - 표점합);
    if (diff < minDiff) {
      minDiff = diff;
      closest = row;
    }
  }

  return closest[schoolCode] ?? null;
}

// 모든 학교 코드 추출
function getAllSchoolCodes(): string[] {
  const codes = new Set<string>();

  // 점수표의 첫 번째 과목에서 학교 코드 추출
  const 국어Data = 점수표['국어'];
  if (국어Data) {
    const firstScore = Object.values(국어Data)[0];
    if (firstScore) {
      Object.keys(firstScore).forEach(key => {
        // 메타데이터 필드 제외
        if (!['백분위', '등급', '누적(%)', '누적', '원점수'].includes(key)) {
          codes.add(key);
        }
      });
    }
  }

  return Array.from(codes).sort();
}

// 단일 학교 계산
function calculateForSchool(schoolCode: string): {
  학교코드: string;
  성공여부: boolean;
  환산점수: number | null;
  표준점수합: number;
  유불리평균점수: number | null;
  유불리차이: number | null;
  에러메시지: string;
} {
  const 표점합 = calculateStandardScoreSum();

  try {
    // 각 과목 환산점수 조회 (점수표의 과목명 형식에 맞춤)
    const 국어환산 = getConvertedScore('국어', INPUT_SCORES.국어표점, schoolCode);
    const 수학환산 = getConvertedScore('수학(미적)', INPUT_SCORES.수학표점, schoolCode);
    const 영어환산 = getConvertedScore('영어', INPUT_SCORES.영어등급, schoolCode);
    const 한국사환산 = getConvertedScore('한국사', INPUT_SCORES.한국사등급, schoolCode);
    const 탐구1환산 = getConvertedScore(INPUT_SCORES.탐구1과목, INPUT_SCORES.탐구1표점, schoolCode);
    const 탐구2환산 = getConvertedScore(INPUT_SCORES.탐구2과목, INPUT_SCORES.탐구2표점, schoolCode);

    // 누락된 환산점수 확인
    if (국어환산 === null) {
      return {
        학교코드: schoolCode,
        성공여부: false,
        환산점수: null,
        표준점수합: 표점합,
        유불리평균점수: null,
        유불리차이: null,
        에러메시지: '국어 환산점수 없음',
      };
    }
    if (수학환산 === null) {
      return {
        학교코드: schoolCode,
        성공여부: false,
        환산점수: null,
        표준점수합: 표점합,
        유불리평균점수: null,
        유불리차이: null,
        에러메시지: '수학 환산점수 없음',
      };
    }
    if (영어환산 === null) {
      return {
        학교코드: schoolCode,
        성공여부: false,
        환산점수: null,
        표준점수합: 표점합,
        유불리평균점수: null,
        유불리차이: null,
        에러메시지: '영어 환산점수 없음',
      };
    }

    // 환산점수 합계 계산 (기본: 국+수+영+탐1+탐2)
    // 실제 학교별 계산식은 더 복잡하지만, 여기서는 단순 합으로 계산
    const 환산점수 = 국어환산 + 수학환산 + 영어환산 +
                   (한국사환산 || 0) +
                   (탐구1환산 || 0) + (탐구2환산 || 0);

    // 유불리 조회
    const 유불리평균 = getAdvantageScore(schoolCode, 표점합);
    const 유불리차이 = 유불리평균 !== null ? 유불리평균 - 환산점수 : null;

    return {
      학교코드: schoolCode,
      성공여부: true,
      환산점수: Math.round(환산점수 * 100) / 100,
      표준점수합: 표점합,
      유불리평균점수: 유불리평균 !== null ? Math.round(유불리평균 * 100) / 100 : null,
      유불리차이: 유불리차이 !== null ? Math.round(유불리차이 * 100) / 100 : null,
      에러메시지: '',
    };
  } catch (error) {
    return {
      학교코드: schoolCode,
      성공여부: false,
      환산점수: null,
      표준점수합: 표점합,
      유불리평균점수: null,
      유불리차이: null,
      에러메시지: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

// 메인 실행
async function main() {
  console.log('=== 정시 대학환산점수 계산 ===');
  console.log('입력 점수:');
  console.log(`- 국어 표점: ${INPUT_SCORES.국어표점}`);
  console.log(`- 수학(${INPUT_SCORES.수학선택}) 표점: ${INPUT_SCORES.수학표점}`);
  console.log(`- 영어: ${INPUT_SCORES.영어등급}등급`);
  console.log(`- 한국사: ${INPUT_SCORES.한국사등급}등급`);
  console.log(`- ${INPUT_SCORES.탐구1과목} 표점: ${INPUT_SCORES.탐구1표점}`);
  console.log(`- ${INPUT_SCORES.탐구2과목} 표점: ${INPUT_SCORES.탐구2표점}`);
  console.log('');

  // 모든 학교 코드 가져오기
  const schoolCodes = getAllSchoolCodes();
  console.log(`총 ${schoolCodes.length}개 학교/모집단위 계산 시작...`);

  // 계산 실행
  const results = schoolCodes.map(code => calculateForSchool(code));

  // 결과 통계
  const successCount = results.filter(r => r.성공여부).length;
  const failedCount = results.filter(r => !r.성공여부).length;

  console.log(`\n계산 완료!`);
  console.log(`- 성공: ${successCount}개`);
  console.log(`- 실패: ${failedCount}개`);

  // 엑셀 데이터 변환
  const excelData = results.map((r, index) => ({
    '번호': index + 1,
    '학교/모집단위': r.학교코드,
    '성공여부': r.성공여부 ? 'O' : 'X',
    '환산점수': r.환산점수 || '',
    '표준점수합': r.표준점수합,
    '유불리평균': r.유불리평균점수 || '',
    '유불리차이': r.유불리차이 || '',
    '에러메시지': r.에러메시지,
  }));

  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 6 },   // 번호
    { wch: 25 },  // 학교/모집단위
    { wch: 8 },   // 성공여부
    { wch: 12 },  // 환산점수
    { wch: 12 },  // 표준점수합
    { wch: 12 },  // 유불리평균
    { wch: 12 },  // 유불리차이
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
    { '항목': '국어 표점', '값': INPUT_SCORES.국어표점 },
    { '항목': '수학 선택', '값': INPUT_SCORES.수학선택 },
    { '항목': '수학 표점', '값': INPUT_SCORES.수학표점 },
    { '항목': '영어', '값': `${INPUT_SCORES.영어등급}등급` },
    { '항목': '한국사', '값': `${INPUT_SCORES.한국사등급}등급` },
    { '항목': INPUT_SCORES.탐구1과목, '값': INPUT_SCORES.탐구1표점 },
    { '항목': INPUT_SCORES.탐구2과목, '값': INPUT_SCORES.탐구2표점 },
  ];
  const metaSheet = XLSX.utils.json_to_sheet(metaData);
  metaSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, metaSheet, '입력정보');

  // 파일 저장
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `jungsi-all-universities-${dateStr}.xlsx`;
  XLSX.writeFile(workbook, filename);

  console.log(`\n엑셀 파일 저장 완료: ${filename}`);

  // 성공한 결과 상위 10개 출력
  console.log('\n=== 환산점수 상위 10개 ===');
  const sortedResults = results
    .filter(r => r.성공여부 && r.환산점수 !== null)
    .sort((a, b) => (b.환산점수 || 0) - (a.환산점수 || 0));

  sortedResults.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.학교코드}: ${r.환산점수} (유불리: ${r.유불리차이 ?? 'N/A'})`);
  });
}

main().catch(console.error);
