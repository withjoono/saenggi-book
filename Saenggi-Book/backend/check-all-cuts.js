/**
 * 모든 테이블의 90점대 데이터 확인
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

  // 1. ts_regular_admissions 테이블 - 90점대 데이터 확인
  console.log('=== 1. ts_regular_admissions - 90점대 min_cut 확인 ===');
  const ra90Result = await client.query(`
    SELECT
      ra.id,
      u.name as univ_name,
      ra.recruitment_name,
      ra.year,
      ra.total_score,
      ra.min_cut,
      ra.max_cut
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.min_cut > 90 AND ra.min_cut < 100
    ORDER BY u.name
    LIMIT 10
  `);
  console.log('90-100 사이 min_cut 데이터:', ra90Result.rowCount + '개');
  ra90Result.rows.forEach(row => {
    console.log('  ' + row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): total=' + row.total_score + ', min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2));
  });

  // 2. ts_regular_admission_previous_results 테이블 - 90점대 데이터 확인
  console.log('\n=== 2. ts_regular_admission_previous_results - 90점대 min_cut 확인 ===');
  const pr90Result = await client.query(`
    SELECT
      pr.id,
      u.name as univ_name,
      ra.recruitment_name,
      pr.year,
      pr.min_cut,
      pr.max_cut,
      pr.converted_score_total
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.min_cut > 90 AND pr.min_cut < 100
    ORDER BY u.name
    LIMIT 10
  `);
  console.log('90-100 사이 min_cut 데이터:', pr90Result.rowCount + '개');
  pr90Result.rows.forEach(row => {
    console.log('  ' + row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2) + ', total=' + row.converted_score_total);
  });

  // 3. 가천대 의예과 전체 데이터 확인
  console.log('\n=== 3. 가천대 의예과 - ts_regular_admissions ===');
  const gachonRaResult = await client.query(`
    SELECT
      ra.id,
      ra.recruitment_name,
      ra.year,
      ra.total_score,
      ra.min_cut,
      ra.max_cut
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
    ORDER BY ra.year DESC
  `);
  gachonRaResult.rows.forEach(row => {
    console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name + ': total=' + row.total_score + ', min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2));
  });

  console.log('\n=== 4. 가천대 의예과 - ts_regular_admission_previous_results ===');
  const gachonPrResult = await client.query(`
    SELECT
      pr.id,
      ra.recruitment_name,
      pr.year,
      pr.min_cut,
      pr.max_cut,
      pr.converted_score_total
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
    ORDER BY pr.year DESC
  `);
  gachonPrResult.rows.forEach(row => {
    console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name + ': min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2) + ', total=' + row.converted_score_total);
  });

  // 5. 전체 점수 분포 확인
  console.log('\n=== 5. ts_regular_admissions min_cut 분포 ===');
  const distResult = await client.query(`
    SELECT
      CASE
        WHEN min_cut < 100 THEN '0-100'
        WHEN min_cut < 200 THEN '100-200'
        WHEN min_cut < 500 THEN '200-500'
        WHEN min_cut < 800 THEN '500-800'
        WHEN min_cut < 1000 THEN '800-1000'
        ELSE '1000+'
      END as score_range,
      COUNT(*) as count
    FROM ts_regular_admissions
    WHERE min_cut IS NOT NULL AND min_cut > 0
    GROUP BY 1
    ORDER BY 1
  `);
  distResult.rows.forEach(row => {
    console.log(row.score_range + ': ' + row.count + '개');
  });

  // 6. ts_regular_admission_previous_results min_cut 분포
  console.log('\n=== 6. ts_regular_admission_previous_results min_cut 분포 ===');
  const prDistResult = await client.query(`
    SELECT
      CASE
        WHEN min_cut < 100 THEN '0-100'
        WHEN min_cut < 200 THEN '100-200'
        WHEN min_cut < 500 THEN '200-500'
        WHEN min_cut < 800 THEN '500-800'
        WHEN min_cut < 1000 THEN '800-1000'
        ELSE '1000+'
      END as score_range,
      COUNT(*) as count
    FROM ts_regular_admission_previous_results
    WHERE min_cut IS NOT NULL AND min_cut > 0
    GROUP BY 1
    ORDER BY 1
  `);
  prDistResult.rows.forEach(row => {
    console.log(row.score_range + ': ' + row.count + '개');
  });

  await client.end();
}

check().catch(console.error);
