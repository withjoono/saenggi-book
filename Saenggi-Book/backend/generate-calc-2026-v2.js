const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('./uploads/26 정시 계산식 2 out.xlsx');
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 컬럼 인덱스
const cols = {
  대학명: 0, 환산인자: 1, 수능반영방식: 2, 환산식코드: 3,
  국: 4, 수: 5, 영: 6, 탐: 7, 한: 8, 외: 9,
  선택2과목수: 10, 선택3과목수: 11, 탐구과목수: 12,
  필수: 13, 선택: 14, 가중택: 15, 추가가감: 16, 기본점수: 17,
  필수설명: 18, 선택설명: 19, 가중택설명: 20,
  수학선택: 21, 탐구합선택: 22, 한국사대체: 23, 제2외국어대체: 24
};

// 조건 데이터 및 패턴 그룹화
const conditions = {};
const patternGroups = {};

// 각 행 처리
data.slice(1).forEach(row => {
  const 환산인자 = row[cols.환산인자];
  if (!환산인자) return;

  // 과목 필수/선택 패턴 키 생성
  const patternKey = `국${row[cols.국]||0}_수${row[cols.수]||0}_영${row[cols.영]||0}_탐${row[cols.탐]||0}_한${row[cols.한]||0}_외${row[cols.외]||0}`;

  // 조건 데이터
  conditions[환산인자] = {
    패턴키: patternKey,
    패턴: {
      국: row[cols.국] || 0,
      수: row[cols.수] || 0,
      영: row[cols.영] || 0,
      탐: row[cols.탐] || 0,
      한: row[cols.한] || 0,
      외: row[cols.외] || 0,
    },
    선택2과목수: row[cols.선택2과목수] || 0,
    선택3과목수: row[cols.선택3과목수] || 0,
    탐구과목수: row[cols.탐구과목수] || 0,
    기본점수: row[cols.기본점수] || 0,
    수학선택: row[cols.수학선택] || '가나',
    탐구합선택: row[cols.탐구합선택] || '사과',
    필수설명: row[cols.필수설명] || '',
    선택설명: row[cols.선택설명] || '',
    가중택설명: row[cols.가중택설명] || '',
  };

  // 패턴별 그룹화
  if (!patternGroups[patternKey]) {
    patternGroups[patternKey] = [];
  }
  patternGroups[patternKey].push(환산인자);
});

// 특수 케이스 목록 (기존 calc.ts에서 별도 함수로 처리된 대학들)
const specialCases = [
  '고려세경통', '고려세기계', '고려세문화', '고려세빅데사', '고려세신약',
  '경기자전', '경기인문', '경기자연', '경기과기',
  '이화간호', '이화인문', '이화자연',
];

