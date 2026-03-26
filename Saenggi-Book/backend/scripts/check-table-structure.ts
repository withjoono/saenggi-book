import { Client } from 'pg';

async function checkTableStructure() {
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

    // Check ts_regular_admissions structure
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'ts_regular_admissions'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 ts_regular_admissions columns:');
    console.log(cols.rows.map((c: any) => c.column_name).join(', '));

    // Get sample row
    const sample = await client.query('SELECT * FROM ts_regular_admissions LIMIT 1');
    console.log('\n📝 Sample row:');
    console.log(JSON.stringify(sample.rows[0], null, 2));

    // Check ts_member_regular_interests structure
    const interestCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'ts_member_regular_interests'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 ts_member_regular_interests columns:');
    console.log(interestCols.rows.map((c: any) => c.column_name).join(', '));

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkTableStructure();
