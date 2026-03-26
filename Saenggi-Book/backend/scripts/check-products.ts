import { Client } from 'pg';

async function checkProducts() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  try {
    await client.connect();
    console.log('✅ Connected');

    // Check pay_service_tb count
    const count = await client.query('SELECT COUNT(*) as cnt FROM pay_service_tb');
    console.log('\n📦 전체 상품 수:', count.rows[0].cnt);

    // List all products
    const products = await client.query(`
      SELECT id, product_nm, product_price, product_cate_code, product_type_code, delete_flag
      FROM pay_service_tb
      ORDER BY id
    `);
    console.log('\n🎫 상품 목록:');
    if (products.rows.length === 0) {
      console.log('  ⚠️ 상품이 없습니다!');
    } else {
      products.rows.forEach((p: any) => {
        console.log(`  - [${p.id}] ${p.product_nm} (${p.product_price}원)`);
        console.log(`    카테고리: ${p.product_cate_code} | 타입: ${p.product_type_code} | 삭제: ${p.delete_flag}`);
      });
    }

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkProducts();
