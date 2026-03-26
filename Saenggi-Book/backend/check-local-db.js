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

  // S2 (언매) 테스트
  const result = await client.query(`
    SELECT code, raw_score_common, raw_score_select, standard_score, percentile, grade
    FROM mockexam_raw_to_standard_tb
    WHERE code = 'S2' AND raw_score_common = '76' AND raw_score_select = '24'
  `);
  console.log('로컬 DB 조회 결과 (S2, 76, 24):');
  console.log(result.rows[0] || 'NO DATA');

  // code 컬럼의 고유값 확인
  const codes = await client.query(`
    SELECT DISTINCT code FROM mockexam_raw_to_standard_tb LIMIT 20
  `);
  console.log('\n로컬 DB code 컬럼 값들:');
  console.log(codes.rows.map(r => r.code).join(', '));

  // 총 레코드 수
  const count = await client.query(`SELECT COUNT(*) FROM mockexam_raw_to_standard_tb`);
  console.log('\n총 레코드 수:', count.rows[0].count);

  await client.end();
}

test().catch(console.error);
