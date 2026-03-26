const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('./uploads/26 정시 계산식 2 out.xlsx');
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 컬럼 인덱스 (분석 결과 기반)
const cols = {
  대학명: 0, 환산인자: 1, 수능반영방식: 2, 환산식코드: 3,
  국: 4, 수: 5, 영: 6, 탐: 7, 한: 8, 외: 9,
  선택2과목수: 10, 선택3과목수: 11, 탐구과목수: 12,
  필수: 13, 선택: 14, 가중택: 15, 추가가감: 16, 기본점수: 17,
  필수설명: 18, 선택설명: 19, 가중택설명: 20,
  수학선택: 21, 탐구합선택: 22, 한국사대체: 23, 제2외국어대체: 24
};

// Excel 수식을 TypeScript로 변환하는 함수
function convertFormula(formula, 환산인자) {
  if (!formula || formula === 0) return null;

  let ts = String(formula);

  // 셀 참조 제거 (예: FV국어 -> 국어환산점수)
  // 변수 치환
  ts = ts.replace(/[A-Z]{1,2}국어/g, 'params.국어환산점수');
  ts = ts.replace(/[A-Z]{1,2}수학/g, 'params.수학환산점수');
  ts = ts.replace(/[A-Z]{1,2}영어/g, 'params.영어환산점수');
  ts = ts.replace(/[A-Z]{1,2}탐구합/g, '탐구과목별계산값');
  ts = ts.replace(/[A-Z]{1,2}탐구1/g, '탐구점수[0]');
  ts = ts.replace(/[A-Z]{1,2}탐구2/g, '탐구점수[1]');
  ts = ts.replace(/[A-Z]{1,2}한국사/g, 'params.한국사환산점수');
  ts = ts.replace(/[A-Z]{1,2}외국어/g, '(params.제2외국어환산점수 ?? 0)');

  // LARGE 함수 변환
  // LARGE((a,b,c),1) -> [a,b,c].sort((x,y)=>y-x)[0]
  ts = ts.replace(/LARGE\(\(([^)]+)\),(\d+)\)/g, (match, items, index) => {
    const idx = parseInt(index) - 1;
    return `[${items}].sort((a,b)=>b-a)[${idx}]`;
  });

  // MAX 함수 변환
  ts = ts.replace(/MAX\(([^)]+)\)/g, 'Math.max($1)');

  // SUM 함수 변환
  ts = ts.replace(/SUM\(([^)]+)\)/g, '([$1].reduce((a,b)=>a+b,0))');

  // IF 함수 변환 (단순 케이스)
  // IF(cond,true,false) -> cond ? true : false
  ts = ts.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/g, '($1 ? $2 : $3)');

  // COUNTIFS 변환 (간략화)
  ts = ts.replace(/COUNTIFS\([^)]+\)/g, '과탐선택개수');

  return ts;
}

// 조건 데이터 생성
const conditions = {};
const calculations = {
  필수: {},
  선택: {},
  가중택: {},
  추가가감: {}
};

// 각 행 처리
data.slice(1).forEach(row => {
  const 환산인자 = row[cols.환산인자];
  if (!환산인자) return;

  // 과목 필수/선택 패턴
  const pattern = {
    국: row[cols.국] || 0,
    수: row[cols.수] || 0,
    영: row[cols.영] || 0,
    탐: row[cols.탐] || 0,
    한: row[cols.한] || 0,
    외: row[cols.외] || 0,
  };

  // 조건 데이터
  conditions[환산인자] = {
    패턴: pattern,
    선택2과목수: row[cols.선택2과목수] || 0,
    선택3과목수: row[cols.선택3과목수] || 0,
    탐구과목수: row[cols.탐구과목수] || 0,
    기본점수: row[cols.기본점수] || 0,
    수학선택: row[cols.수학선택] || '가나',
    탐구합선택: row[cols.탐구합선택] || '사과',
  };

  // 수식 저장
  calculations.필수[환산인자] = row[cols.필수];
  calculations.선택[환산인자] = row[cols.선택];
  calculations.가중택[환산인자] = row[cols.가중택];
  calculations.추가가감[환산인자] = row[cols.추가가감];
});

// 패턴 그룹화 (동일 계산식을 사용하는 환산인자들을 그룹화)
function groupByFormula(formulaMap) {
  const groups = {};

  Object.entries(formulaMap).forEach(([환산인자, formula]) => {
    if (!formula || formula === 0) return;
    const key = String(formula);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(환산인자);
  });

  return groups;
}

