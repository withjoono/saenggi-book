import { Client } from 'pg';

// 상품 카테고리: J(정시), S(수시), C(컨설팅), T(티켓)
// 상품 타입: FIXEDTERM(기간권), TICKET(티켓), PACKAGE(패키지)
// 서비스 범위: S(수시), J(정시), T(티켓)

const products = [
  {
    id: 1,
    product_nm: '정시 예측 서비스 (1개월)',
    product_price: '29000',
    explain_comment: '정시 합격 예측 서비스 1개월 이용권',
    product_cate_code: 'J',
    product_type_code: 'FIXEDTERM',
    service_range_code: 'J',
  },
  {
    id: 2,
    product_nm: '정시 예측 서비스 (3개월)',
    product_price: '69000',
    explain_comment: '정시 합격 예측 서비스 3개월 이용권',
    product_cate_code: 'J',
    product_type_code: 'FIXEDTERM',
    service_range_code: 'J',
  },
  {
    id: 3,
    product_nm: '수시 예측 서비스 (1개월)',
    product_price: '29000',
    explain_comment: '수시 합격 예측 서비스 1개월 이용권',
    product_cate_code: 'S',
    product_type_code: 'FIXEDTERM',
    service_range_code: 'S',
  },
  {
    id: 4,
    product_nm: '수시 예측 서비스 (3개월)',
    product_price: '69000',
    explain_comment: '수시 합격 예측 서비스 3개월 이용권',
    product_cate_code: 'S',
    product_type_code: 'FIXEDTERM',
    service_range_code: 'S',
  },
  {
    id: 5,
    product_nm: '정시+수시 통합 패키지 (3개월)',
    product_price: '99000',
    explain_comment: '정시, 수시 합격 예측 서비스 3개월 통합 패키지',
    product_cate_code: 'S',
    product_type_code: 'PACKAGE',
    service_range_code: 'S',
  },
  {
    id: 6,
    product_nm: '1:1 컨설팅 상담권',
    product_price: '50000',
    explain_comment: '전문 입시 컨설턴트와 1:1 상담 (1회)',
    product_cate_code: 'C',
    product_type_code: 'TICKET',
    service_range_code: 'T',
    available_count: 1,
  },
  {
    id: 7,
    product_nm: '모의면접 티켓 (3회)',
    product_price: '120000',
    explain_comment: '모의면접 서비스 3회 이용권',
    product_cate_code: 'T',
    product_type_code: 'TICKET',
    service_range_code: 'T',
    available_count: 3,
  },
];

async function addProducts() {
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

    console.log('\n➕ 상품 데이터 추가 중...');

    for (const product of products) {
      try {
        await client.query(`
          INSERT INTO pay_service_tb (
            id, product_nm, product_price, explain_comment,
            product_cate_code, product_type_code, service_range_code,
            available_count, delete_flag, create_dt, update_dt
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), NOW()
          )
          ON CONFLICT (product_nm) DO UPDATE SET
            product_price = EXCLUDED.product_price,
            explain_comment = EXCLUDED.explain_comment,
            product_cate_code = EXCLUDED.product_cate_code,
            product_type_code = EXCLUDED.product_type_code,
            service_range_code = EXCLUDED.service_range_code,
            update_dt = NOW()
        `, [
          product.id,
          product.product_nm,
          product.product_price,
          product.explain_comment,
          product.product_cate_code,
          product.product_type_code,
          product.service_range_code,
          product.available_count || null,
        ]);
        console.log(`  ✅ ${product.product_nm} (${product.product_price}원)`);
      } catch (e: any) {
        console.log(`  ⚠️ ${product.product_nm}: ${e.message.substring(0, 80)}`);
      }
    }

    // Verify
    const count = await client.query('SELECT COUNT(*) as cnt FROM pay_service_tb WHERE delete_flag = 0');
    console.log(`\n📊 총 판매중인 상품: ${count.rows[0].cnt}개`);

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

addProducts();
