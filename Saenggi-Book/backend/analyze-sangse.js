const XLSX = require('xlsx');
const path = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209.xlsx';
const wb = XLSX.readFile(path);

const sheet = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 컬럼 인덱스
const COL = {
  지역: 0,
  대학명: 1,
  전형유형: 2,
  모집군: 3,
  계열: 4,
  상세계열: 5,
  모집단위명: 6,
};

// [지역], [인문], [자연] 등 접미사 제거 함수
function normalizeUnit(name) {
  if (!name) return name;
  return name
    .replace(/\[지역\]/g, '')
    .replace(/\[인문\]/g, '')
    .replace(/\[자연\]/g, '')
    .replace(/\/인문$/g, '')
    .replace(/\/자연$/g, '')
    .replace(/\(인문\)$/g, '')
    .replace(/\(자연\)$/g, '')
    .trim();
}

// 데이터 행 (Row 2부터)
const dataRows = rawData.slice(2);

// 상세계열 현황
const nullRows = dataRows.filter(r => !r[COL.상세계열] || r[COL.상세계열] === '');
const filledRows = dataRows.filter(r => r[COL.상세계열] && r[COL.상세계열] !== '');

console.log('=== [지역] 접미사 제거 후 재분석 ===\n');

// 정규화된 모집단위명 → 상세계열 매핑 생성
const mapping = {};
filledRows.forEach(r => {
  const unit = normalizeUnit(r[COL.모집단위명]);
  const detail = r[COL.상세계열];
  if (unit && detail) {
    if (!mapping[unit]) {
      mapping[unit] = new Set();
    }
    mapping[unit].add(detail);
  }
});

console.log('정규화된 고유 모집단위:', Object.keys(mapping).length);

// 매핑 분석
const oneToOne = Object.entries(mapping).filter(([k, v]) => v.size === 1);
const oneToMany = Object.entries(mapping).filter(([k, v]) => v.size > 1);

console.log('1:1 매핑:', oneToOne.length);
console.log('1:N 매핑:', oneToMany.length);

// NULL인 행 재분석
let canMap = 0;
let ambiguous = 0;
let cannotMap = 0;

const unmappedUnits = new Set();

nullRows.forEach(r => {
  const origUnit = r[COL.모집단위명];
  const normUnit = normalizeUnit(origUnit);

  if (mapping[normUnit]) {
    if (mapping[normUnit].size === 1) {
      canMap++;
    } else {
      ambiguous++;
    }
  } else {
    cannotMap++;
    unmappedUnits.add(`${r[COL.대학명]} | ${origUnit}`);
  }
});

console.log('\n=== 정규화 후 NULL 행 매핑 가능 여부 ===');
console.log('명확하게 매핑 가능 (1:1):', canMap);
console.log('모호함 (1:N):', ambiguous);
console.log('여전히 매핑 불가:', cannotMap);
console.log('매핑 불가 고유 모집단위:', unmappedUnits.size);

// 매핑 불가 목록
if (unmappedUnits.size > 0) {
  console.log('\n=== 매핑 불가 목록 (대학 | 모집단위) ===');
  [...unmappedUnits].sort().slice(0, 80).forEach(u => console.log(`  - ${u}`));
  if (unmappedUnits.size > 80) {
    console.log(`  ... 외 ${unmappedUnits.size - 80}개`);
  }
}

// 1:N 매핑 상세
if (oneToMany.length > 0) {
  console.log('\n=== 1:N 매핑 (수동 결정 필요) ===');
  oneToMany.forEach(([unit, details]) => {
    console.log(`  ${unit} → ${[...details].join(' | ')}`);
  });
}

// 통계 요약
console.log('\n=== 결론 ===');
console.log(`총 NULL 행: ${nullRows.length}`);
console.log(`자동 매핑 가능: ${canMap} (${(canMap/nullRows.length*100).toFixed(1)}%)`);
console.log(`수동 결정 필요 (1:N): ${ambiguous} (${(ambiguous/nullRows.length*100).toFixed(1)}%)`);
console.log(`완전히 새로운 모집단위: ${cannotMap} (${(cannotMap/nullRows.length*100).toFixed(1)}%)`);
