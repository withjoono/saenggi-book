const XLSX = require('xlsx');

// 2024 정시 입결 데이터 읽기
const wb = XLSX.readFile('uploads/2024 정시 입결.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== 2024 정시 입결 변환 ===');
console.log('원본 행 수:', data.length);

// 값 파싱 헬퍼
const parseVal = (val) => {
  if (val === null || val === undefined || val === '' || val === '-') return null;
  // "8.8 :1" 같은 경쟁률 형식 처리
  if (typeof val === 'string' && val.includes(':1')) {
    val = val.replace(/\s*:1\s*/, '').trim();
  }
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

// 대학명 추출 (============= 대학명 번호 ===========)
function extractUnivName(str) {
  if (!str) return null;
  const match = String(str).match(/={3,}\s*(.+?)\s+\d+\s*={3,}/);
  return match ? match[1].trim() : null;
}

// 결과 데이터 생성
const results = [];
let currentUniv = '';
let currentGroup = '';

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;

  // 대학명 감지
  const univName = extractUnivName(row[0]);
  if (univName) {
    currentUniv = univName;
    currentGroup = '';
    continue;
  }

  // 헤더 행 스킵
  if (row[0] === '구분' || row[0] === 'A' ||
      String(row[0] || '').includes('□') ||
      String(row[2] || '') === '인원' ||
      String(row[4] || '').includes('합격') ||
      String(row[4] || '').includes('순위') ||
      String(row[5] || '').includes('70% cut') ||
      String(row[5] || '').includes('환산') && !parseVal(row[5])) {
    continue;
  }

  // 군 업데이트
  if (row[0] && typeof row[0] === 'string') {
    const groupMatch = row[0].match(/[가나다]/);
    if (groupMatch) {
      currentGroup = groupMatch[0] + '군';
    }
  }

  // 모집단위 데이터
  if (!currentUniv) continue;

  const deptName = row[1];
  if (!deptName || typeof deptName !== 'string') continue;
  if (deptName.includes('모집단위')) continue;

  // 데이터 추출
  const quota = parseVal(row[2]);
  const competition = parseVal(row[3]);
  const addRank = parseVal(row[4]);
  const cut70 = parseVal(row[5]);  // 환산점수 70%컷
  const totalScore = parseVal(row[6]);  // 총점(수능)
  const percentile70 = parseVal(row[7]);  // 백분위 70% 평균

  // 유효한 데이터가 있으면 추가
  if (quota !== null || competition !== null || cut70 !== null) {
    results.push({
      university: currentUniv,
      group: currentGroup,
      dept: deptName.trim(),
      quota,
      competition,
      addRank,
      cut50: null,  // 2024 데이터에 없음
      cut70,
      totalScore,
      // 백분위 과목별 데이터 없음
      kor50: null, math50: null, res1_50: null, res2_50: null, eng50: null, hist50: null, avg50: null,
      kor70: null, math70: null, res1_70: null, res2_70: null, eng70: null, hist70: null, avg70: percentile70,
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

  // 데이터 행
  for (const r of records) {
    allData.push([
      r.group || '',
      r.dept,
      r.quota,
      r.competition,
      r.addRank,
      r.cut50,  // 50%컷 없음
      r.cut70,
      r.totalScore,
      r.kor50, r.math50, r.res1_50, r.res2_50, r.eng50, r.hist50, r.avg50,
      r.kor70, r.math70, r.res1_70, r.res2_70, r.eng70, r.hist70, r.avg70
    ]);
  }
}

const allWs = XLSX.utils.aoa_to_sheet(allData);
XLSX.utils.book_append_sheet(newWb, allWs, '2024_전체');

// 파일 저장
XLSX.writeFile(newWb, 'uploads/2024정시-실제컷-정리.xlsx');
console.log('\n저장 완료: uploads/2024정시-실제컷-정리.xlsx');

// 샘플 출력
console.log('\n=== 샘플 데이터 ===');
let count = 0;
for (const r of results) {
  if (count < 10) {
    console.log(`${count + 1}. ${r.university} | ${r.group} | ${r.dept}`);
    console.log(`   정원:${r.quota} 경쟁률:${r.competition} 충원순위:${r.addRank}`);
    console.log(`   환산70%:${r.cut70} 총점:${r.totalScore} 백분위70%:${r.avg70}`);
    count++;
  }
}
