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
    console.log('✅ 운영 DB 연결 성공\n');

    // member 관련 테이블 확인
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE '%member%' OR table_name LIKE '%calculated%' OR table_name LIKE '%jungsi%')
      ORDER BY table_name
    `);

    console.log('=== member/calculated/jungsi 관련 테이블 ===');
    for (const row of result.rows) {
      console.log('  -', row.table_name);
    }

    // 모든 테이블 수
    const countResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('\n전체 테이블 수:', countResult.rows[0].count);

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
