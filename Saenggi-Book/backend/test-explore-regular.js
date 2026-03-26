const { Client } = require('pg');

async function testExploreRegular() {
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
        AND table_name IN ('regular_admission_tb', 'university_tb')
      ORDER BY table_name;
    `;
    const tables = await client.query(tablesQuery);
    console.log('\n=== Regular Admission Tables ===');
    console.log(tables.rows);

    // Test the actual query similar to getAdmissions
    const year = '2024';
    const admissionType = '가';

    console.log('\n=== Testing Regular Admissions Query ===');
    console.log(`Year: ${year}, Admission Type: ${admissionType}`);

    const queryText = `
      SELECT
        ra.*,
        u.id as university_id,
        u.name as university_name
      FROM regular_admission_tb ra
      LEFT JOIN university_tb u ON ra.university_id = u.id
      WHERE ra.year = $1
        AND ra.admission_type = $2
      LIMIT 10
    `;

    const result = await client.query(queryText, [year, admissionType]);
    console.log('✅ Query executed successfully!');
    console.log('Row count:', result.rowCount);
    if (result.rowCount > 0) {
      console.log('Sample result:', JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('⚠️  No results found - table might be empty');
    }

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

testExploreRegular();
