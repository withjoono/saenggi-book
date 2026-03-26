import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env.production') });

async function importSchema() {
  console.log('Connecting to Cloud SQL via proxy...');
  console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);

  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5434'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_prod',
  });

  try {
    await client.connect();
    console.log('✅ Connected to Cloud SQL!');

    // Read clean schema dump file
    const schemaPath = path.join(__dirname, '..', 'schema_clean.sql');
    console.log(`Reading schema from: ${schemaPath}`);

    let schema = fs.readFileSync(schemaPath, 'utf-8');

    // Clean up pg_dump specific commands
    schema = schema
      .split('\n')
      .filter(line => !line.startsWith('\\') && !line.startsWith('SET ') && !line.startsWith('SELECT pg_catalog'))
      .join('\n');

    console.log('Executing entire schema as single transaction...');

    try {
      // Execute entire schema in a single transaction
      await client.query('BEGIN');
      await client.query(schema);
      await client.query('COMMIT');
      console.log('✅ Schema executed successfully!');
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.log('⚠️ Full schema execution failed, trying statement by statement...');
      console.log('Error:', err.message?.substring(0, 200));

      // Fall back to statement by statement
      await executeStatements(client, schema);
    }

    // Check tables created
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(`\n📋 Total tables in database: ${tables.rows.length}`);
    if (tables.rows.length > 0) {
      console.log('Tables:');
      tables.rows.forEach((t: any) => console.log(`  - ${t.table_name}`));
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function executeStatements(client: Client, schema: string) {
  // Parse statements more carefully - handle $$ delimiters for functions
  const statements: string[] = [];
  let current = '';
  let inDollarQuote = false;

  for (const line of schema.split('\n')) {
    const trimmedLine = line.trim();

    // Skip empty lines and pure comments
    if (!trimmedLine || trimmedLine.startsWith('--')) {
      continue;
    }

    // Track $$ delimited blocks
    const dollarCount = (line.match(/\$\$/g) || []).length;
    if (dollarCount % 2 === 1) {
      inDollarQuote = !inDollarQuote;
    }

    current += line + '\n';

    // Statement ends with ; and not inside $$ block
    if (trimmedLine.endsWith(';') && !inDollarQuote) {
      statements.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const statement of statements) {
    try {
      await client.query(statement);
      successCount++;
    } catch (err: any) {
      // Skip errors for already existing objects
      if (!err.message.includes('already exists') &&
          !err.message.includes('duplicate key')) {
        errorCount++;
        if (errors.length < 10) {
          errors.push(err.message.substring(0, 100));
        }
      } else {
        successCount++; // Count as success for existing objects
      }
    }
  }

  console.log(`\n📊 Schema import completed:`);
  console.log(`  ✅ Successful statements: ${successCount}`);
  console.log(`  ⚠️  Errors (non-duplicate): ${errorCount}`);

  if (errors.length > 0) {
    console.log(`\nFirst ${errors.length} errors:`);
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }
}

importSchema();
