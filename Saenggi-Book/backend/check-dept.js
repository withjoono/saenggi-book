const { Client } = require('pg');

async function check() {
  const client = new Client({
    host: '127.0.0.1', port: 5432, user: 'tsuser',
    password: 'tsuser1234', database: 'geobukschool_dev'
  });
  await client.connect();

  // 건축토목환경공학부 검색
  const result = await client.query(`
    SELECT ra.id, ra.recruitment_name, ra.year, u.name as univ_name,
           pr.year as result_year, pr.percentile_70, pr.percentile_50
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    LEFT JOIN ts_regular_admission_previous_results pr ON pr.regular_admission_id = ra.id
    WHERE (ra.recruitment_name LIKE '%건축%토목%' OR ra.recruitment_name LIKE '%토목%환경%')
      AND u.name LIKE '%강원%'
    ORDER BY ra.year DESC, pr.year DESC
    LIMIT 20
  `);

  console.log('강원대 건축토목환경 관련 검색 결과:');
  result.rows.forEach(row => {
    console.log(`  [${row.year}년 정시] ${row.univ_name} - ${row.recruitment_name} | 입결 ${row.result_year}년: 70%=${row.percentile_70}, 50%=${row.percentile_50}`);
  });

  // 2024년 정시 데이터에서 건축토목환경공학부 확인
  const result2 = await client.query(`
    SELECT ra.id, ra.recruitment_name, ra.year, u.name as univ_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%강원%'
      AND ra.year = 2024
    ORDER BY ra.recruitment_name
    LIMIT 30
  `);

  console.log('\n2024년 강원대 모집단위 전체:');
  result2.rows.forEach(row => {
    console.log(`  id=${row.id}: ${row.univ_name} - ${row.recruitment_name}`);
  });

  await client.end();
}
check().catch(console.error);
