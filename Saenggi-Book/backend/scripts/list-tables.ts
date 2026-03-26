import { Client } from 'pg';

async function listTables() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  try {
    await client.connect();
    console.log('✅ Connected to Cloud SQL');

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`\n📋 Tables in database (${tables.rows.length}):`);
    tables.rows.forEach((t: any) => console.log('  -', t.table_name));

    // Check for member-related tables
    const memberTables = tables.rows.filter((t: any) =>
      t.table_name.toLowerCase().includes('member')
    );
    if (memberTables.length > 0) {
      console.log('\n👤 Member-related tables:');
      memberTables.forEach((t: any) => console.log('  -', t.table_name));
    }

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listTables();
