const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
});

async function test() {
  await client.connect();

  // mockexam_standard_score_tb 캐시 테이블 확인
  const cacheCount = await client.query(`SELECT COUNT(*) FROM mockexam_standard_score_tb`);
  console.log('캐시 테이블 (mockexam_standard_score_tb) 레코드 수:', cacheCount.rows[0].count);

  if (parseInt(cacheCount.rows[0].count) > 0) {
    const cacheData = await client.query(`
      SELECT id, subject_code, standard_score, percentile, grade, member_id
      FROM mockexam_standard_score_tb
      LIMIT 10
    `);
    console.log('\n캐시 테이블 샘플 데이터:');
    console.log(cacheData.rows);
  }

  // mockexam_raw_score_tb 원점수 테이블 확인
  const rawCount = await client.query(`SELECT COUNT(*) FROM mockexam_raw_score_tb`);
  console.log('\n원점수 테이블 (mockexam_raw_score_tb) 레코드 수:', rawCount.rows[0].count);

  if (parseInt(rawCount.rows[0].count) > 0) {
    const rawData = await client.query(`
      SELECT id, subject_code, raw_score, member_id
      FROM mockexam_raw_score_tb
      LIMIT 10
    `);
    console.log('\n원점수 테이블 샘플 데이터:');
    console.log(rawData.rows);
  }

  await client.end();
}

test().catch(console.error);
