// 점수표에서 인제/전남대의 데이터 확인
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'dist/modules/jungsi/calculation/data');
const scoreTablePath = path.join(dataDir, 'score-table-26-jungsi.json');

console.log('점수표 경로:', scoreTablePath);
console.log('파일 존재:', fs.existsSync(scoreTablePath));

const scoreTable = JSON.parse(fs.readFileSync(scoreTablePath, 'utf-8'));

console.log('\n=== 점수표 과목 목록 ===');
const subjects = Object.keys(scoreTable);
console.log(`총 ${subjects.length}개 과목:`, subjects.join(', '));

// 수학 관련 과목 상세 확인
console.log('\n=== 수학 관련 과목 ===');
const mathSubjects = subjects.filter(s => s.includes('수학'));
mathSubjects.forEach(s => console.log(`  - ${s}`));

// 인제/전남대 점수 확인
const targetUnivs = ['인제글로컬', '인제의학', '인제통합', '전남농생', '전남물리', '전남의학', '전남인문'];

console.log('\n=== 인제/전남대 점수표 데이터 확인 ===');
for (const univ of targetUnivs) {
  console.log(`\n[${univ}]`);

  // 국어 확인
  const korData = scoreTable['국어'];
  if (korData && korData['130']) {
    const score = korData['130'][univ];
    console.log(`  국어(표준 130): ${score !== undefined ? score : '없음'}`);
  }

  // 수학(미적) 확인
  const mathData = scoreTable['수학(미적)'];
  if (mathData && mathData['135']) {
    const score = mathData['135'][univ];
    console.log(`  수학(미적)(표준 135): ${score !== undefined ? score : '없음'}`);
  }

  // 영어 확인
  const engData = scoreTable['영어'];
  if (engData && engData['1']) {
    const score = engData['1'][univ];
    console.log(`  영어(등급 1): ${score !== undefined ? score : '없음'}`);
  }

  // 물리학 Ⅰ 확인
  const phyData = scoreTable['물리학 Ⅰ'];
  if (phyData && phyData['65']) {
    const score = phyData['65'][univ];
    console.log(`  물리학 Ⅰ(표준 65): ${score !== undefined ? score : '없음'}`);
  }
}

// 점수표에 있는 대학 목록 중 인제/전남 확인
console.log('\n=== 점수표 내 대학 목록 (인제/전남 관련) ===');
const korData = scoreTable['국어'];
if (korData && korData['130']) {
  const univsInTable = Object.keys(korData['130']);
  const filtered = univsInTable.filter(u => u.includes('인제') || u.includes('전남'));
  console.log('찾은 대학:', filtered.length > 0 ? filtered.join(', ') : '없음');
  console.log('전체 대학 수:', univsInTable.length);
}
