const { Client } = require('pg');

async function addCodeColumn() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'geobukschool_dev',
    user: 'tsuser',
    password: 'tsuser1234',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 1. Add code column to ss_admission_subtype table
    console.log('\n📝 Adding code column...');
    await client.query(`
      ALTER TABLE ss_admission_subtype
      ADD COLUMN IF NOT EXISTS code VARCHAR(10)
    `);

    // 2. Update code values to match ID
    console.log('📝 Setting code = id for all subtypes...');
    await client.query(`
      UPDATE ss_admission_subtype
      SET code = id::varchar
    `);

    // 3. Verify the update
    const result = await client.query(`
      SELECT id, name, code, category_id
      FROM ss_admission_subtype
      ORDER BY id
    `);

    console.log('\n✅ Updated ss_admission_subtype table:');
    result.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.name} (code: ${row.code}, category: ${row.category_id})`);
    });

    console.log(`\n✅ Total: ${result.rows.length} subtypes updated`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addCodeColumn();
