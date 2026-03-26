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

// 정규화 함수
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
    .replace(/\(.*\)$/g, '') // 괄호 내용 제거
    .replace(/전공$/g, '학과') // 전공 → 학과
    .trim();
}

// 키워드 기반 상세계열 매핑 규칙
const keywordRules = [
  // 의약계열
  { keywords: ['의예', '의학과', '의과대학'], detail: '의예' },
  { keywords: ['치의예', '치의학', '치과대학'], detail: '치의예' },
  { keywords: ['한의예', '한의학', '한방'], detail: '한의예' },
  { keywords: ['약학', '약대', '제약'], detail: '약학' },
  { keywords: ['수의예', '수의학'], detail: '수의예' },
  { keywords: ['간호'], detail: '간호' },

  // 교육계열
  { keywords: ['초등교육', '교육대학교'], detail: '초등교육' },
  { keywords: ['유아교육', '아동교육', '특수교육'], detail: '유아•특수교육' },
  { keywords: ['교육학', '사범', '교원'], detail: '사범계' },

  // 공학계열
  { keywords: ['컴퓨터', '소프트웨어', 'SW', 'AI', '인공지능', '정보통신', 'ICT', '데이터', '사이버보안', '정보보호'], detail: '전기•전자•컴퓨터•통신' },
  { keywords: ['전기', '전자', '반도체', '제어'], detail: '전기•전자•컴퓨터•통신' },
  { keywords: ['기계', '자동차', '항공', '조선', '로봇', '모빌리티', '드론', '무인항공'], detail: '기계•자동차•철도•항공•조선' },
  { keywords: ['건축', '토목', '건설', '도시', '소방', '안전', '교통'], detail: '건설•토목•안전' },
  { keywords: ['화학공학', '화공', '에너지', '신소재', '재료', '배터리', '고분자'], detail: '신소재•화공•에너지' },

  // 자연과학계열
  { keywords: ['물리', '화학과', '생명과학', '생물학', '천문', '지구과학', '분자생명'], detail: '물리•화학•생명•천문' },
  { keywords: ['수학', '통계', '빅데이터'], detail: '수학•통계' },
  { keywords: ['생명공학', '바이오', '의생명', '의과학', '보건', '헬스케어', '임상', '의료'], detail: '생명공•의과학•보건' },
  { keywords: ['농업', '원예', '축산', '동물', '산림', '수산', '해양', '환경', '생태', '조경', '식물'], detail: '농림•수산•환경' },
  { keywords: ['식품', '영양', '의류', '주거', '가정', '소비자'], detail: '생활과학' },

  // 인문사회계열
  { keywords: ['경영', '무역', '국제통상', '글로벌비즈니스'], detail: '경영•경제•무역' },
  { keywords: ['경제', '금융', '재무', '회계', '세무', '파이낸스'], detail: '금융•회계•세무' },
  { keywords: ['법학', '법과', '법률', '행정', '정치', '외교', '공공'], detail: '법•정치•행정' },
  { keywords: ['사회', '언론', '미디어', '신문', '방송', '홍보', '광고', '커뮤니케이션'], detail: '사회•언론•매체' },
  { keywords: ['관광', '호텔', '외식', '조리', '서비스'], detail: '관광•서비스' },
  { keywords: ['사회복지', '복지', '아동', '가족', '상담'], detail: '복지•아동•가족' },
  { keywords: ['국어', '영어', '중국어', '일본어', '불어', '독어', '문학', '어문', '인문', '철학', '역사', '사학', '종교', '신학'], detail: '어문•인문학' },

  // 예체능계열
  { keywords: ['미술', '회화', '조소', '조형', '공예', '도예'], detail: '미술•조형•공예' },
  { keywords: ['디자인', '패션', '의상', '뷰티', '미용'], detail: '디자인•의류•뷰티' },
  { keywords: ['음악', '성악', '작곡', '피아노', '관현악', '실용음악'], detail: '연극•영화•방송' },
  { keywords: ['연극', '영화', '영상', '방송', '연기', '공연'], detail: '연극•영화•방송' },
  { keywords: ['체육', '스포츠', '태권도', '무용', '댄스'], detail: '무용•체육' },
  { keywords: ['만화', '애니메이션', '게임', 'CG', '콘텐츠'], detail: '사진•만화•게임' },

  // 자유전공
  { keywords: ['자유전공', '자율전공', '융합전공'], detail: '자유전공' },
];

