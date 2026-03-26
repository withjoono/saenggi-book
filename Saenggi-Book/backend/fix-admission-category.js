const { Client } = require('pg');

async function fixAdmissionCategory() {
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

    // Update all records with special admission codes to have category '특별'
    // Special admission codes are those that exist in ss_admission_subtype table (11-56)
    console.log('\n📝 Fixing admission_category for records with special admission codes...');

    const result = await client.query(`
      UPDATE susi_kyokwa_recruitment
      SET admission_category = '특별'
      WHERE admission_subtype IS NOT NULL
      AND admission_subtype != ''
      AND admission_category = '일반'
    `);

    console.log(`✅ Updated ${result.rowCount} records from '일반' to '특별'`);

    // Verify the update
    const verification = await client.query(`
      SELECT admission_category, COUNT(*) as count
      FROM susi_kyokwa_recruitment
      GROUP BY admission_category
      ORDER BY admission_category
    `);

    console.log('\n📊 Updated category distribution:');
    verification.rows.forEach(row => {
      console.log(`  ${row.admission_category}: ${row.count} records`);
    });

    // Check specific codes again
    const codeCheck = await client.query(`
      SELECT
        admission_subtype,
        admission_category,
        COUNT(*) as count
      FROM susi_kyokwa_recruitment
      WHERE admission_subtype IN ('11', '12', '13', '21', '22')
      GROUP BY admission_subtype, admission_category
      ORDER BY admission_subtype, admission_category
    `);

    console.log('\n✅ Verification - Category distribution for specific codes:');
    codeCheck.rows.forEach(r => {
      console.log(`  Code ${r.admission_subtype}: ${r.admission_category} (${r.count} records)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixAdmissionCategory();
