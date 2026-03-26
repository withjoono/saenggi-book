const { Client } = require('pg');

async function addTestProduct() {
  const client = new Client({
    host: '34.64.165.158',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
    ssl: false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 테스트 상품 추가
    const result = await client.query(`
      INSERT INTO pay_service_tb (
        create_dt,
        product_nm,
        product_price,
        explain_comment,
        product_cate_code,
        product_type_code,
        service_range_code,
        delete_flag,
        available_count,
        refund_policy
      ) VALUES (
        NOW(),
        '[테스트] 결제 테스트 상품',
        '100',
        '결제 테스트용 100원 상품입니다. 실제 서비스가 제공되지 않습니다.',
        'T',
        'TICKET',
        'T',
        0,
        1,
        '테스트 상품은 환불되지 않습니다.'
      )
      RETURNING id, product_nm, product_price;
    `);

    console.log('테스트 상품 추가 완료:', result.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

addTestProduct();
