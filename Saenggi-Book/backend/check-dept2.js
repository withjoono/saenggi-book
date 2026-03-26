const { Client } = require('pg');

async function check() {
  const client = new Client({
    host: '127.0.0.1', port: 5432, user: 'tsuser',
    password: 'tsuser1234', database: 'geobukschool_dev'
  });
  await client.connect();

  // 강원대 건축토목환경공학부의 previous_results 확인
  const result = await client.query(`
    SELECT ra.id as admission_id, ra.recruitment_name, ra.year as admission_year, u.name as univ_name,
           pr.id as result_id, pr.year as result_year, pr.percentile_70, pr.percentile_50, pr.max_cut
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    LEFT JOIN ts_regular_admission_previous_results pr ON pr.regular_admission_id = ra.id
    WHERE ra.recruitment_name = '건축토목환경공학부'
      AND u.name = '강원대'
    ORDER BY ra.year DESC, pr.year DESC
  `);

  console.log('강원대 건축토목환경공학부 상세:');
  result.rows.forEach(row => {
    console.log(`  [정시 ${row.admission_year}년, id=${row.admission_id}] 입결 ${row.result_year}년 (result_id=${row.result_id}): 70%=${row.percentile_70}, 50%=${row.percentile_50}, max_cut=${row.max_cut}`);
  });

  // 이 모집단위에 2024, 2025년 입결이 있는지 확인
  console.log('\n필요한 작업: 2024년 정시 건축토목환경공학부에 2024/2025년 입결 데이터 추가');

  await client.end();
}
check().catch(console.error);
