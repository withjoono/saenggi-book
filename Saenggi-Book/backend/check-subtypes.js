const { Client } = require('pg');

async function checkSubtypes() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'geobukschool_dev',
    user: 'tsuser',
    password: 'tsuser1234',
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT id, name, category_id FROM ss_admission_subtype ORDER BY id'
    );

    console.log(`Total subtypes: ${result.rows.length}\n`);
    console.log('Subtypes with their category_id:');
    result.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.name} (category_id: ${row.category_id})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSubtypes();
