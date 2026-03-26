const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function checkTables() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // List all tables
    const tables = await dataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 Tables in database:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Check if migrations table exists
    const migrationTable = tables.find(t => t.table_name === 'migrations');
    if (migrationTable) {
      const migrations = await dataSource.query('SELECT * FROM migrations ORDER BY id');
      console.log('\n📋 Migrations run:');
      migrations.forEach(m => console.log(`  - ${m.name} (${new Date(m.timestamp).toISOString()})`));
    } else {
      console.log('\n⚠️  No migrations table found - migrations may not have been run yet');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

checkTables();
