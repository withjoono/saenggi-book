const XLSX = require('xlsx');
const wb = XLSX.readFile('uploads/26 정시 db 1209_fixed.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 알파벳 인덱스 변환 함수
function indexToCol(index) {
  let col = '';
  index++;
  while (index > 0) {
    let mod = (index - 1) % 26;
    col = String.fromCharCode(65 + mod) + col;
    index = Math.floor((index - 1) / 26);
  }
  return col;
}

console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    엑셀 컬럼 알파벳 ↔ 인덱스 매핑표                        ║');
console.log('╠═══════╤════════╤═══════════════════════════════════╤═══════════════════════╣');
console.log('║ Index │ Alpha  │ 헤더 (행0 or 행1)                 │ 샘플값 (가천대)       ║');
console.log('╠═══════╪════════╪═══════════════════════════════════╪═══════════════════════╣');

const header0 = rawData[0];
const header1 = rawData[1];
const dataRow = rawData[2];

// 전체 컬럼 출력 (0~110)
for (let i = 0; i <= 110; i++) {
  const alpha = indexToCol(i);
  let headerVal = header0[i] || header1[i] || '';
  headerVal = String(headerVal).replace(/\r\n/g, ' ').replace(/\n/g, ' ').substring(0, 30);
  let sampleVal = dataRow[i] !== undefined ? String(dataRow[i]).substring(0, 20) : '';

  console.log(`║ ${String(i).padStart(5)} │ ${alpha.padStart(6)} │ ${headerVal.padEnd(33)} │ ${sampleVal.padEnd(21)} ║`);
}

console.log('╚═══════╧════════╧═══════════════════════════════════╧═══════════════════════╝');

console.log('\n\n');
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    코드 매핑 vs 실제 엑셀 비교                              ║');
console.log('╠═══════════════════════════════════════════════════════════════════════════╣');

const codeMapping = {
  'A': { field: 'universityRegion', desc: '지역' },
  'B': { field: 'universityName', desc: '대학명' },
  'C': { field: 'admissionName', desc: '전형유형' },
  'D': { field: 'admissionType', desc: '모집군' },
  'E': { field: 'generalFieldName', desc: '계열' },
  'F': { field: 'detailedFields', desc: '상세계열' },
  'G': { field: 'recruitmentName', desc: '모집단위명' },
  'H': { field: 'recruitmentNumber', desc: '모집인원' },
  'I': { field: 'selection_method', desc: '선발방식' },
  'J': { field: 'csatRatio', desc: '수능비율' },
  'K': { field: 'schoolRecordRatio', desc: '학생부비율' },
  'L': { field: 'interviewRatio', desc: '면접비율' },
  'M': { field: 'otherRatio', desc: '기타비율' },
  'N': { field: 'csatElements', desc: '수능요소' },
  'O': { field: 'csatCombination', desc: '수능조합' },
  'P': { field: 'csatRequired', desc: '필수' },
  'R': { field: 'researchSubjectCount', desc: '탐구과목수' },
  'S': { field: 'korean_reflection_score', desc: '국어반영비율' },
  'T': { field: 'math_reflection_score', desc: '수학반영비율' },
  'U': { field: 'english_reflection_score', desc: '영어반영비율' },
  'V': { field: 'research_reflection_score', desc: '탐구반영비율' },
  'W': { field: 'korean_history_reflection_score', desc: '한국사반영비율' },
  'X': { field: 'second_foreign_language_reflection_score', desc: '제2외반영비율' },
  'Y': { field: 'korean_elective_subject', desc: '국어선택과목' },
  'Z': { field: 'math_elective_subject', desc: '수학선택과목' },
  'CD': { field: 'scoreCalculation', desc: '점수환산' },
  'CE': { field: 'totalScore', desc: '환산점수총점' },
  'CG': { field: 'universityCode', desc: '대학코드 (코드에서 사용)' },
};

function colToIndex(col) {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 64);
  }
  return index - 1;
}

console.log('║                                                                           ║');
for (const [alpha, info] of Object.entries(codeMapping)) {
  const idx = colToIndex(alpha);
  const actualHeader = header0[idx] || header1[idx] || '(없음)';
  const actualHeaderClean = String(actualHeader).replace(/\r\n/g, ' ').replace(/\n/g, ' ').substring(0, 15);
  const actualValue = dataRow[idx] !== undefined ? String(dataRow[idx]).substring(0, 15) : '(없음)';

  const match = actualHeaderClean.includes(info.desc.substring(0, 3)) ? '✓' : '✗';

  console.log(`║ ${alpha.padEnd(3)} (${String(idx).padStart(3)}) │ 코드: ${info.desc.padEnd(15)} │ 실제헤더: ${actualHeaderClean.padEnd(15)} │ 값: ${actualValue.padEnd(15)} ${match} ║`);
}
console.log('║                                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝');

console.log('\n\n');
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    대학코드 위치 상세 분석                                  ║');
console.log('╠═══════════════════════════════════════════════════════════════════════════╣');
console.log('║ 코드에서 사용: CG (인덱스 84)                                              ║');
console.log('║ 실제 대학코드 컬럼 위치 찾기:                                              ║');
console.log('╠═══════════════════════════════════════════════════════════════════════════╣');

for (let i = 80; i <= 95; i++) {
  const alpha = indexToCol(i);
  const h0 = header0[i] ? String(header0[i]).replace(/\r\n/g, ' ') : '';
  const h1 = header1[i] ? String(header1[i]).replace(/\r\n/g, ' ') : '';
  const val = dataRow[i] !== undefined ? String(dataRow[i]) : '';

  const isCodeColumn = h1.includes('대학코드') || (val.startsWith && val.startsWith('U'));
  const marker = isCodeColumn ? ' ← 대학코드!' : '';

  console.log(`║ ${alpha} (${i}): 행0="${h0.substring(0,10)}" 행1="${h1.substring(0,15)}" 값="${val.substring(0,10)}"${marker}`);
}
console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
