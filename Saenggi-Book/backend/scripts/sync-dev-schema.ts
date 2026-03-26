import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load development environment
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });

async function syncSchema() {
  console.log('🔄 Connecting to database...');
  console.log(`Type: ${process.env.DB_TYPE}`);
  console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);

  const dbType = process.env.DB_TYPE as 'postgres' | 'mysql' | 'better-sqlite3';
  
  const baseConfig: any = {
    type: dbType,
    database: process.env.DB_NAME || 'geobukschool_dev',
    synchronize: true, // This will create all tables
    logging: true,
    entities: [path.join(__dirname, '..', 'src', 'database', 'entities', '**', '*.entity.{ts,js}')],
  };

  // SQLite는 host, port, username, password가 필요 없음
  const config = dbType === 'better-sqlite3' 
    ? baseConfig
    : {
        ...baseConfig,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      };

  const dataSource = new DataSource(config);

  try {
    await dataSource.initialize();
    console.log('✅ Schema synchronized successfully!');

    // Check tables created
    const queryText = dbType === 'better-sqlite3'
      ? `SELECT name as table_name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`
      : `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
    
    const tables = await dataSource.query(queryText);
    console.log(`\n📊 Created ${tables.length} tables:`);
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`));

    await dataSource.destroy();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncSchema();
