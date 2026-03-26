const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function check() {
  await client.connect();

  const products = await client.query(`
    SELECT id, product_nm, product_cate_code, product_type_code, delete_flag
    FROM pay_service_tb
    ORDER BY id
  `);

  console.log('운영 DB 상품 목록:');
  products.rows.forEach(p => {
    console.log(`ID: ${p.id}, 이름: ${p.product_nm}, 카테고리: ${p.product_cate_code}, 타입: ${p.product_type_code}, 삭제: ${p.delete_flag}`);
  });

  await client.end();
}

check().catch(console.error);
