const XLSX = require('xlsx');

// 2025 전형결과 데이터 읽기
const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== 2025 전형결과 변환 ===');
console.log('원본 행 수:', data.length);

// 원본 컬럼 매핑 (이전 분석 기반)
const SRC = {
  GROUP: 2,           // 군 (가/나/다)
  DEPT: 3,            // 모집단위
  INITIAL_QUOTA: 4,   // 최초 모집인원 (A)
  TRANSFER: 5,        // 이월 (B)
  FINAL_QUOTA: 6,     // 최종 모집인원 (A+B)
  COMPETITION: 7,     // 경쟁률
  ADD_RANK: 8,        // 충원합격순위
  CUT_50: 9,          // 대학별 환산점수 50%컷
  CUT_70: 10,         // 대학별 환산점수 70%컷
  TOTAL_SCORE: 11,    // 총점(수능)
  // 백분위 50%
  KOR_50: 12, MATH_50: 13, RES1_50: 14, RES2_50: 15, ENG_50: 16, HIST_50: 17,
  // 백분위 70%
  KOR_70: 18, MATH_70: 19, RES1_70: 20, RES2_70: 21, ENG_70: 22, HIST_70: 23,
};

// 결과 데이터 생성
const results = [];
let currentUniv = '';
let currentGroup = '';

for (let i = 8; i < data.length; i++) {
  const row = data[i];

  // 대학명 감지
  if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
    currentUniv = row[1];
    currentGroup = '';
    continue;
  }

  // 군 업데이트
  if (row[SRC.GROUP] && typeof row[SRC.GROUP] === 'string') {
    const match = row[SRC.GROUP].match(/[가나다]/);
    if (match) currentGroup = match[0] + '군';
    else if (row[SRC.GROUP].includes('군')) currentGroup = row[SRC.GROUP];
  }

  // 모집단위 데이터
  if (row[SRC.DEPT] && currentUniv && typeof row[SRC.DEPT] === 'string' &&
      !['모집단위', '구분'].includes(row[SRC.DEPT])) {

    // 모집인원: 이월 포함 최종 (없으면 최초)
    const finalQuota = parseFloat(row[SRC.FINAL_QUOTA]) || parseFloat(row[SRC.INITIAL_QUOTA]) || null;

    // 경쟁률
    const competition = parseFloat(row[SRC.COMPETITION]) || null;

    // 충원합격순위
    const addRank = row[SRC.ADD_RANK] === '-' ? null : (parseInt(row[SRC.ADD_RANK]) || null);

    // 대학별 환산점수
    const cut50 = parseFloat(row[SRC.CUT_50]);
    const cut70 = parseFloat(row[SRC.CUT_70]);
    const totalScore = parseFloat(row[SRC.TOTAL_SCORE]) || null;

    // 값 파싱 헬퍼 (빈 문자열, '-', 공백 처리)
    const parseVal = (val) => {
      if (val === null || val === undefined || val === '' || val === '-') return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    // 백분위 50%
    const kor50 = parseVal(row[SRC.KOR_50]);
    const math50 = parseVal(row[SRC.MATH_50]);
    const res1_50 = parseVal(row[SRC.RES1_50]);
    const res2_50 = parseVal(row[SRC.RES2_50]);
    const eng50 = parseVal(row[SRC.ENG_50]);
    const hist50 = parseVal(row[SRC.HIST_50]);

    // 백분위 70%
    const kor70 = parseVal(row[SRC.KOR_70]);
    const math70 = parseVal(row[SRC.MATH_70]);
    const res1_70 = parseVal(row[SRC.RES1_70]);
    const res2_70 = parseVal(row[SRC.RES2_70]);
    const eng70 = parseVal(row[SRC.ENG_70]);
    const hist70 = parseVal(row[SRC.HIST_70]);

    // 백분위 평균 계산 (값이 있는 것들만 평균)
    const calcAvg = (...vals) => {
      const valid = vals.filter(v => v !== null && !isNaN(v));
      if (valid.length === 0) return null;
      return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100;
    };

    const avg50 = calcAvg(kor50, math50, res1_50, res2_50);
    const avg70 = calcAvg(kor70, math70, res1_70, res2_70);

    // 유효한 데이터만 추가
    if (!isNaN(cut50) || !isNaN(cut70) || competition) {
      results.push({
        university: currentUniv,
        group: currentGroup,
        dept: row[SRC.DEPT].trim(),
        quota: finalQuota,
        competition: competition,
        addRank: addRank,
        cut50: isNaN(cut50) ? null : cut50,
        cut70: isNaN(cut70) ? null : cut70,
        totalScore: totalScore,
        kor50, math50, res1_50, res2_50, eng50, hist50, avg50,
        kor70, math70, res1_70, res2_70, eng70, hist70, avg70,
      });
    }
  }
}

console.log('변환된 레코드 수:', results.length);

// 대학별로 시트 생성
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

  // 데이터 행
  for (const r of records) {
    allData.push([
      r.group,
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

// 샘플 출력
console.log('\n=== 샘플 데이터 ===');
results.slice(0, 10).forEach((r, i) => {
  console.log(`${i + 1}. ${r.university} | ${r.group} | ${r.dept}`);
  console.log(`   정원:${r.quota} 경쟁률:${r.competition} 50%컷:${r.cut50} 70%컷:${r.cut70}`);
  console.log(`   50% 백분위: 국${r.kor50} 수${r.math50} 탐${r.res1_50}/${r.res2_50} 영${r.eng50} 한${r.hist50} 평균${r.avg50}`);
});
