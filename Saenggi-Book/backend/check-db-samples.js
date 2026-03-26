const { DataSource } = require('typeorm');

const ds = new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
});

async function main() {
  await ds.initialize();

  // DB에 저장된 데이터 샘플 확인
  const samples = await ds.query(`
    SELECT
      u.name as univ_name,
      ra.recruitment_name,
      pr.year,
      pr.percentile_50,
      pr.percentile_70
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.year = 2025
    LIMIT 20
  `);

  console.log('DB 샘플 데이터:');
  samples.forEach((s, i) => {
    console.log(`${i+1}. [${s.univ_name}] - [${s.recruitment_name}] | 백분위50: ${s.percentile_50}, 백분위70: ${s.percentile_70}`);
  });

  // 가천대학교 예시로 확인
  const gachon = await ds.query(`
    SELECT
      u.name as univ_name,
      ra.recruitment_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%가천%'
    LIMIT 10
  `);

  console.log('\n가천대학교 DB 데이터:');
  gachon.forEach((s, i) => {
    console.log(`${i+1}. [${s.univ_name}] - [${s.recruitment_name}]`);
  });

  await ds.destroy();
}

main().catch(console.error);