// TypeScript 코드 생성
function generateTypeScript() {
  let code = `// 2026 정시 환산점수 계산기
// 자동 생성됨: ${new Date().toISOString()}

import { lazy점수표, lazy조건 } from './lazy-load';
import {
  정시점수계산결과,
  정시점수계산Params,
  과목점수Type,
  점수표Type,
  학교조건Type,
  환산점수계산Params,
  MockExamScoreInput,
} from './types';

let 점수표: 점수표Type;
let 학교조건2026: Record<string, {
  패턴: { 국: number; 수: number; 영: number; 탐: number; 한: number; 외: number };
  선택2과목수: number;
  선택3과목수: number;
  탐구과목수: number;
  기본점수: number;
  수학선택: string;
  탐구합선택: string;
}>;

// 2026 학교 조건 데이터
const 학교조건2026Data: typeof 학교조건2026 = ${JSON.stringify(conditions, null, 2)};

const ensureDataLoaded = async () => {
  if (!점수표) 점수표 = await lazy점수표();
  학교조건2026 = 학교조건2026Data;
};

// 점수표 JSON 에서 해당 학교/과목/점수의 환산점수를 가져옴
const 환산점수계산기 = (과목: 과목점수Type, 학교: string): number => {
  if (!과목.과목 || !과목.등급) {
    throw new Error(\`\${과목.과목 || "과목"} 성적 없음\`);
  }

  const 과목데이터 = 점수표[과목.과목];
  if (!과목데이터) throw new Error("과목 데이터 없음");

  const 표준점수데이터 = 과목데이터[String(과목.표준점수)];
  if (!표준점수데이터) throw new Error("표준점수 데이터 없음");

  const 환산점수 = 표준점수데이터[학교];
  if (환산점수 === undefined) throw new Error("환산점수 데이터 없음");

  return typeof 환산점수 === "string" ? 0 : 환산점수;
};

`;

  // 필수조건 체크 함수
  code += `
// 필수조건 체크 (수학선택, 탐구선택)
const check필수조건 = (
  params: 정시점수계산Params,
  학교: string
): { valid: boolean; message?: string } => {
  const 조건 = 학교조건2026[학교];
  if (!조건) return { valid: false, message: "학교 조건 없음" };

  const { 수학선택, 탐구합선택 } = 조건;
  const { 수학, 과탐1, 과탐2, 사탐1, 사탐2 } = params;

  // 수학 선택 체크
  if (수학선택 === '가' && 수학.과목 === '수학(확통)') {
    return { valid: false, message: "미적분/기하 필수" };
  }
  if (수학선택 === '나' && 수학.과목 !== '수학(확통)') {
    return { valid: false, message: "확통 필수" };
  }

  // 탐구 선택 체크
  const 과탐선택개수 = [과탐1, 과탐2].filter(Boolean).length;
  const 사탐선택개수 = [사탐1, 사탐2].filter(Boolean).length;

  if (탐구합선택 === '과' && (과탐선택개수 < 2)) {
    return { valid: false, message: "과탐 2과목 필수" };
  }
  if (탐구합선택 === '사' && (사탐선택개수 < 2)) {
    return { valid: false, message: "사탐 2과목 필수" };
  }

  return { valid: true };
};

`;

  // 메인 계산 함수
  code += `
export const calc정시환산점수2026 = async (
  params: 정시점수계산Params,
): Promise<정시점수계산결과> => {
  await ensureDataLoaded();
  const { 학교, 수학, 과탐1, 과탐2, 사탐1, 사탐2 } = params;

  try {
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

    let myScore =
      수능환산필수계산기2026(환산점수Params) +
      수능환산선택계산기2026(환산점수Params) +
      수능환산가중택계산기2026(환산점수Params) +
      추가가감계산기2026(환산점수Params);

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

`;

  // 필수 계산기 생성
  code += generateCalculator('필수', calculations.필수);
  code += generateCalculator('선택', calculations.선택);
  code += generateCalculator('가중택', calculations.가중택);
  code += generateCalculator('추가가감', calculations.추가가감);

  return code;
}

function generateCalculator(name, formulaMap) {
  const groups = groupByFormula(formulaMap);

  let code = `
// 수능환산${name}계산기 (2026)
const 수능환산${name}계산기2026 = (params: 환산점수계산Params): number => {
  const 조건 = 학교조건2026[params.학교];
  if (!조건) throw new Error("학교 조건 없음");

  const { 탐구과목수 = 0, 기본점수 = 0 } = 조건;

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

  let result = 0;

  switch (params.학교) {
`;

  // 각 환산인자별 case 생성
  Object.entries(formulaMap).forEach(([환산인자, formula]) => {
    if (!formula || formula === 0) return;

    const tsFormula = convertFormula(formula, 환산인자);
    if (tsFormula) {
      code += `    case '${환산인자}':
      // 원본: ${String(formula).substring(0, 60)}...
      result = ${tsFormula};
      break;
`;
    }
  });

  code += `    default:
      break;
  }

  return ${name === '필수' ? 'result + 기본점수' : 'result'};
};

`;

  return code;
}

// 코드 생성 및 파일 저장
const tsCode = generateTypeScript();

// 파일 저장
fs.writeFileSync('./src/modules/jungsi/calculation/calculations/calc-2026.ts', tsCode);
console.log('calc-2026.ts 생성 완료!');
console.log(`총 ${Object.keys(conditions).length}개의 환산인자 처리됨`);

// 통계 출력
console.log('\n=== 통계 ===');
console.log('필수 수식:', Object.values(calculations.필수).filter(f => f && f !== 0).length);
console.log('선택 수식:', Object.values(calculations.선택).filter(f => f && f !== 0).length);
console.log('가중택 수식:', Object.values(calculations.가중택).filter(f => f && f !== 0).length);
console.log('추가가감 수식:', Object.values(calculations.추가가감).filter(f => f && f !== 0).length);
