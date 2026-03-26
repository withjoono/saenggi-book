import { Client } from 'pg';

async function addTestContract() {
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

    const memberId = 1;

    // First, create a test service product if it doesn't exist
    const existingService = await client.query(
      `SELECT id FROM pay_service_tb WHERE id = 999`
    );

    if (existingService.rows.length === 0) {
      console.log('\n➕ 테스트 이용권 상품 생성...');
      // Only use required fields, let others be default/null
      await client.query(`
        INSERT INTO pay_service_tb (
          id, product_nm, product_price, create_dt, update_dt
        ) VALUES (
          999, '테스트 전체이용권', 0, NOW(), NOW()
        )
      `);
      console.log('  ✅ 테스트 이용권 상품 생성 완료');
    }

    // Create a test contract for the member (valid for 1 year)
    const existingContract = await client.query(
      `SELECT id FROM pay_contract_tb WHERE member_id = $1`,
      [memberId]
    );

    if (existingContract.rows.length === 0) {
      console.log('\n➕ 테스트 이용 계약 생성...');
      // contract_use: 1 = active, 0 = inactive (integer type)
      // regular_contract_fl: boolean (정기 계약 여부, 필수)
      await client.query(`
        INSERT INTO pay_contract_tb (
          member_id, product_code, contract_start_dt, contract_period_end_dt,
          contract_use, regular_contract_fl, create_dt, update_dt
        ) VALUES (
          $1, '999', NOW(), NOW() + INTERVAL '1 year',
          1, false, NOW(), NOW()
        )
      `, [memberId]);
      console.log('  ✅ 테스트 이용 계약 생성 완료');
    } else {
      console.log('\n⚠️ 이미 이용 계약이 존재합니다');
    }

    // Verify
    const contracts = await client.query(
      `SELECT pc.*, ps.product_nm
       FROM pay_contract_tb pc
       LEFT JOIN pay_service_tb ps ON pc.product_code = ps.id
       WHERE pc.member_id = $1`,
      [memberId]
    );
    console.log('\n📊 현재 이용권 상태:');
    contracts.rows.forEach((c: any) => {
      console.log(`  - ${c.product_nm || 'Unknown'}`);
      console.log(`    시작: ${c.contract_start_dt}`);
      console.log(`    종료: ${c.contract_period_end_dt}`);
      console.log(`    사용중: ${c.contract_use}`);
    });

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

addTestContract();
