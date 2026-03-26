const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function checkData() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  await client.connect();
  
  // 샘플 데이터 확인 (총점, 최초컷, 추합컷)
  const result = await client.query(`
    SELECT 
      ra.id,
      u.name as university_name,
      ra.recruitment_name,
      ra.admission_type,
      ra.total_score,
      ra.min_cut,
      ra.max_cut,
      ra.year
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.year = 2026
    ORDER BY u.name, ra.recruitment_name
    LIMIT 20
  `);
  
  console.log('=== ts_regular_admissions 샘플 데이터 (2026년) ===');
  console.table(result.rows);
  
  await client.end();
}

checkData().catch(console.error);
