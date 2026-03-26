const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_NAME || 'geobukschool_dev',
});

async function main() {
  await client.connect();
  console.log('DB 연결 성공\n');

  // 인제, 전남대 score_calculation 값 확인
  const result = await client.query(`
    SELECT DISTINCT
      u.name as university_name,
      ra.score_calculation,
      ra.score_calculation_code,
      COUNT(*) as count
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.year = 2026
    AND (u.name LIKE '%인제%' OR u.name LIKE '%전남%')
    GROUP BY u.name, ra.score_calculation, ra.score_calculation_code
    ORDER BY u.name
  `);

  console.log('=== DB의 인제/전남대 score_calculation 값 ===');
  for (const row of result.rows) {
    console.log(`${row.university_name}: "${row.score_calculation}" (code: ${row.score_calculation_code}, count: ${row.count})`);
  }

  // score-calculation-codes.json과 비교
  const scoreCalcCodes = require('./src/modules/jungsi/calculation/data/score-calculation-codes.json');
  const nameToCode = scoreCalcCodes.nameToCode || {};

  console.log('\n=== nameToCode 매핑 확인 ===');
  for (const row of result.rows) {
    const dbValue = row.score_calculation;
    const hasMatch = nameToCode[dbValue] !== undefined;
    console.log(`"${dbValue}" → ${hasMatch ? '✓ 매핑됨: ' + nameToCode[dbValue] : '✗ 매핑 없음'}`);
  }

  await client.end();
}

main().catch(console.error);
