const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev'
  });

  await client.connect();

  // 1. ts_regular_admissions 테이블 컬럼 확인
  console.log('=== ts_regular_admissions 컬럼 ===');
  const cols1 = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ts_regular_admissions'
    ORDER BY ordinal_position
  `);
  cols1.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  // 2. ts_regular_admission_previous_results 테이블 컬럼 확인
  console.log('\n=== ts_regular_admission_previous_results 컬럼 ===');
  const cols2 = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ts_regular_admission_previous_results'
    ORDER BY ordinal_position
  `);
  cols2.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  // 3. 정시 데이터 샘플 확인
  console.log('\n=== ts_regular_admissions 샘플 데이터 ===');
  const sample = await client.query(`
    SELECT ra.id, ra.year, ra.recruitment_name, ra.admission_type,
           ra.min_cut, ra.max_cut, u.name as university_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    ORDER BY u.name, ra.recruitment_name
    LIMIT 20
  `);
  sample.rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.university_name} | ${r.admission_type} | ${r.recruitment_name}`);
    console.log(`   min_cut: ${r.min_cut}, max_cut: ${r.max_cut}`);
  });

  // 4. previous_results 데이터 확인
  console.log('\n=== ts_regular_admission_previous_results 샘플 ===');
  const prevSample = await client.query(`
    SELECT pr.*, ra.recruitment_name, u.name as university_name
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    LIMIT 10
  `);
  prevSample.rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.university_name} | ${r.recruitment_name} | year: ${r.year}`);
    console.log(`   min_cut: ${r.min_cut}, max_cut: ${r.max_cut}, competition: ${r.competition_ratio}`);
  });

  // 5. 총 레코드 수
  const count1 = await client.query('SELECT COUNT(*) FROM ts_regular_admissions');
  const count2 = await client.query('SELECT COUNT(*) FROM ts_regular_admission_previous_results');
  console.log('\n=== 레코드 수 ===');
  console.log('ts_regular_admissions:', count1.rows[0].count);
  console.log('ts_regular_admission_previous_results:', count2.rows[0].count);

  // 6. 대학 목록
  console.log('\n=== DB 대학 목록 (처음 30개) ===');
  const univs = await client.query(`
    SELECT DISTINCT u.name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    ORDER BY u.name
    LIMIT 30
  `);
  univs.rows.forEach(r => console.log(`  - ${r.name}`));

  await client.end();
}

run().catch(console.error);
