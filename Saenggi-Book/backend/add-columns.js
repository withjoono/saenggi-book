const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function addColumns() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  await client.connect();
  
  const queries = [
    `ALTER TABLE ts_regular_admission_previous_results 
     ADD COLUMN IF NOT EXISTS additional_pass_rank INTEGER`,
    `ALTER TABLE ts_regular_admission_previous_results 
     ADD COLUMN IF NOT EXISTS converted_score_total DECIMAL(10,5)`,
    `ALTER TABLE ts_regular_admission_previous_results 
     ADD COLUMN IF NOT EXISTS percentile_50 DECIMAL(10,5)`,
    `ALTER TABLE ts_regular_admission_previous_results 
     ADD COLUMN IF NOT EXISTS percentile_70 DECIMAL(10,5)`,
  ];

  for (const query of queries) {
    try {
      await client.query(query);
      console.log('✅ Query executed:', query.split('\n')[1].trim());
    } catch (err) {
      console.log('⚠️ Error:', err.message);
    }
  }

  // 확인
  const result = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'ts_regular_admission_previous_results'
    ORDER BY ordinal_position
  `);
  
  console.log('\n=== 현재 컬럼 목록 ===');
  console.table(result.rows);

  await client.end();
}

addColumns().catch(console.error);
