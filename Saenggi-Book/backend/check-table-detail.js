const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkTableDetail() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // ts_member_jungsi_calculated_scores 테이블의 상세 정보
    console.log('=== ts_member_jungsi_calculated_scores 테이블 상세 ===\n');
    const result = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'ts_member_jungsi_calculated_scores'
      ORDER BY ordinal_position
    `);

    console.log('컬럼명'.padEnd(25) + ' | ' + '타입'.padEnd(20) + ' | ' + 'NULL가능');
    console.log('-'.repeat(65));
    for (const row of result.rows) {
      console.log(row.column_name.padEnd(25) + ' | ' + row.data_type.padEnd(20) + ' | ' + row.is_nullable);
    }

    // member_calculated_scores 테이블 존재 확인 (entity에서 사용하는 이름)
    console.log('\n\n=== member_calculated_scores 테이블 존재 확인 ===');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'member_calculated_scores'
      );
    `);
    console.log('member_calculated_scores 존재:', tableCheck.rows[0].exists ? '✅' : '❌');

    // Entity에서 사용하는 테이블 이름 확인을 위해 코드 확인 필요
    console.log('\n\n=== 서비스에서 사용하는 Repository 확인 필요 ===');
    console.log('코드에서 calculatedScoreRepository가 어떤 테이블과 연결되는지 확인해야 합니다.');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkTableDetail();
