const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkMigrations() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // migrations 테이블 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ migrations 테이블이 없습니다.');
      return;
    }

    // 실행된 마이그레이션 목록
    console.log('=== 실행된 마이그레이션 ===\n');
    const result = await client.query(`
      SELECT id, timestamp, name
      FROM migrations
      ORDER BY timestamp DESC
      LIMIT 20
    `);

    for (const row of result.rows) {
      console.log(row.timestamp + ' | ' + row.name);
    }

    // calculated_scores 관련 마이그레이션 확인
    console.log('\n\n=== calculated_scores 관련 마이그레이션 ===');
    const calcResult = await client.query(`
      SELECT id, timestamp, name
      FROM migrations
      WHERE name LIKE '%calculated%' OR name LIKE '%Calculated%'
      ORDER BY timestamp DESC
    `);

    if (calcResult.rows.length === 0) {
      console.log('⚠️ calculated_scores 관련 마이그레이션이 없습니다.');
    } else {
      for (const row of calcResult.rows) {
        console.log(row.timestamp + ' | ' + row.name);
      }
    }

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkMigrations();
