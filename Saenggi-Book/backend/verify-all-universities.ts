// verify-all-universities.ts
// Excel의 모든 대학/학과에 대해 환산점수 검증

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

async function verifyAllUniversities() {
  // Excel 파일 읽기
  const workbook = XLSX.readFile('uploads/환산점수 오류 체크 1215.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  console.log('=== 전체 대학 환산점수 검증 ===\n');
  console.log('테스트 조건:');
  console.log('  국어: 145점, 수학(미적): 130점, 영어: 1등급');
  console.log('  한국사: 2등급, 생명과학Ⅰ: 69점, 화학Ⅰ: 68점\n');

  const results: Array<{
    점수환산: string;
    대학교: string;
    전공: string;
    예상값: number;
    계산값: number | null;
    차이: number | null;
    일치: boolean;
    에러?: string;
  }> = [];

  // 헤더 제외하고 데이터 처리
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 4) continue;

    const [점수환산, 예상값, 대학교, 전공] = row;
    if (!점수환산 || typeof 예상값 !== 'number') continue;

    const params = {
      학교: 점수환산 as string,
      이문과: (점수환산 as string).includes('인문') ? '인문' : '자연',
      ...testInput,
      사탐1: undefined,
      사탐2: undefined,
      제2외국어: undefined,
    };

    try {
      const result = await calc정시환산점수2026(params);
      const 계산값 = result.success ? result.내점수 || 0 : null;
      const 차이 = 계산값 !== null ? Math.abs(계산값 - 예상값) : null;
      const 일치 = 차이 !== null && 차이 < 0.01;

      results.push({
        점수환산,
        대학교,
        전공,
        예상값,
        계산값,
        차이,
        일치,
        에러: result.success ? undefined : result.result,
      });
    } catch (error: any) {
      results.push({
        점수환산,
        대학교,
        전공,
        예상값,
        계산값: null,
        차이: null,
        일치: false,
        에러: error.message || String(error),
      });
    }
  }

  // 결과 집계
  const 일치수 = results.filter(r => r.일치).length;
  const 불일치수 = results.filter(r => !r.일치).length;
  const 에러수 = results.filter(r => r.에러).length;

  console.log(`총 ${results.length}개 항목 검증\n`);
  console.log(`✅ 일치: ${일치수}개 (${(일치수/results.length*100).toFixed(1)}%)`);
  console.log(`❌ 불일치: ${불일치수}개`);
  console.log(`⚠️ 에러: ${에러수}개\n`);

  // 불일치 항목 출력
  const 불일치목록 = results.filter(r => !r.일치);
  if (불일치목록.length > 0) {
    console.log('=== 불일치 목록 ===\n');

    // 점수환산 코드별로 그룹화
    const 그룹별불일치: Record<string, typeof 불일치목록> = {};
    불일치목록.forEach(r => {
      if (!그룹별불일치[r.점수환산]) {
        그룹별불일치[r.점수환산] = [];
      }
      그룹별불일치[r.점수환산].push(r);
    });

    // 점수환산 코드별로 첫 번째 항목만 출력 (같은 코드는 같은 점수)
    const 유니크불일치 = Object.entries(그룹별불일치).map(([코드, 항목들]) => 항목들[0]);

    console.log(`고유 점수환산 코드 ${유니크불일치.length}개 불일치:\n`);

    유니크불일치.forEach(r => {
      if (r.에러) {
        console.log(`❌ ${r.점수환산}: 에러 - ${r.에러}`);
      } else {
        console.log(`❌ ${r.점수환산}: 예상=${r.예상값}, 계산=${r.계산값?.toFixed(2)}, 차이=${r.차이?.toFixed(2)}`);
      }
    });
  }

  // 차이가 큰 항목들 (10점 이상)
  const 큰차이 = results.filter(r => r.차이 !== null && r.차이 >= 10);
  if (큰차이.length > 0) {
    console.log('\n=== 10점 이상 차이 항목 ===\n');
    const 유니크큰차이: Record<string, typeof 큰차이[0]> = {};
    큰차이.forEach(r => {
      if (!유니크큰차이[r.점수환산]) {
        유니크큰차이[r.점수환산] = r;
      }
    });
    Object.values(유니크큰차이).forEach(r => {
      console.log(`⚠️ ${r.점수환산}: 예상=${r.예상값}, 계산=${r.계산값?.toFixed(2)}, 차이=${r.차이?.toFixed(2)}`);
    });
  }

  // 에러 목록
  const 에러목록 = results.filter(r => r.에러);
  if (에러목록.length > 0) {
    console.log('\n=== 에러 목록 ===\n');
    const 유니크에러: Record<string, string> = {};
    에러목록.forEach(r => {
      if (!유니크에러[r.점수환산]) {
        유니크에러[r.점수환산] = r.에러!;
      }
    });
    Object.entries(유니크에러).forEach(([코드, 에러]) => {
      console.log(`⚠️ ${코드}: ${에러}`);
    });
  }
}

verifyAllUniversities().catch(console.error);
