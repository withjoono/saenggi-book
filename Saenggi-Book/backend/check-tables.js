const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  await client.connect();
  console.log('DB 연결 성공');

  const result = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log('테이블 목록:');
  result.rows.forEach(row => console.log('  -', row.table_name));
  console.log('총', result.rows.length, '개 테이블');

  await client.end();
}

checkTables().catch(console.error);
