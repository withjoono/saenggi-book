const { Client } = require('pg');

async function checkRegularData() {
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

    // Check count
    const countQuery = 'SELECT COUNT(*) as count FROM ts_regular_admissions';
    const countResult = await client.query(countQuery);
    console.log(`\n=== ts_regular_admissions Table ===`);
    console.log(`Total rows: ${countResult.rows[0].count}`);

    // Check for 2024 year data
    const yearQuery = `
      SELECT year, admission_type, COUNT(*) as count
      FROM ts_regular_admissions
      GROUP BY year, admission_type
      ORDER BY year DESC, admission_type
      LIMIT 10
    `;
    const yearResult = await client.query(yearQuery);
    console.log('\n=== Data by Year and Admission Type ===');
    yearResult.rows.forEach(row => {
      console.log(`Year: ${row.year}, Type: ${row.admission_type}, Count: ${row.count}`);
    });

    // Sample row
    const sampleQuery = 'SELECT * FROM ts_regular_admissions LIMIT 1';
    const sampleResult = await client.query(sampleQuery);
    if (sampleResult.rowCount > 0) {
      console.log('\n=== Sample Row (first 10 columns) ===');
      const sample = sampleResult.rows[0];
      console.log({
        id: sample.id,
        year: sample.year,
        admission_name: sample.admission_name,
        admission_type: sample.admission_type,
        general_field_name: sample.general_field_name,
        detailed_fields: sample.detailed_fields,
        recruitment_number: sample.recruitment_number,
        selection_method: sample.selection_method,
        recruitment_name: sample.recruitment_name,
        university_id: sample.university_id
      });
    }

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

checkRegularData();
