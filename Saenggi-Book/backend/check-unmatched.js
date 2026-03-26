const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });
  await client.connect();

  // 강원대 관련 대학 조회
  const result = await client.query(`
    SELECT DISTINCT u.name
    FROM ts_universities u
    WHERE u.name LIKE '%강원%'
  `);
  console.log('=== 강원 관련 대학명 ===');
  result.rows.forEach(r => console.log(r.name));

  // 고려대 전형명 조회
  const result2 = await client.query(`
    SELECT COUNT(*) as cnt, ra.admission_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name = '고려대학교' AND ra.year = 2026
    GROUP BY ra.admission_name
  `);
  console.log('\n=== 고려대 전형명 ===');
  result2.rows.forEach(r => console.log(r.admission_name + ': ' + r.cnt + '개'));

  // 고려대 모집단위 샘플
  const result3 = await client.query(`
    SELECT ra.recruitment_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name = '고려대학교' AND ra.year = 2026
    LIMIT 20
  `);
  console.log('\n=== 고려대 모집단위 샘플 ===');
  result3.rows.forEach(r => console.log(r.recruitment_name));

  await client.end();
}
main();
