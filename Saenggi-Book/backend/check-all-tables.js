const { Client } = require('pg');

async function checkAllTables() {
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

    // List all tables
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const result = await client.query(tablesQuery);
    console.log('\n=== All Tables in Database ===');
    console.log(`Total tables: ${result.rowCount}\n`);
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.table_name}`);
    });

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  process.exit(0);
}

checkAllTables();
