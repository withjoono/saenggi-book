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

  // ts_regular_admissions 테이블 컬럼 확인
  const colResult = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ts_regular_admissions'
    AND column_name LIKE '%cut%' OR column_name LIKE '%score%'
    ORDER BY column_name
  `);

  console.log('=== ts_regular_admissions 점수 관련 컬럼 ===');
  colResult.rows.forEach(row => {
    console.log(row.column_name + ': ' + row.data_type);
  });

  // 가천대 의예과 데이터 확인
  const result = await client.query(`
    SELECT
      ra.id,
      ra.recruitment_name,
      ra.score_calculation,
      ra.min_cut,
      ra.max_cut,
      pr.year,
      pr.min_cut as pr_min_cut,
      pr.max_cut as pr_max_cut,
      pr.converted_score_total
    FROM ts_regular_admissions ra
    LEFT JOIN ts_regular_admission_previous_results pr ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
    ORDER BY pr.year DESC NULLS LAST
  `);

  console.log('\n=== 가천대 의예과 전체 데이터 ===');
  result.rows.forEach(row => {
    console.log('ID:', row.id, '/', row.recruitment_name);
    console.log('  ra테이블 min_cut:', row.min_cut, '/ max_cut:', row.max_cut);
    if (row.year) {
      console.log('  pr테이블 ' + row.year + '년 min_cut:', row.pr_min_cut, '/ max_cut:', row.pr_max_cut, '/ total:', row.converted_score_total);
    }
    console.log('');
  });

  await client.end();
}
check().catch(console.error);
