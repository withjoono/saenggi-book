/**
 * Direct test of calculation to debug why universities are failing
 */
const path = require('path');
const fs = require('fs');

// Manually load the required data
const dataPath = path.join(__dirname, 'dist', 'modules', 'jungsi', 'calculation', 'data');
const srcDataPath = path.join(__dirname, 'src', 'modules', 'jungsi', 'calculation', 'data');

console.log('Checking data file locations...\n');
console.log('dist path:', dataPath);
console.log('src path:', srcDataPath);

// Try both paths
let scoreTable;
let scoreCalcCodes;

try {
  scoreTable = JSON.parse(fs.readFileSync(path.join(dataPath, 'score-table-26-jungsi.json'), 'utf8'));
  console.log('Loaded score-table from dist folder ✓');
} catch (e) {
  try {
    scoreTable = JSON.parse(fs.readFileSync(path.join(srcDataPath, 'score-table-26-jungsi.json'), 'utf8'));
    console.log('Loaded score-table from src folder ✓');
  } catch (e2) {
    console.log('Failed to load score-table:', e.message);
    process.exit(1);
  }
}

try {
  scoreCalcCodes = JSON.parse(fs.readFileSync(path.join(dataPath, 'score-calculation-codes.json'), 'utf8'));
  console.log('Loaded score-calculation-codes from dist folder ✓');
} catch (e) {
  try {
    scoreCalcCodes = JSON.parse(fs.readFileSync(path.join(srcDataPath, 'score-calculation-codes.json'), 'utf8'));
    console.log('Loaded score-calculation-codes from src folder ✓');
  } catch (e2) {
    console.log('Failed to load score-calculation-codes:', e.message);
    process.exit(1);
  }
}

console.log('\n=== 점수표 구조 확인 ===');
const subjects = Object.keys(scoreTable);
console.log('과목 수:', subjects.length);
console.log('과목 목록:', subjects.slice(0, 10).join(', '), '...');

// Check if 충북공학 exists in the score table
const 국어Data = scoreTable['국어'];
if (국어Data) {
  const sampleScore = Object.keys(국어Data)[0];
  const schoolData = 국어Data[sampleScore];
  console.log('\n샘플 점수:', sampleScore);
  console.log('해당 점수의 학교 수:', Object.keys(schoolData).length);

  // Check 충북 schools
  const 충북Schools = Object.keys(schoolData).filter(k => k.includes('충북'));
  console.log('충북 관련 학교:', 충북Schools.join(', ') || '없음');

  // Check specific school values
  const testSchools = ['충북공학', '충북농생', '충북의학', '충북인문', '나사렛중특', '나사렛통합', '남부간호', '김천간호'];
  console.log('\n=== 테스트 대상 학교 점수표 확인 ===');
  testSchools.forEach(school => {
    const value = schoolData[school];
    console.log(`${school}: ${value !== undefined ? value : '없음'}`);
  });
}

// Check the calc-2026 module if possible
console.log('\n=== 학교조건2026 확인 ===');
try {
  // Try to import the compiled JS module
  const calcPath = path.join(__dirname, 'dist', 'modules', 'jungsi', 'calculation', 'calculations', 'calc-2026.js');
  if (fs.existsSync(calcPath)) {
    console.log('calc-2026.js exists in dist folder');
    // Read file content to check for school conditions
    const content = fs.readFileSync(calcPath, 'utf8');
    const testSchools = ['충북공학', '충북농생', '충북의학', '충북인문'];
    testSchools.forEach(school => {
      const regex = new RegExp(`["']${school}["']\\s*:\\s*\\{`);
      const exists = regex.test(content);
      console.log(`${school} in 학교조건2026: ${exists ? '✓' : '✗'}`);
    });
  } else {
    console.log('calc-2026.js NOT found in dist folder');
  }
} catch (e) {
  console.log('Error checking calc-2026:', e.message);
}
