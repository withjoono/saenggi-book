const { Client } = require('pg');

const client = new Client({
  host: '34.64.165.158',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
  ssl: false,
});

async function fix() {
  await client.connect();
  console.log('운영 DB 연결 성공\n');

  // 수정 전 확인
  const before = await client.query(`
    SELECT id, product_nm, product_cate_code, service_range_code
    FROM pay_service_tb WHERE id = 1
  `);
  console.log('수정 전:', before.rows[0]);

  // 상품 ID 1의 카테고리와 서비스범위를 J로 수정
  await client.query(`
    UPDATE pay_service_tb
    SET product_cate_code = 'J', service_range_code = 'J'
    WHERE id = 1
  `);

  // 수정 후 확인
  const after = await client.query(`
    SELECT id, product_nm, product_cate_code, service_range_code
    FROM pay_service_tb WHERE id = 1
  `);
  console.log('수정 후:', after.rows[0]);

  // 활성 서비스 재확인 (joonseong08@gmail.com)
  const activeServices = await client.query(`
    SELECT ps.service_range_code
    FROM pay_contract_tb pc
    JOIN pay_order_tb po ON pc.order_id = po.id
    JOIN pay_service_tb ps ON po.pay_service_id = ps.id
    JOIN member_tb m ON pc.member_id = m.id
    WHERE m.email = 'joonseong08@gmail.com'
      AND pc.contract_period_end_dt > NOW()
      AND pc.contract_use = 1
  `);

  console.log('\njoonseong08@gmail.com 활성 서비스:', activeServices.rows.map(r => r.service_range_code));

  await client.end();
  console.log('\n✅ 수정 완료!');
}

fix().catch(e => console.error('오류:', e.message));
