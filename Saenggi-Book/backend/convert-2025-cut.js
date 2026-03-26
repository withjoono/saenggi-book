const XLSX = require('xlsx');
const path = require('path');

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
    .replace(/\s+/g, '')
    .trim();
}

// 데이터 파싱
const records = [];
let currentUniv = '';
let currentUnivNormalized = '';

for (let i = 8; i < data.length; i++) {
  const row = data[i];

  // 대학명 감지
  if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
    currentUniv = row[1];
    currentUnivNormalized = normalizeUniversityName(row[1]);
    continue;
  }

  // 모집단위 데이터
  if (row[3] && currentUniv && typeof row[3] === 'string') {
    const group = row[2] || ''; // 군 (가/나/다)

    // 숫자 데이터 파싱
    const initialQuota = parseFloat(row[4]) || null;
    const transferQuota = parseFloat(row[5]) || null;
    const finalQuota = parseFloat(row[6]) || null;
    const competitionRate = parseFloat(row[7]) || null;
    const additionalRank = row[8] === '-' ? null : (parseInt(row[8]) || null);
    const score50 = parseFloat(row[9]) || null;
    const score70 = parseFloat(row[10]) || null;
    const totalScore = parseFloat(row[11]) || null;

    // 백분위 데이터 (50% 학생)
    const kor50 = parseFloat(row[12]) || null;
    const math50 = parseFloat(row[13]) || null;
    const research1_50 = parseFloat(row[14]) || null;
    const research2_50 = parseFloat(row[15]) || null;
    const eng50 = parseFloat(row[16]) || null;
    const history50 = parseFloat(row[17]) || null;

    // 백분위 데이터 (70% 학생)
    const kor70 = parseFloat(row[18]) || null;
    const math70 = parseFloat(row[19]) || null;
    const research1_70 = parseFloat(row[20]) || null;
    const research2_70 = parseFloat(row[21]) || null;
    const eng70 = parseFloat(row[22]) || null;
    const history70 = parseFloat(row[23]) || null;

    // 수학 선택과목 비율
    const mathProbStat = parseFloat(row[24]) || null;
    const mathCalculus = parseFloat(row[25]) || null;
    const mathGeometry = parseFloat(row[26]) || null;

    records.push({
      // 매칭용 키
      university_original: currentUniv,
      university_normalized: currentUnivNormalized,
      admission_type: group,
      recruitment_name: row[3].trim(),

      // 2025년 컷 데이터
      year: 2025,
      recruitment_number: finalQuota,
      competition_ratio: competitionRate,
      min_cut: score50, // 50% cut을 min_cut으로
      max_cut: score70, // 70% cut을 max_cut으로
      additional_rank: additionalRank,
      total_score: totalScore,

      // 백분위 상세 (참고용)
      percentile_50: {
        korean: kor50,
        math: math50,
        research1: research1_50,
        research2: research2_50,
        english: eng50,
        history: history50
      },
      percentile_70: {
        korean: kor70,
        math: math70,
        research1: research1_70,
        research2: research2_70,
        english: eng70,
        history: history70
      },
      math_selection_ratio: {
        prob_stat: mathProbStat,
        calculus: mathCalculus,
        geometry: mathGeometry
      }
    });
  }
}

console.log('=== 2025 정시 컷 데이터 변환 ===');
console.log('총 레코드:', records.length);

// 대학별 통계
const univStats = {};
records.forEach(r => {
  if (!univStats[r.university_normalized]) {
    univStats[r.university_normalized] = { count: 0, original: r.university_original };
  }
  univStats[r.university_normalized].count++;
});
console.log('대학 수:', Object.keys(univStats).length);

// DB import용 간단한 형식으로 변환
const simpleRecords = records.map(r => ({
  // 매칭키 (대학명 + 군 + 모집단위)
  university: r.university_normalized,
  admission_type: r.admission_type,
  recruitment_name: r.recruitment_name,

  // 2025 컷 데이터
  year: 2025,
  min_cut: r.min_cut,
  max_cut: r.max_cut,
  competition_ratio: r.competition_ratio,
  recruitment_number: r.recruitment_number,
}));

// 1. JSON 파일로 저장
const fs = require('fs');
fs.writeFileSync(
  'uploads/2025-jungsi-cut-converted.json',
  JSON.stringify(simpleRecords, null, 2),
  'utf8'
);
console.log('\nJSON 저장: uploads/2025-jungsi-cut-converted.json');

// 2. 엑셀 파일로 저장 (DB import용)
const newWb = XLSX.utils.book_new();
const newWs = XLSX.utils.json_to_sheet(simpleRecords);
XLSX.utils.book_append_sheet(newWb, newWs, 'Sheet1');
XLSX.writeFile(newWb, 'uploads/2025-jungsi-cut-for-db.xlsx');
console.log('엑셀 저장: uploads/2025-jungsi-cut-for-db.xlsx');

// 3. 샘플 출력
console.log('\n=== 변환 결과 샘플 ===');
simpleRecords.slice(0, 10).forEach((r, i) => {
  console.log(`${i + 1}. ${r.university} | ${r.admission_type} | ${r.recruitment_name}`);
  console.log(`   → min_cut: ${r.min_cut}, max_cut: ${r.max_cut}, 경쟁률: ${r.competition_ratio}`);
});

// 4. 대학명 매핑 테이블 출력
console.log('\n=== 대학명 변환 매핑 (원본 → 정규화) ===');
Object.entries(univStats)
  .slice(0, 20)
  .forEach(([normalized, info]) => {
    console.log(`${info.original} → ${normalized} (${info.count}개 학과)`);
  });