// TypeScript 코드 생성
function generateTypeScript() {
  let code = `// 2026 정시 환산점수 계산기
// 자동 생성됨: ${new Date().toISOString()}
// 패턴 기반 계산 + 특수 케이스 별도 처리

import { lazy점수표 } from './lazy-load';
import {
  정시점수계산결과,
  정시점수계산Params,
  과목점수Type,
  점수표Type,
  환산점수계산Params,
} from './types';
import { 고려세과탐변환점수, 고려세사탐변환점수, 고려세영어변환점수 } from "./고려세변환점수";
import { 경기자전영어변환점수, 경기자전한국사변환점수 } from "./경기자전변환점수";
import { 이화간호영어변환점수, 이화간호한국사인문변환점수, 이화간호한국사자연변환점수 } from "./이화간호변환점수";

let 점수표: 점수표Type;

// 2026 학교 조건 타입
interface 학교조건2026Type {
  패턴키: string;
  패턴: { 국: number; 수: number; 영: number; 탐: number; 한: number; 외: number };
  선택2과목수: number;
  선택3과목수: number;
  탐구과목수: number;
  기본점수: number;
  수학선택: string;
  탐구합선택: string;
  필수설명: string;
  선택설명: string;
  가중택설명: string;
}

// 2026 학교 조건 데이터
const 학교조건2026: Record<string, 학교조건2026Type> = ${JSON.stringify(conditions, null, 2)};

const ensureDataLoaded = async () => {
  if (!점수표) 점수표 = await lazy점수표();
};

// 점수표에서 환산점수 조회
const 환산점수계산기 = (과목: 과목점수Type, 학교: string): number => {
  if (!과목?.과목 || !과목?.등급) {
    throw new Error(\`\${과목?.과목 || "과목"} 성적 없음\`);
  }

  const 과목데이터 = 점수표[과목.과목];
  if (!과목데이터) throw new Error(\`과목 데이터 없음: \${과목.과목}\`);

  const 표준점수데이터 = 과목데이터[String(과목.표준점수)];
  if (!표준점수데이터) throw new Error(\`표준점수 데이터 없음: \${과목.표준점수}\`);

  const 환산점수 = 표준점수데이터[학교];
  if (환산점수 === undefined) throw new Error(\`환산점수 데이터 없음: \${학교}\`);

  return typeof 환산점수 === "string" ? 0 : 환산점수;
};

// 필수조건 체크 (수학선택, 탐구선택)
const check필수조건 = (
  params: 정시점수계산Params,
  학교: string
): { valid: boolean; message?: string } => {
  const 조건 = 학교조건2026[학교];
  if (!조건) return { valid: false, message: "학교 조건 없음" };

  const { 수학선택, 탐구합선택 } = 조건;
  const { 수학, 과탐1, 과탐2, 사탐1, 사탐2 } = params;

  // 수학 선택 체크 (가=미적/기하필수, 나=확통필수, 가나=무관)
  if (수학선택 === '가' && 수학.과목 === '수학(확통)') {
    return { valid: false, message: "미적분/기하 필수" };
  }
  if (수학선택 === '나' && 수학.과목 !== '수학(확통)') {
    return { valid: false, message: "확통 필수" };
  }

  // 탐구 선택 체크 (과=과탐2개필수, 사=사탐2개필수, 사과=무관)
  const 과탐선택개수 = [과탐1, 과탐2].filter(Boolean).length;
  const 사탐선택개수 = [사탐1, 사탐2].filter(Boolean).length;

  if (탐구합선택 === '과' && 과탐선택개수 < 2) {
    return { valid: false, message: "과탐 2과목 필수" };
  }
  if (탐구합선택 === '사' && 사탐선택개수 < 2) {
    return { valid: false, message: "사탐 2과목 필수" };
  }

  return { valid: true };
};

// LARGE 함수 (배열에서 n번째로 큰 값)
const LARGE = (arr: number[], n: number): number => {
  const sorted = [...arr].filter(x => !isNaN(x)).sort((a, b) => b - a);
  return sorted[n - 1] ?? 0;
};

// 메인 계산 함수
export const calc정시환산점수2026 = async (
  params: 정시점수계산Params,
): Promise<정시점수계산결과> => {
  await ensureDataLoaded();
  const { 학교, 과탐1, 과탐2, 사탐1, 사탐2 } = params;

  try {
    const 조건 = 학교조건2026[학교];
    if (!조건) {
      return { success: false, result: "학교 조건 없음" };
    }

    const 조건체크 = check필수조건(params, 학교);
    if (!조건체크.valid) {
      return { success: false, result: 조건체크.message };
    }

    const 환산점수Params: 환산점수계산Params = {
      ...params,
      국어환산점수: 환산점수계산기(params.국어, 학교),
      수학환산점수: 환산점수계산기(params.수학, 학교),
      영어환산점수: 환산점수계산기(params.영어, 학교),
      한국사환산점수: 환산점수계산기(params.한국사, 학교),
      과탐1환산점수: 과탐1 ? 환산점수계산기(과탐1, 학교) : null,
      과탐2환산점수: 과탐2 ? 환산점수계산기(과탐2, 학교) : null,
      사탐1환산점수: 사탐1 ? 환산점수계산기(사탐1, 학교) : null,
      사탐2환산점수: 사탐2 ? 환산점수계산기(사탐2, 학교) : null,
      제2외국어환산점수: params.제2외국어
        ? 환산점수계산기(params.제2외국어, 학교)
        : null,
    };

    // 특수 케이스 처리
    if (학교.startsWith('고려세')) {
      return calc고려세2026(환산점수Params, 조건);
    }
    if (학교.startsWith('경기')) {
      return calc경기2026(환산점수Params, 조건);
    }
    if (학교.startsWith('이화')) {
      return calc이화2026(환산점수Params, 조건);
    }

    // 일반 패턴 기반 계산
    const myScore = calcPattern2026(환산점수Params, 조건);

    if (Number.isNaN(myScore)) {
      return { success: false, result: "계산식 오류" };
    }

    const 탐구표준점수 = [과탐1, 과탐2, 사탐1, 사탐2]
      .filter((과목): 과목 is 과목점수Type => !!과목)
      .map((과목) => 과목.표준점수 || 0)
      .sort((a, b) => b - a);

    const 탐구표준점수합계 = 탐구표준점수
      .slice(0, 2)
      .reduce((sum, score) => sum + score, 0);

    const 표점합 =
      (params.국어.표준점수 || 0) +
      (params.수학.표준점수 || 0) +
      탐구표준점수합계;

    return { success: true, 내점수: myScore, 표점합 };
  } catch (e) {
    return {
      success: false,
      result: e instanceof Error ? e.message : "시스템 오류",
    };
  }
};

// 패턴 기반 일반 계산기
const calcPattern2026 = (
  params: 환산점수계산Params,
  조건: 학교조건2026Type
): number => {
  const { 패턴, 탐구과목수, 기본점수, 선택2과목수, 선택3과목수 } = 조건;

  // 탐구 점수 계산
  const 탐구점수 = [
    params.사탐1환산점수,
    params.사탐2환산점수,
    params.과탐1환산점수,
    params.과탐2환산점수,
  ]
    .filter((score): score is number => score !== null)
    .sort((a, b) => b - a)
    .slice(0, 탐구과목수);

  const 탐구과목별계산값 = 탐구점수.reduce((sum, score) => sum + score, 0);

  // 필수 점수 계산 (패턴에서 1인 과목들)
  let 필수점수 = 0;
  if (패턴.국 === 1) 필수점수 += params.국어환산점수;
  if (패턴.수 === 1) 필수점수 += params.수학환산점수;
  if (패턴.영 === 1) 필수점수 += params.영어환산점수;
  if (패턴.탐 === 1) 필수점수 += 탐구과목별계산값;
  if (패턴.한 === 1) 필수점수 += params.한국사환산점수;
  if (패턴.외 === 1) 필수점수 += (params.제2외국어환산점수 ?? 0);

  // 선택2 점수 계산 (패턴에서 2인 과목들 중 선택2과목수 만큼)
  const 선택2대상 = [];
  if (패턴.국 === 2) 선택2대상.push(params.국어환산점수);
  if (패턴.수 === 2) 선택2대상.push(params.수학환산점수);
  if (패턴.영 === 2) 선택2대상.push(params.영어환산점수);
  if (패턴.탐 === 2) 선택2대상.push(탐구과목별계산값);
  if (패턴.한 === 2) 선택2대상.push(params.한국사환산점수);
  if (패턴.외 === 2) 선택2대상.push(params.제2외국어환산점수 ?? 0);

  const 선택2점수 = 선택2대상
    .sort((a, b) => b - a)
    .slice(0, 선택2과목수 || 선택2대상.length)
    .reduce((sum, score) => sum + score, 0);

  // 선택3 점수 계산 (패턴에서 3인 과목들 중 선택3과목수 만큼)
  const 선택3대상 = [];
  if (패턴.국 === 3) 선택3대상.push(params.국어환산점수);
  if (패턴.수 === 3) 선택3대상.push(params.수학환산점수);
  if (패턴.영 === 3) 선택3대상.push(params.영어환산점수);
  if (패턴.탐 === 3) 선택3대상.push(탐구과목별계산값);
  if (패턴.한 === 3) 선택3대상.push(params.한국사환산점수);
  if (패턴.외 === 3) 선택3대상.push(params.제2외국어환산점수 ?? 0);

  const 선택3점수 = 선택3대상
    .sort((a, b) => b - a)
    .slice(0, 선택3과목수 || 선택3대상.length)
    .reduce((sum, score) => sum + score, 0);

  return 필수점수 + 선택2점수 + 선택3점수 + 기본점수;
};

// 고려세 계열 계산기 (2026)
const calc고려세2026 = (
  params: 환산점수계산Params,
  조건: 학교조건2026Type
): 정시점수계산결과 => {
  const 학교 = params.학교;

  // 고려세 비율 설정
  let 국어비율 = 0.3, 수학비율 = 0.3, 영어비율 = 0.2, 탐구비율 = 0.2;

  switch (학교) {
    case '고려세경통':
      국어비율 = 0.3; 수학비율 = 0.3; 영어비율 = 0.2; 탐구비율 = 0.2;
      break;
    case '고려세기계':
    case '고려세빅데사':
    case '고려세신약':
      국어비율 = 0.2; 수학비율 = 0.35; 영어비율 = 0.2; 탐구비율 = 0.25;
      break;
    case '고려세문화':
      국어비율 = 0.35; 수학비율 = 0.2; 영어비율 = 0.2; 탐구비율 = 0.25;
      break;
    default:
      return { success: false, result: "지원하지 않는 고려세 학교" };
  }

  // 탐구 변환점수
  const 사탐1변환점수 = params.사탐1?.백분위 ? 고려세사탐변환점수[params.사탐1.백분위] : null;
  const 사탐2변환점수 = params.사탐2?.백분위 ? 고려세사탐변환점수[params.사탐2.백분위] : null;
  const 과탐1변환점수 = params.과탐1?.백분위 ? 고려세과탐변환점수[params.과탐1.백분위] : null;
  const 과탐2변환점수 = params.과탐2?.백분위 ? 고려세과탐변환점수[params.과탐2.백분위] : null;

  const 탐구변환점수합 = [사탐1변환점수, 사탐2변환점수, 과탐1변환점수, 과탐2변환점수]
    .filter((score): score is number => score !== null)
    .reduce((sum, score) => sum + score, 0);

  const 영어변환점수 = params.영어?.등급 ? 고려세영어변환점수[params.영어.등급 - 1] : 0;

  const 탐구변환점수최대값 = Math.max(고려세사탐변환점수[100], 고려세과탐변환점수[100]);
  const 국어최대표점 = 139;
  const 수학최대표점 = 139;

  const top =
    (params.국어.표준점수 ?? 0) * 국어비율 +
    (params.수학.표준점수 ?? 0) * 수학비율 +
    영어변환점수 * 영어비율 +
    탐구변환점수합 * 탐구비율;

  const bottom =
    국어최대표점 * 국어비율 +
    수학최대표점 * 수학비율 +
    영어변환점수 * 영어비율 +
    탐구변환점수최대값 * 탐구비율 * 2;

  const 내점수 = (top / bottom) * 1000;

  const 탐구표준점수 = [params.과탐1, params.과탐2, params.사탐1, params.사탐2]
    .filter((과목): 과목 is 과목점수Type => !!과목)
    .map((과목) => 과목.표준점수 || 0)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((sum, score) => sum + score, 0);

  const 표점합 = (params.국어.표준점수 || 0) + (params.수학.표준점수 || 0) + 탐구표준점수;

  return { success: true, 내점수, 표점합 };
};

// 경기 계열 계산기 (2026)
const calc경기2026 = (
  params: 환산점수계산Params,
  조건: 학교조건2026Type
): 정시점수계산결과 => {
  const 학교 = params.학교;

  // 경기자전: 인문/자연 중 유리한 것 선택
  if (학교 === '경기자전') {
    const 인문점수 = calc경기단일(params, 0.3, 0.35, 0.2, 0.15);
    const 자연점수 = calc경기단일(params, 0.35, 0.3, 0.2, 0.15);
    const 내점수 = Math.max(인문점수, 자연점수);

    const 탐구표준점수 = [params.과탐1, params.과탐2, params.사탐1, params.사탐2]
      .filter((과목): 과목 is 과목점수Type => !!과목)
      .map((과목) => 과목.표준점수 || 0)
      .sort((a, b) => b - a)
      .slice(0, 2)
      .reduce((sum, score) => sum + score, 0);

    const 표점합 = (params.국어.표준점수 || 0) + (params.수학.표준점수 || 0) + 탐구표준점수;
    return { success: true, 내점수, 표점합 };
  }

  // 경기인문, 경기자연, 경기과기: 일반 패턴 계산
  return {
    success: true,
    내점수: calcPattern2026(params, 조건),
    표점합: (params.국어.표준점수 || 0) + (params.수학.표준점수 || 0)
  };
};

const calc경기단일 = (
  params: 환산점수계산Params,
  국어비율: number,
  수학비율: number,
  영어비율: number,
  탐구비율: number
): number => {
  const 탐구백분위최고 = [
    params.사탐1?.백분위,
    params.사탐2?.백분위,
    params.과탐1?.백분위,
    params.과탐2?.백분위,
  ]
    .filter((score): score is number => score !== undefined)
    .sort((a, b) => b - a)[0] ?? 0;

  const 영어변환점수 = params.영어?.등급 ? 경기자전영어변환점수[params.영어.등급 - 1] : 0;
  const 한국사변환점수 = params.한국사?.등급 ? 경기자전한국사변환점수[params.한국사.등급 - 1] : 0;

  return (
    (params.국어.백분위 ?? 0) * 국어비율 +
    (params.수학.백분위 ?? 0) * 수학비율 +
    영어변환점수 * 영어비율 +
    탐구백분위최고 * 탐구비율 -
    한국사변환점수
  );
};

// 이화 계열 계산기 (2026)
const calc이화2026 = (
  params: 환산점수계산Params,
  조건: 학교조건2026Type
): 정시점수계산결과 => {
  const 학교 = params.학교;

  // 이화간호: 인문/자연 중 유리한 것 선택
  if (학교 === '이화간호') {
    const 인문점수 = calc이화단일(params, 0.3, 0.3, 0.2, 0.2, false);
    const 자연점수 = calc이화단일(params, 0.25, 0.3, 0.2, 0.25, true);
    const 내점수 = Math.max(인문점수, 자연점수);

    const 탐구표준점수 = [params.과탐1, params.과탐2, params.사탐1, params.사탐2]
      .filter((과목): 과목 is 과목점수Type => !!과목)
      .map((과목) => 과목.표준점수 || 0)
      .sort((a, b) => b - a)
      .slice(0, 2)
      .reduce((sum, score) => sum + score, 0);

    const 표점합 = (params.국어.표준점수 || 0) + (params.수학.표준점수 || 0) + 탐구표준점수;
    return { success: true, 내점수, 표점합 };
  }

  // 이화인문, 이화자연: 일반 패턴 계산
  return {
    success: true,
    내점수: calcPattern2026(params, 조건),
    표점합: (params.국어.표준점수 || 0) + (params.수학.표준점수 || 0)
  };
};

const calc이화단일 = (
  params: 환산점수계산Params,
  국어비율: number,
  수학비율: number,
  영어비율: number,
  탐구비율: number,
  자연여부: boolean
): number => {
  const 사탐1변환표준점수 = params.사탐1?.표준점수 ? 고려세사탐변환점수[params.사탐1.표준점수] : null;
  const 사탐2변환표준점수 = params.사탐2?.표준점수 ? 고려세사탐변환점수[params.사탐2.표준점수] : null;
  const 과탐1변환표준점수 = params.과탐1?.표준점수
    ? (자연여부 ? 고려세과탐변환점수[params.과탐1.표준점수] * 1.06 : 고려세과탐변환점수[params.과탐1.표준점수])
    : null;
  const 과탐2변환표준점수 = params.과탐2?.표준점수
    ? (자연여부 ? 고려세과탐변환점수[params.과탐2.표준점수] * 1.06 : 고려세과탐변환점수[params.과탐2.표준점수])
    : null;

  const 탐구변환표준점수합 = [사탐1변환표준점수, 사탐2변환표준점수, 과탐1변환표준점수, 과탐2변환표준점수]
    .filter((score): score is number => score !== null)
    .reduce((sum, score) => sum + score, 0);

  const 영어변환점수 = params.영어?.등급 ? 이화간호영어변환점수[params.영어.등급 - 1] : 0;
  const 한국사변환점수 = params.한국사?.등급
    ? (자연여부 ? 이화간호한국사자연변환점수[params.한국사.등급 - 1] : 이화간호한국사인문변환점수[params.한국사.등급 - 1])
    : 0;

  const 국어최고표준점 = 139;
  const 수학최고표준점 = 139;
  const 탐구최고표준점 = Math.max(고려세사탐변환점수[100], 고려세과탐변환점수[100]);

  const top =
    (params.국어.표준점수 ?? 0) * 국어비율 +
    (params.수학.표준점수 ?? 0) * 수학비율 +
    탐구변환표준점수합 * 탐구비율;

  const bottom =
    국어최고표준점 * 국어비율 +
    수학최고표준점 * 수학비율 +
    탐구최고표준점 * 탐구비율 * 2;

  return (top / bottom + (영어변환점수 / 100) * 영어비율) * 1000 + 한국사변환점수;
};

// 지원 대학 목록 내보내기
export const get지원대학목록2026 = (): string[] => {
  return Object.keys(학교조건2026);
};

// 패턴 통계 내보내기
export const get패턴통계2026 = () => {
  const stats: Record<string, number> = {};
  Object.values(학교조건2026).forEach(조건 => {
    stats[조건.패턴키] = (stats[조건.패턴키] || 0) + 1;
  });
  return stats;
};
`;

  return code;
}

// 코드 생성 및 파일 저장
const tsCode = generateTypeScript();

// 파일 저장
fs.writeFileSync('./src/modules/jungsi/calculation/calculations/calc-2026.ts', tsCode);
console.log('calc-2026.ts 생성 완료! (v2 - 패턴 기반)');
console.log(`총 ${Object.keys(conditions).length}개의 환산인자 처리됨`);

// 패턴 통계 출력
console.log('\n=== 패턴별 대학 수 ===');
const patternStats = {};
Object.values(conditions).forEach(c => {
  patternStats[c.패턴키] = (patternStats[c.패턴키] || 0) + 1;
});
Object.entries(patternStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([pattern, count]) => {
    console.log(`${pattern}: ${count}개`);
  });
