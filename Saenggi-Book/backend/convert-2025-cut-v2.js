const XLSX = require('xlsx');
const fs = require('fs');

// 엑셀 파일 읽기
const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// 대학명 정규화 함수
function normalizeUniversityName(name) {
  if (!name) return '';
  return name
    .replace(/\[본교\]/g, '')
    .replace(/\[제\d캠퍼스\]/g, '')
    .replace(/\[분교\]/g, '')
    .replace(/\(글로컬\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 컬럼 매핑 (분석 결과 기반)
const COL = {
  GROUP: 2,          // 군 (가/나/다)
  DEPARTMENT: 3,     // 모집단위
  INITIAL_QUOTA: 4,  // 최초 모집인원
  TRANSFER: 5,       // 이월
  FINAL_QUOTA: 6,    // 최종 모집인원
  COMPETITION: 7,    // 경쟁률
  ADD_RANK: 8,       // 충원합격순위
  CUT_50: 9,         // 50% cut (대학별 환산점수)
  CUT_70: 10,        // 70% cut (대학별 환산점수)
  TOTAL_SCORE: 11,   // 총점
  // 백분위 50%
  KOR_50: 12, MATH_50: 13, RES1_50: 14, RES2_50: 15, ENG_50: 16, HIST_50: 17,
  // 백분위 70%
  KOR_70: 18, MATH_70: 19, RES1_70: 20, RES2_70: 21, ENG_70: 22, HIST_70: 23,
  // 수학 선택과목 비율
  PROB_STAT: 24, CALCULUS: 25, GEOMETRY: 26
};

// 데이터 파싱
const records = [];
let currentUniv = '';
let currentUnivNormalized = '';
let currentGroup = '';

for (let i = 8; i < data.length; i++) {
  const row = data[i];

  // 대학명 감지 (1열에 대학 이름이 있으면)
  if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
    currentUniv = row[1];
    currentUnivNormalized = normalizeUniversityName(row[1]);
    currentGroup = ''; // 새 대학이면 군 초기화
    continue;
  }

  // 군 업데이트 (값이 있으면)
  if (row[COL.GROUP] && typeof row[COL.GROUP] === 'string' &&
      (row[COL.GROUP].includes('군') || ['가군', '나군', '다군'].includes(row[COL.GROUP]))) {
    currentGroup = row[COL.GROUP].replace('군', '');
  }

  // 모집단위 데이터가 있고, 헤더 행이 아닌 경우
  if (row[COL.DEPARTMENT] && currentUniv &&
      typeof row[COL.DEPARTMENT] === 'string' &&
      !['모집단위', '구분'].includes(row[COL.DEPARTMENT])) {

    const cut50 = parseFloat(row[COL.CUT_50]);
    const cut70 = parseFloat(row[COL.CUT_70]);
    const competition = parseFloat(row[COL.COMPETITION]);
    const finalQuota = parseFloat(row[COL.FINAL_QUOTA]);

    // 유효한 데이터만 추가
    if (!isNaN(cut50) || !isNaN(cut70)) {
      records.push({
        // 매칭용
        university_original: currentUniv,
        university: currentUnivNormalized,
        admission_type: currentGroup + '군',
        recruitment_name: row[COL.DEPARTMENT].trim(),

        // 컷 데이터
        year: 2025,
        min_cut: isNaN(cut50) ? null : cut50,
        max_cut: isNaN(cut70) ? null : cut70,
        competition_ratio: isNaN(competition) ? null : competition,
        recruitment_number: isNaN(finalQuota) ? null : finalQuota,
        total_score: parseFloat(row[COL.TOTAL_SCORE]) || null,

        // 백분위 (참고용)
        percentile_50_kor: parseFloat(row[COL.KOR_50]) || null,
        percentile_50_math: parseFloat(row[COL.MATH_50]) || null,
        percentile_50_eng: parseFloat(row[COL.ENG_50]) || null,
        percentile_70_kor: parseFloat(row[COL.KOR_70]) || null,
        percentile_70_math: parseFloat(row[COL.MATH_70]) || null,
        percentile_70_eng: parseFloat(row[COL.ENG_70]) || null,
      });
    }
  }
}

console.log('=== 2025 정시 컷 데이터 변환 (v2) ===');
console.log('총 레코드:', records.length);

// 대학별 통계
const univStats = {};
records.forEach(r => {
  if (!univStats[r.university]) {
    univStats[r.university] = { count: 0, original: r.university_original };
  }
  univStats[r.university].count++;
});
console.log('대학 수:', Object.keys(univStats).length);

// DB import용 형식
const dbRecords = records.map(r => ({
  university: r.university,
  admission_type: r.admission_type,
  recruitment_name: r.recruitment_name,
  year: 2025,
  min_cut: r.min_cut,
  max_cut: r.max_cut,
  competition_ratio: r.competition_ratio,
  recruitment_number: r.recruitment_number,
}));

// 1. JSON 저장
fs.writeFileSync(
  'uploads/2025-jungsi-cut-for-db.json',
  JSON.stringify(dbRecords, null, 2),
  'utf8'
);
console.log('\nJSON 저장: uploads/2025-jungsi-cut-for-db.json');

// 2. 엑셀 저장
const newWb = XLSX.utils.book_new();
const newWs = XLSX.utils.json_to_sheet(dbRecords);
XLSX.utils.book_append_sheet(newWb, newWs, '2025_컷');
XLSX.writeFile(newWb, 'uploads/2025-jungsi-cut-for-db.xlsx');
console.log('엑셀 저장: uploads/2025-jungsi-cut-for-db.xlsx');

// 3. 샘플 출력
console.log('\n=== 변환 결과 샘플 ===');
records.slice(0, 15).forEach((r, i) => {
  console.log(`${i + 1}. ${r.university} | ${r.admission_type} | ${r.recruitment_name}`);
  console.log(`   50%cut: ${r.min_cut} | 70%cut: ${r.max_cut} | 경쟁률: ${r.competition_ratio}`);
});

// 4. 군별 분포
const groupStats = {};
records.forEach(r => {
  groupStats[r.admission_type] = (groupStats[r.admission_type] || 0) + 1;
});
console.log('\n=== 군별 분포 ===');
Object.entries(groupStats).forEach(([g, c]) => console.log(`${g}: ${c}개`));

// 5. 대학명 매핑
console.log('\n=== 대학명 매핑 (처음 30개) ===');
Object.entries(univStats)
  .slice(0, 30)
  .forEach(([norm, info]) => {
    console.log(`${info.original} → "${norm}" (${info.count}개)`);
  });
