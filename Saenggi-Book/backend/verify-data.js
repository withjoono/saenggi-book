const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function verifyData() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  await client.connect();
  
  // 연도별 데이터 개수 확인
  const yearCount = await client.query(`
    SELECT year, COUNT(*) as count
    FROM ts_regular_admissions
    GROUP BY year
    ORDER BY year DESC
  `);
  
  console.log('=== 연도별 데이터 개수 ===');
  console.table(yearCount.rows);
  
  // 2026년 샘플 데이터
  const result = await client.query(`
    SELECT 
      ra.id,
      u.name as university_name,
      ra.recruitment_name,
      ra.admission_type,
      ra.total_score,
      ra.min_cut,
      ra.max_cut
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.year = 2026
    ORDER BY u.name, ra.recruitment_name
    LIMIT 15
  `);
  
  console.log('\n=== 2026년 샘플 데이터 ===');
  console.table(result.rows);

  await client.end();
}

verifyData().catch(console.error);
