const XLSX = require('xlsx');

// 2025 전형결과 데이터 읽기
const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== 2025 전형결과 변환 (원본 데이터 충실) ===');
console.log('원본 행 수:', data.length);

// 값 파싱 헬퍼 (빈 값은 null 반환)
const parseVal = (val) => {
  if (val === null || val === undefined || val === '' || val === '-') return null;
  if (typeof val === 'string' && val.includes('※')) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

// 백분위 평균 계산 (국, 수, 탐1, 탐2만 - 있는 값들만)
const calcAvg = (...vals) => {
  const valid = vals.filter(v => v !== null);
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100;
};

// 결과 데이터 생성
const results = [];
let currentUniv = '';
let currentGroup = '';

// 기본 컬럼 인덱스 (원본 파일 구조 기준)
const COL = {
  GROUP: 2, DEPT: 3, INITIAL: 4, TRANSFER: 5, FINAL: 6,
  COMPETITION: 7, ADD_RANK: 8, CUT_50: 9, CUT_70: 10, TOTAL: 11,
  KOR_50: 12, MATH_50: 13, RES1_50: 14, RES2_50: 15, ENG_50: 16, HIST_50: 17,
  KOR_70: 18, MATH_70: 19, RES1_70: 20, RES2_70: 21, ENG_70: 22, HIST_70: 23,
};

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;

  // 대학명 감지 (컬럼 1에 "대학" 포함)
  if (row[1] && typeof row[1] === 'string' &&
      (row[1].includes('대학교') || row[1].includes('대학'))) {
    currentUniv = row[1];
    currentGroup = '';
    continue;
  }

  // 헤더 행 스킵
  if (row[2] && typeof row[2] === 'string') {
    const cell2 = row[2];
    if (cell2.includes('구분') || cell2.includes('모집인원') ||
        cell2.includes('최초') || cell2.includes('등록자') ||
        cell2.includes('백분위') || cell2.includes('과목별')) {
      continue;
    }
  }

  // 군 업데이트
  if (row[2] && typeof row[2] === 'string') {
    const match = row[2].match(/[가나다]/);
    if (match) {
      currentGroup = match[0] + '군';
    }
  }

  // 모집단위 데이터
  if (!currentUniv) continue;

  const deptName = row[3];
  if (!deptName || typeof deptName !== 'string') continue;
  if (deptName.includes('모집단위') || deptName.includes('구분')) continue;
  if (deptName.includes('※')) continue;

  // 데이터 추출 (있는 그대로)
  const initialQuota = parseVal(row[COL.INITIAL]);
  const transfer = parseVal(row[COL.TRANSFER]);
  // 최종 정원: FINAL 값이 있으면 사용, 없으면 INITIAL + TRANSFER
  let finalQuota = parseVal(row[COL.FINAL]);
  if (finalQuota === null && (initialQuota !== null || transfer !== null)) {
    finalQuota = (initialQuota || 0) + (transfer || 0);
  }

  const competition = parseVal(row[COL.COMPETITION]);
  const addRank = parseVal(row[COL.ADD_RANK]);
  const cut50 = parseVal(row[COL.CUT_50]);
  const cut70 = parseVal(row[COL.CUT_70]);
  const totalScore = parseVal(row[COL.TOTAL]);

  // 백분위 과목별 (원본 그대로)
  const kor50 = parseVal(row[COL.KOR_50]);
  const math50 = parseVal(row[COL.MATH_50]);
  const res1_50 = parseVal(row[COL.RES1_50]);
  const res2_50 = parseVal(row[COL.RES2_50]);
  const eng50 = parseVal(row[COL.ENG_50]);
  const hist50 = parseVal(row[COL.HIST_50]);

  const kor70 = parseVal(row[COL.KOR_70]);
  const math70 = parseVal(row[COL.MATH_70]);
  const res1_70 = parseVal(row[COL.RES1_70]);
  const res2_70 = parseVal(row[COL.RES2_70]);
  const eng70 = parseVal(row[COL.ENG_70]);
  const hist70 = parseVal(row[COL.HIST_70]);

  // 백분위 평균 (국, 수, 탐1, 탐2 중 있는 값들만 평균)
  const avg50 = calcAvg(kor50, math50, res1_50, res2_50);
  const avg70 = calcAvg(kor70, math70, res1_70, res2_70);

  // 유효한 데이터가 하나라도 있으면 추가
  if (cut50 !== null || cut70 !== null || competition !== null || finalQuota !== null) {
    results.push({
      university: currentUniv,
      group: currentGroup || '',
      dept: deptName.trim(),
      quota: finalQuota,
      competition,
      addRank,
      cut50,
      cut70,
      totalScore,
      kor50, math50, res1_50, res2_50, eng50, hist50, avg50,
      kor70, math70, res1_70, res2_70, eng70, hist70, avg70,
    });
  }
}

