const { Client } = require('pg');

// 운영 DB 직접 연결 (공용 IP)
const client = new Client({
  host: '34.64.165.158',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
  ssl: false,
});

async function check() {
  await client.connect();
  console.log('운영 DB 연결 성공\n');

  // 회원 찾기
  const member = await client.query(`
    SELECT id, email, nickname FROM member_tb WHERE email = 'joonseong08@gmail.com'
  `);
  console.log('회원 정보:', member.rows[0]);

  if (!member.rows[0]) {
    console.log('회원을 찾을 수 없습니다.');
    await client.end();
    return;
  }

  const memberId = member.rows[0].id;

  // 계약 정보
  const contracts = await client.query(`
    SELECT c.*, s.product_nm, s.product_type_code, s.service_range_code
    FROM pay_contract_tb c
    LEFT JOIN pay_order_tb o ON c.order_id = o.id
    LEFT JOIN pay_service_tb s ON o.pay_service_id = s.id
    WHERE c.member_id = $1
    ORDER BY c.id DESC
  `, [memberId]);

  console.log('\n계약 정보:');
  contracts.rows.forEach(c => {
    console.log({
      id: c.id,
      product_nm: c.product_nm,
      product_code: c.product_code,
      service_range_code: c.service_range_code,
      contract_use: c.contract_use,
      start: c.contract_start_dt,
      end: c.contract_period_end_dt
    });
  });

  // 활성 서비스 확인
  const activeServices = await client.query(`
    SELECT ps.service_range_code
    FROM pay_contract_tb pc
    JOIN pay_order_tb po ON pc.order_id = po.id
    JOIN pay_service_tb ps ON po.pay_service_id = ps.id
    WHERE pc.member_id = $1
      AND pc.contract_period_end_dt > NOW()
      AND pc.contract_use = 1
  `, [memberId]);

  console.log('\n활성 서비스 (service_range_code):', activeServices.rows.map(r => r.service_range_code));

  await client.end();
}

check().catch(e => console.error('오류:', e.message));
