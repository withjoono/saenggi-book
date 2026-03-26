const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_DATABASE || 'geobukschool_dev',
});

async function main() {
  try {
    await AppDataSource.initialize();

    // Count total records
    const count = await AppDataSource.query('SELECT COUNT(*) FROM susi_jonghap_recruitment');
    console.log('✅ Total records:', count[0].count);

    // Sample records
    const samples = await AppDataSource.query('SELECT * FROM susi_jonghap_recruitment LIMIT 3');
    console.log('\n📋 Sample records:\n');
    samples.forEach((row, idx) => {
      console.log(`--- Record ${idx + 1} ---`);
      console.log('IDA ID:', row.ida_id);
      console.log('University:', row.university_name);
      console.log('Code:', row.university_code);
      console.log('Type:', row.university_type);
      console.log('Admission:', row.admission_name);
      console.log('Recruitment Unit:', row.recruitment_unit);
      console.log('Major Field:', row.major_field);
      console.log('Minor Field:', row.minor_field);
      console.log('Count:', row.recruitment_count);
      console.log('');
    });

    // Check pharmacy records
    const pharmacy = await AppDataSource.query(
      "SELECT COUNT(*) FROM susi_jonghap_recruitment WHERE major_field LIKE '%약학%' OR minor_field LIKE '%약학%'"
    );
    console.log('🔍 Pharmacy-related records:', pharmacy[0].count);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
