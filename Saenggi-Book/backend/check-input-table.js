const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Connected\n');

    // jungsi, input, score 관련 테이블 확인
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE '%jungsi%' OR table_name LIKE '%input%' OR table_name LIKE '%mockexam%')
      ORDER BY table_name
    `);

    console.log('=== 관련 테이블 ===');
    for (const row of result.rows) {
      console.log('  -', row.table_name);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
