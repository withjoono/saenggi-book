const { Client } = require('pg');

// 운영 DB 설정
const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function test() {
  await client.connect();
  console.log('운영 DB 연결 성공\n');

  const memberId = 6; // 이은찬 (joonseong09@gmail.com)

  // jungsi/ticket 관련 모든 테이블 찾기
  const allTables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%jungsi%' OR table_name LIKE '%ticket%' OR table_name LIKE '%score%' OR table_name LIKE '%input%')
    ORDER BY table_name
  `);
  console.log('관련 테이블:');
  allTables.rows.forEach(r => console.log('-', r.table_name));

  // pay_contract 확인
  const contracts = await client.query(`
    SELECT * FROM pay_contract_tb WHERE member_id = $1
  `, [memberId]);
  console.log('\n계약 정보:');
  contracts.rows.forEach(c => console.log(c));

  // 정시 관련 테이블 데이터 확인
  const jungsiTables = ['ts_member_jungsi_input_scores', 'ts_member_jungsi_calculated_scores'];

  for (const tableName of jungsiTables) {
    try {
      const result = await client.query(`
        SELECT * FROM ${tableName} WHERE member_id = $1 LIMIT 3
      `, [memberId]);
      console.log(`\n${tableName}:`);
      if (result.rows.length === 0) {
        console.log('데이터 없음');
      } else {
        result.rows.forEach(r => console.log(r));
      }
    } catch (e) {
      console.log(`\n${tableName}: 테이블 없음 또는 오류 - ${e.message}`);
    }
  }

  // mockexam 관련 테이블
  const mockTables = ['mockexam_score_tb', 'mockexam_raw_score_tb', 'mockexam_standard_score_tb'];
  for (const tableName of mockTables) {
    try {
      const result = await client.query(`
        SELECT * FROM ${tableName} WHERE member_id = $1 LIMIT 3
      `, [memberId]);
      console.log(`\n${tableName}:`);
      if (result.rows.length === 0) {
        console.log('데이터 없음');
      } else {
        result.rows.forEach(r => console.log(r));
      }
    } catch (e) {
      console.log(`\n${tableName}: 테이블 없음 또는 오류`);
    }
  }

  // 해당 사용자 정시 서비스 계약 있는지 확인
  const jungsiContract = await client.query(`
    SELECT c.*, s.product_nm, s.product_cate_code, s.available_count
    FROM pay_contract_tb c
    JOIN pay_service_tb s ON c.product_code = s.product_type_code
    WHERE c.member_id = $1
  `, [memberId]);
  console.log('\n정시 서비스 계약 상세:');
  jungsiContract.rows.forEach(c => console.log(c));

  await client.end();
}

test().catch(e => {
  console.error('오류:', e.message);
  process.exit(1);
});
