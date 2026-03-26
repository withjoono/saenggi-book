const { Client } = require('pg');

async function testAuthActive() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('✅ Database connected');

    // Test if tables exist
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('pay_contract_tb', 'pay_order_tb', 'pay_service_tb')
      ORDER BY table_name;
    `;
    const tables = await client.query(tablesQuery);
    console.log('\n=== Payment Tables ===');
    console.log(tables.rows);

    // Test the actual query from findActiveServicesById
    const memberId = 1; // test2@test.com
    const activeServicesQuery = `
      SELECT ps.service_range_code
      FROM pay_contract_tb pc
      JOIN pay_order_tb po ON pc.order_id = po.id
      JOIN pay_service_tb ps ON po.pay_service_id = ps.id
      WHERE pc.member_id = $1
        AND pc.contract_period_end_dt > NOW()
        AND pc.contract_use = 1
    `;

    console.log('\n=== Testing Active Services Query ===');
    const result = await client.query(activeServicesQuery, [memberId]);
    console.log('Query executed successfully!');
    console.log('Results:', result.rows);
    console.log('Row count:', result.rowCount);

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

testAuthActive();
