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

  // 모든 회원 목록
  const members = await client.query(`
    SELECT m.id, m.email, m.nickname, m.phone, m.create_dt,
           (SELECT COUNT(*) FROM pay_contract_tb c WHERE c.member_id = m.id) as contract_count
    FROM member_tb m
    ORDER BY m.id
  `);
  console.log('전체 회원 목록:');
  members.rows.forEach(m => console.log(`ID: ${m.id}, Email: ${m.email}, 닉네임: ${m.nickname}, 계약수: ${m.contract_count}`));

  // 모든 계약 정보
  const contracts = await client.query(`
    SELECT c.*, m.email, m.nickname
    FROM pay_contract_tb c
    LEFT JOIN member_tb m ON c.member_id = m.id
    ORDER BY c.id
  `);
  console.log('\n전체 계약 정보:');
  contracts.rows.forEach(c => console.log(c));

  // pay_service_tb에서 정시 상품 확인
  const services = await client.query(`
    SELECT id, product_nm, product_cate_code, product_type_code, available_count
    FROM pay_service_tb
    WHERE product_cate_code = 'J' OR product_nm LIKE '%정시%'
  `);
  console.log('\n정시 관련 상품:');
  services.rows.forEach(s => console.log(s));

  // mockexam_standard_score_tb 구조 확인
  const cols = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'mockexam_standard_score_tb'
    ORDER BY ordinal_position
  `);
  console.log('\nmockexam_standard_score_tb 컬럼:');
  cols.rows.forEach(c => console.log('-', c.column_name, ':', c.data_type));

  await client.end();
}

test().catch(e => {
  console.error('오류:', e.message);
  process.exit(1);
});
