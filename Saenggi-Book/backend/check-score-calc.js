/**
 * 경북대, 성균관대 score_calculation 확인
 */
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
  console.log('✅ DB 연결 성공\n');

  // 경북대 의예과 모든 연도
  console.log('=== 경북대 의예과 score_calculation (전 연도) ===');
  const kyungpookResult = await client.query(`
    SELECT
      u.name as univ_name,
      ra.recruitment_name,
      ra.year,
      ra.score_calculation,
      ra.total_score,
      ra.general_field_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%경북대%'
      AND ra.recruitment_name LIKE '%의예%'
    ORDER BY ra.recruitment_name, ra.year DESC
  `);
  kyungpookResult.rows.forEach(row => {
    console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): calc=' + row.score_calculation + ', total=' + row.total_score + ', field=' + row.general_field_name);
  });

  // 성균관대 의예과 모든 연도
  console.log('\n=== 성균관대 의예과 score_calculation (전 연도) ===');
  const skuResult = await client.query(`
    SELECT
      u.name as univ_name,
      ra.recruitment_name,
      ra.year,
      ra.score_calculation,
      ra.total_score,
      ra.general_field_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%성균관%'
      AND ra.recruitment_name LIKE '%의예%'
    ORDER BY ra.year DESC
  `);
  skuResult.rows.forEach(row => {
    console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): calc=' + row.score_calculation + ', total=' + row.total_score + ', field=' + row.general_field_name);
  });

  // 2024년 경북의학 사용 대학들
  console.log('\n=== 2024년 경북의학 score_calculation 사용 대학 ===');
  const calcResult = await client.query(`
    SELECT
      u.name as univ_name,
      ra.recruitment_name,
      ra.year,
      ra.score_calculation,
      ra.total_score
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.score_calculation = '경북의학'
    ORDER BY ra.year DESC
    LIMIT 10
  `);
  calcResult.rows.forEach(row => {
    console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): calc=' + row.score_calculation + ', total=' + row.total_score);
  });

  await client.end();
}

check().catch(console.error);
