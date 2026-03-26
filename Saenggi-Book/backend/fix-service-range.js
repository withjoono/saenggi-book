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

  // 모든 상품의 service_range_code 확인
  const products = await client.query(`
    SELECT id, product_nm, product_cate_code, product_type_code, service_range_code
    FROM pay_service_tb
    ORDER BY id
  `);

  console.log('상품 목록:');
  products.rows.forEach(p => {
    console.log(`ID: ${p.id}, 이름: ${p.product_nm}, 카테고리: ${p.product_cate_code}, 서비스범위: ${p.service_range_code}`);
  });

  // joonseong08@gmail.com의 주문 상세 확인
  const orders = await client.query(`
    SELECT o.id, o.pay_service_id, o.order_state, s.product_nm, s.service_range_code
    FROM pay_order_tb o
    JOIN member_tb m ON o.member_id = m.id
    LEFT JOIN pay_service_tb s ON o.pay_service_id = s.id
    WHERE m.email = 'joonseong08@gmail.com'
    ORDER BY o.id DESC
  `);

  console.log('\njoonseong08@gmail.com 주문 목록:');
  orders.rows.forEach(o => {
    console.log(`주문ID: ${o.id}, 상품ID: ${o.pay_service_id}, 상품명: ${o.product_nm}, 서비스범위: ${o.service_range_code}, 상태: ${o.order_state}`);
  });

  await client.end();
}

fix().catch(e => console.error('오류:', e.message));