console.log('변환된 레코드 수:', results.length);

// 대학별로 그룹화
const univGroups = new Map();
results.forEach(r => {
  if (!univGroups.has(r.university)) {
    univGroups.set(r.university, []);
  }
  univGroups.get(r.university).push(r);
});

console.log('대학 수:', univGroups.size);

// 새 워크북 생성
const newWb = XLSX.utils.book_new();

// 헤더 행 (양식과 동일)
const header1 = [
  '구분', '모집단위', '모집인원(최종)', '경쟁률', '충원합격순위',
  '대학별 환산점수', '', '총점(수능)',
  '백분위', '', '', '', '', '', '',
  '', '', '', '', '', '', ''
];
const header2 = [
  '', '', '', '', '',
  '최종등록자 50%컷', '최종등록자 70%컷', '',
  '최종등록자 50%컷', '', '', '', '', '', '',
  '최종등록자 70%컷', '', '', '', '', '', ''
];
const header3 = [
  '', '', '', '', '',
  '', '', '',
  '국', '수', '탐1', '탐2', '영', '한', '백분위평균',
  '국', '수', '탐1', '탐2', '영', '한', '백분위평균'
];

// 전체 데이터를 하나의 시트에
const allData = [header1, header2, header3];

for (const [univ, records] of univGroups) {
  // 대학명 행 추가
  allData.push([univ]);

  // 데이터 행 (null은 빈 셀로)
  for (const r of records) {
    allData.push([
      r.group || '',
      r.dept,
      r.quota,
      r.competition,
      r.addRank,
      r.cut50,
      r.cut70,
      r.totalScore,
      r.kor50, r.math50, r.res1_50, r.res2_50, r.eng50, r.hist50, r.avg50,
      r.kor70, r.math70, r.res1_70, r.res2_70, r.eng70, r.hist70, r.avg70
    ]);
  }
}

const allWs = XLSX.utils.aoa_to_sheet(allData);
XLSX.utils.book_append_sheet(newWb, allWs, '2025_전체');

// 파일 저장
XLSX.writeFile(newWb, 'uploads/2025-실제컷-정리.xlsx');
console.log('\n저장 완료: uploads/2025-실제컷-정리.xlsx');

// 샘플 출력 (백분위 평균 있는 데이터)
console.log('\n=== 백분위 데이터 있는 샘플 ===');
let sampleCount = 0;
for (const r of results) {
  if (r.avg50 !== null && sampleCount < 5) {
    console.log(`${sampleCount + 1}. ${r.university} | ${r.group} | ${r.dept}`);
    console.log(`   정원:${r.quota} 경쟁률:${r.competition} 50%컷:${r.cut50} 70%컷:${r.cut70}`);
    console.log(`   50% 백분위: 국${r.kor50} 수${r.math50} 탐${r.res1_50}/${r.res2_50} 영${r.eng50} 한${r.hist50} 평균${r.avg50}`);
    sampleCount++;
  }
}

// 백분위 없는 대학 샘플
console.log('\n=== 백분위 과목별 데이터 없는 대학 샘플 ===');
sampleCount = 0;
for (const r of results) {
  if (r.avg50 === null && r.cut50 !== null && sampleCount < 5) {
    console.log(`${sampleCount + 1}. ${r.university} | ${r.group} | ${r.dept}`);
    console.log(`   정원:${r.quota} 경쟁률:${r.competition} 50%컷:${r.cut50} 70%컷:${r.cut70}`);
    sampleCount++;
  }
}

// 통계
const withAvg50 = results.filter(r => r.avg50 !== null).length;
const withCut50 = results.filter(r => r.cut50 !== null).length;
console.log('\n=== 통계 ===');
console.log('전체 레코드:', results.length);
console.log('50%컷 있음:', withCut50);
console.log('백분위 평균 있음:', withAvg50);
