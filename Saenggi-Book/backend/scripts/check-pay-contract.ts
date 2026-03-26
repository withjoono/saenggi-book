import { Client } from 'pg';

async function checkPayContract() {
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

    // Check pay_contract for member 1
    const contracts = await client.query(
      `SELECT * FROM pay_contract_tb WHERE member_id = $1`,
      [1]
    );
    console.log('\n💳 활성 이용권:', contracts.rows.length, '개');
    if (contracts.rows.length > 0) {
      contracts.rows.forEach((c: any) => console.log(JSON.stringify(c, null, 2)));
    }

    // Check pay_service table structure
    const serviceCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'pay_service_tb'
    `);
    console.log('\n📋 pay_service_tb columns:', serviceCols.rows.map((c: any) => c.column_name).join(', '));

    // Check pay_service table
    const services = await client.query('SELECT * FROM pay_service_tb LIMIT 5');
    console.log('\n🎫 이용권 종류:');
    services.rows.forEach((s: any) => console.log(JSON.stringify(s)));

    // Check pay_contract table structure
    const contractCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'pay_contract_tb'
    `);
    console.log('\n📋 pay_contract_tb columns:', contractCols.rows.map((c: any) => c.column_name).join(', '));

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkPayContract();
