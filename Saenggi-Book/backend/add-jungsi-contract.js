const { Client } = require('pg');

// 운영 DB 설정
const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function addContract() {
  await client.connect();
  console.log('운영 DB 연결 성공\n');

  const memberId = 6; // joonseong09@gmail.com, 이은찬

  // 회원 확인
  const member = await client.query(`
    SELECT id, email, nickname FROM member_tb WHERE id = $1
  `, [memberId]);
  console.log('대상 회원:', member.rows[0]);

  // 기존 정시 계약 확인 (product_code가 'J'인 것만)
  const existingContract = await client.query(`
    SELECT * FROM pay_contract_tb WHERE member_id = $1 AND product_code = 'J'
  `, [memberId]);

  if (existingContract.rows.length > 0) {
    console.log('\n이미 정시 계약이 있습니다:');
    existingContract.rows.forEach(c => console.log(c));
    await client.end();
    return;
  }

  // 정시 서비스 상품 확인 (삭제 안된것)
  let service = await client.query(`
    SELECT * FROM pay_service_tb WHERE product_cate_code = 'J' AND delete_flag = 0 LIMIT 1
  `);

  // 없으면 삭제된 것도 사용
  if (service.rows.length === 0) {
    service = await client.query(`
      SELECT * FROM pay_service_tb WHERE product_cate_code = 'J' LIMIT 1
    `);
  }
  console.log('\n정시 서비스 상품:', service.rows[0]);

  // 주문 먼저 생성 (pay_order_tb)
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // 3개월 후

  // 고유 merchant_uid 생성
  const merchantUid = `ADMIN_GRANT_${memberId}_${Date.now()}`;

  const orderResult = await client.query(`
    INSERT INTO pay_order_tb (
      member_id,
      pay_service_id,
      order_state,
      merchant_uid,
      paid_amount,
      create_dt,
      update_dt
    ) VALUES ($1, $2, 'COMPLETE', $3, 0, $4, $4)
    RETURNING id
  `, [memberId, service.rows[0].id, merchantUid, now]);

  const orderId = orderResult.rows[0].id;
  console.log('\n주문 생성 완료, 주문 ID:', orderId);
  console.log('Merchant UID:', merchantUid);

  // 계약 생성
  const contractResult = await client.query(`
    INSERT INTO pay_contract_tb (
      contract_period_end_dt,
      contract_start_dt,
      contract_use,
      create_dt,
      product_code,
      regular_contract_fl,
      update_dt,
      member_id,
      order_id
    ) VALUES ($1, $2, 1, $2, 'J', false, $2, $3, $4)
    RETURNING id
  `, [endDate, now, memberId, orderId]);

  console.log('\n정시 계약 생성 완료, 계약 ID:', contractResult.rows[0].id);
  console.log('계약 기간:', now.toISOString(), '~', endDate.toISOString());

  // 최종 확인
  const finalContract = await client.query(`
    SELECT c.*, m.email, m.nickname
    FROM pay_contract_tb c
    JOIN member_tb m ON c.member_id = m.id
    WHERE c.member_id = $1 AND c.product_code = 'J'
  `, [memberId]);
  console.log('\n최종 계약 정보:');
  console.log(finalContract.rows[0]);

  await client.end();
  console.log('\n✅ 완료! 이제 정시 서비스를 이용할 수 있습니다.');
}

addContract().catch(e => {
  console.error('오류:', e.message);
  process.exit(1);
});
