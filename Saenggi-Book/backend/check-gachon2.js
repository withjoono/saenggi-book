const { Client } = require('pg');
const client = new Client({
  host: '34.64.165.158',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();

  const result = await client.query(`
    SELECT
      ra.id,
      ra.year,
      ra.recruitment_name,
      ra.min_cut,
      ra.max_cut,
      ra.total_score,
      ra.converted_score_total
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
    ORDER BY ra.year DESC, ra.id
  `);

  console.log('=== 가천대 의예과 현재 DB 상태 ===');
  result.rows.forEach(row => {
    console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name);
    console.log('  min_cut: ' + row.min_cut + ', max_cut: ' + row.max_cut);
    console.log('  total_score: ' + row.total_score);
    console.log('  converted_score_total: ' + row.converted_score_total);
    console.log('');
  });

  // 다른 의대와 비교
  console.log('=== 다른 의대들 비교 ===');
  const compareResult = await client.query(`
    SELECT
      u.name as univ_name,
      ra.recruitment_name,
      ra.year,
      ra.min_cut,
      ra.max_cut,
      ra.total_score
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.recruitment_name LIKE '%의예%' AND ra.year = 2026
    ORDER BY u.name
    LIMIT 15
  `);

  compareResult.rows.forEach(row => {
    console.log(row.univ_name + ' ' + row.recruitment_name + ': min=' + row.min_cut + ', max=' + row.max_cut + ', total=' + row.total_score);
  });

  await client.end();
}
check().catch(console.error);
