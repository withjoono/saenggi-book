/**
 * Debug script to check what score_calculation values exist in DB
 * and compare with expected keys in 학교조건2026
 */
const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

// Import the score-calculation-codes to see expected format
const scoreCalcCodes = require('./src/modules/jungsi/calculation/data/score-calculation-codes.json');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  await client.connect();
  console.log('DB 연결 성공\n');

  // Get unique score_calculation values from DB
  const result = await client.query(`
    SELECT DISTINCT
      u.name as university_name,
      ra.score_calculation,
      ra.score_calculation_code
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.year = 2026
    AND ra.score_calculation IS NOT NULL
    ORDER BY u.name
  `);

  console.log('=== DB의 score_calculation 값 분석 ===\n');

  // Check which values match the expected nameToCode keys
  const nameToCode = scoreCalcCodes.nameToCode || {};
  const expectedKeys = new Set(Object.keys(nameToCode));

  let matchCount = 0;
  let mismatchCount = 0;
  const mismatches = [];

  // 충북, 나사렛, 남부, 김천 관련 항목만 필터링
  const targetUnivs = ['충북', '나사렛', '남부', '김천'];

  console.log('=== 문제 대학 분석 ===\n');
  for (const row of result.rows) {
    const isTarget = targetUnivs.some(target => row.university_name.includes(target));
    if (isTarget) {
      const dbValue = row.score_calculation;
      const hasMatch = expectedKeys.has(dbValue);
      console.log(`대학: ${row.university_name}`);
      console.log(`  DB score_calculation: "${dbValue}"`);
      console.log(`  DB score_calculation_code: "${row.score_calculation_code}"`);
      console.log(`  nameToCode 매칭: ${hasMatch ? '✓ 일치' : '✗ 불일치'}`);
      if (!hasMatch) {
        // Try to find similar keys
        const similar = Object.keys(nameToCode).filter(k =>
          k.includes(row.university_name.substring(0, 2)) ||
          dbValue?.includes(k)
        );
        console.log(`  유사 키: ${similar.join(', ') || '없음'}`);
      }
      console.log('');
    }
  }

  // Count overall matches/mismatches
  for (const row of result.rows) {
    if (expectedKeys.has(row.score_calculation)) {
      matchCount++;
    } else {
      mismatchCount++;
      if (mismatches.length < 30) {
        mismatches.push({
          university: row.university_name,
          dbValue: row.score_calculation,
          code: row.score_calculation_code
        });
      }
    }
  }

  console.log('\n=== 전체 통계 ===');
  console.log(`총 레코드: ${result.rows.length}`);
  console.log(`매칭 성공: ${matchCount}`);
  console.log(`매칭 실패: ${mismatchCount}`);

  if (mismatches.length > 0) {
    console.log('\n=== 처음 30개 불일치 항목 ===');
    mismatches.forEach((m, i) => {
      console.log(`${i + 1}. ${m.university}: "${m.dbValue}" (code: ${m.code})`);
    });
  }

  await client.end();
}

main().catch(console.error);
