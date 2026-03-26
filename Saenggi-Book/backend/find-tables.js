const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function findTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  await client.connect();
  
  // 정시 관련 테이블 찾기
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (
      table_name LIKE '%regular%' 
      OR table_name LIKE '%jungsi%'
      OR table_name LIKE '%정시%'
      OR table_name LIKE '%admission%'
      OR table_name LIKE '%score%'
    )
    ORDER BY table_name
  `);
  
  console.log('=== 정시/입학/점수 관련 테이블 ===');
  console.table(tables.rows);

  // 각 테이블의 row 개수 확인
  for (const row of tables.rows) {
    const count = await client.query(`SELECT COUNT(*) as count FROM "${row.table_name}"`);
    console.log(`${row.table_name}: ${count.rows[0].count}개`);
  }

  await client.end();
}

findTables().catch(console.error);
