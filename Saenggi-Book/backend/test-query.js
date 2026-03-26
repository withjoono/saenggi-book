const { Client } = require('pg');

async function testQuery() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'geobukschool_dev',
    user: 'tsuser',
    password: 'tsuser1234',
  });

  try {
    await client.connect();

    console.log('Testing the exact query that TypeORM would generate...\n');

    const basicType = '특별';
    const subtypeIds = [11];

    // Test with the exact query structure
    const query = `
      SELECT
        r.id AS "r_id",
        r.ida_id AS "r_ida_id",
        r.university_name AS "r_university_name",
        r.university_code AS "r_university_code",
        r.university_type AS "r_university_type",
        r.admission_type AS "r_admission_type",
        r.admission_name AS "r_admission_name",
        r.category AS "r_category",
        r.recruitment_unit AS "r_recruitment_unit",
        r.region_major AS "r_region_major",
        r.region_detail AS "r_region_detail",
        r.major_field AS "r_major_field",
        r.recruitment_count AS "r_recruitment_count",
        r.admission_subtype AS "r_admission_subtype"
      FROM susi_kyokwa_recruitment r
      WHERE r.admission_category = $1
      AND (
        r.admission_subtype LIKE $2
        OR r.admission_subtype LIKE $3
        OR r.admission_subtype LIKE $4
        OR r.admission_subtype LIKE $5
      )
      LIMIT 5
    `;

    const params = [
      basicType,          // $1
      `${subtypeIds[0]}`,      // $2 - exact
      `${subtypeIds[0]},%`,    // $3 - start
      `%,${subtypeIds[0]},%`,  // $4 - middle
      `%,${subtypeIds[0]}`     // $5 - end
    ];

    console.log('Query:', query.replace(/\n/g, ' ').replace(/\s+/g, ' '));
    console.log('\nParameters:', params);

    const result = await client.query(query, params);

    console.log(`\n✅ Found ${result.rows.length} records`);
    result.rows.forEach(r => {
      console.log(`  ${r.r_ida_id}: ${r.r_university_name}`);
      console.log(`    Category: ${r.r_category}, Subtype: ${r.r_admission_subtype}`);
    });

  } finally {
    await client.end();
  }
}

testQuery();
