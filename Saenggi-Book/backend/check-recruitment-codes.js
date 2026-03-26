const { Client } = require('pg');

async function checkCodes() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'geobukschool_dev',
    user: 'tsuser',
    password: 'tsuser1234',
  });

  try {
    await client.connect();

    // 지역인재가 포함된 레코드에서 사용된 코드 확인
    const result = await client.query(
      `SELECT admission_subtype, COUNT(*) as count
       FROM susi_kyokwa_recruitment
       WHERE admission_subtype LIKE '%12%' OR admission_subtype LIKE '%13%'
       GROUP BY admission_subtype
       ORDER BY count DESC
       LIMIT 10`
    );

    console.log('Records containing codes 12 or 13 (지역인재):');
    result.rows.forEach(row => {
      console.log(`  ${row.admission_subtype} (${row.count} records)`);
    });

    // 모든 고유한 코드 확인
    const codes = await client.query(
      `SELECT DISTINCT unnest(string_to_array(admission_subtype, ',')) as code
       FROM susi_kyokwa_recruitment
       WHERE admission_subtype IS NOT NULL AND admission_subtype != ''
       ORDER BY code::int`
    );

    console.log('\nAll unique codes used in recruitment data:');
    console.log(codes.rows.map(r => r.code).join(', '));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCodes();
