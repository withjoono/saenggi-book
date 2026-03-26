import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env.production') });

async function syncSchema() {
  console.log('Connecting to Cloud SQL via proxy...');
  console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5434'),
    username: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_prod',
    synchronize: true, // This will create all tables
    logging: true,
    entities: [path.join(__dirname, '..', 'src', 'database', 'entities', '**', '*.entity.{ts,js}')],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Schema synchronized successfully!');

    // Check tables created
    const tables = await dataSource.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(`\n📊 Created ${tables.length} tables:`);
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`));

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncSchema();
