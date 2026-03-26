/**
 * DB 테이블 목록 확인
 */
const { Client } = require('pg');

const client = new Client({
  host: '34.64.165.158',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  console.log('✅ DB 연결 성공\n');

  // 모든 테이블 목록
  console.log('=== ts_ 로 시작하는 모든 테이블 ===');
  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE 'ts_%'
    ORDER BY table_name
  `);
  tablesResult.rows.forEach(row => {
    console.log('  ' + row.table_name);
  });

  // calculated 관련 테이블
  console.log('\n=== calculated 관련 테이블 ===');
  const calcTablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%calculated%'
  `);
  calcTablesResult.rows.forEach(row => {
    console.log('  ' + row.table_name);
  });

  // jungsi 관련 테이블
  console.log('\n=== jungsi/정시 관련 테이블 ===');
  const jungsiTablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%jungsi%' OR table_name LIKE '%regular%')
  `);
  jungsiTablesResult.rows.forEach(row => {
    console.log('  ' + row.table_name);
  });

  await client.end();
}

check().catch(console.error);
