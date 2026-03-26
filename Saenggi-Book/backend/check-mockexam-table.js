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

    // mockexam_standard_score_tb 구조 확인
    console.log('=== mockexam_standard_score_tb 구조 ===');
    const structResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'mockexam_standard_score_tb'
      ORDER BY ordinal_position
    `);
    for (const row of structResult.rows) {
      console.log('  -', row.column_name, '(' + row.data_type + ')');
    }

    // 샘플 데이터
    console.log('\n=== 샘플 데이터 (1개) ===');
    const sampleResult = await client.query(`
      SELECT *
      FROM mockexam_standard_score_tb
      LIMIT 1
    `);
    if (sampleResult.rows.length > 0) {
      console.log(JSON.stringify(sampleResult.rows[0], null, 2));
    }

    // 회원별 점수 현황
    console.log('\n=== 회원별 점수 수 ===');
    const countResult = await client.query(`
      SELECT member_id, COUNT(*) as score_count
      FROM mockexam_standard_score_tb
      GROUP BY member_id
      ORDER BY member_id
      LIMIT 10
    `);
    for (const row of countResult.rows) {
      console.log('  회원', row.member_id + ':', row.score_count + '개');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