// 키워드로 상세계열 추론
function inferDetailByKeyword(unitName) {
  if (!unitName) return null;
  const normalized = unitName.toLowerCase();

  for (const rule of keywordRules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return rule.detail;
      }
    }
  }
  return null;
}

// 헤더와 서브헤더 보존
const headers = rawData.slice(0, 2);
const dataRows = rawData.slice(2);

// 기존 데이터에서 매핑 테이블 생성
const mapping = {};
dataRows.forEach(r => {
  const unit = normalizeUnit(r[COL.모집단위명]);
  const detail = r[COL.상세계열];
  if (unit && detail) {
    if (!mapping[unit]) {
      mapping[unit] = new Set();
    }
    mapping[unit].add(detail);
  }
});

// 통계
let autoMapped = 0;
let keywordMapped = 0;
let ambiguous = 0;
let stillNull = 0;

// 데이터 처리
const processedRows = dataRows.map(row => {
  const newRow = [...row];

  // 이미 상세계열이 있으면 스킵
  if (newRow[COL.상세계열] && newRow[COL.상세계열] !== '') {
    return newRow;
  }

  const origUnit = row[COL.모집단위명];
  const normUnit = normalizeUnit(origUnit);

  // 1. 기존 매핑에서 1:1 매핑 찾기
  if (mapping[normUnit] && mapping[normUnit].size === 1) {
    newRow[COL.상세계열] = [...mapping[normUnit]][0];
    autoMapped++;
    return newRow;
  }

  // 2. 1:N 매핑 (모호) - 첫 번째 값 사용하고 표시
  if (mapping[normUnit] && mapping[normUnit].size > 1) {
    const options = [...mapping[normUnit]];
    newRow[COL.상세계열] = `[확인필요] ${options[0]}`; // 첫 번째 옵션 + 표시
    ambiguous++;
    return newRow;
  }

  // 3. 키워드 기반 추론
  const inferred = inferDetailByKeyword(origUnit);
  if (inferred) {
    newRow[COL.상세계열] = `[추론] ${inferred}`;
    keywordMapped++;
    return newRow;
  }

  // 4. 여전히 매핑 불가
  newRow[COL.상세계열] = '[수동입력필요]';
  stillNull++;
  return newRow;
});

// 결과 출력
console.log('=== 처리 결과 ===');
console.log('자동 매핑 (1:1):', autoMapped);
console.log('키워드 추론:', keywordMapped);
console.log('모호 (확인필요):', ambiguous);
console.log('수동 입력 필요:', stillNull);
console.log('총:', autoMapped + keywordMapped + ambiguous + stillNull);

// 새 워크북 생성
const newData = [...headers, ...processedRows];
const newSheet = XLSX.utils.aoa_to_sheet(newData);

// 새 워크북
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newSheet, 'Sheet1');

// 저장
const outputPath = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209_상세계열채움.xlsx';
XLSX.writeFile(newWb, outputPath);

console.log('\n=== 저장 완료 ===');
console.log('파일:', outputPath);

// 수동 입력 필요한 목록 출력
console.log('\n=== [수동입력필요] 목록 (샘플 50개) ===');
let count = 0;
processedRows.forEach(r => {
  if (r[COL.상세계열] === '[수동입력필요]' && count < 50) {
    console.log(`  ${r[COL.대학명]} | ${r[COL.모집단위명]}`);
    count++;
  }
});

// 확인 필요 목록
console.log('\n=== [확인필요] 목록 ===');
const ambiguousSet = new Set();
processedRows.forEach(r => {
  if (r[COL.상세계열] && r[COL.상세계열].startsWith('[확인필요]')) {
    const unit = r[COL.모집단위명];
    if (!ambiguousSet.has(unit)) {
      ambiguousSet.add(unit);
      const options = mapping[normalizeUnit(unit)] ? [...mapping[normalizeUnit(unit)]].join(' | ') : '';
      console.log(`  ${unit} → 가능한 값: ${options}`);
    }
  }
});
