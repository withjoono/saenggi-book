/**
 * 경북대, 성균관대, 가천대 데이터 확인
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

  // 1. 경북대 의예과
  console.log('=== 1. 경북대 의예과 ===');
  const kyungpookResult = await client.query(`
    SELECT
      ra.id,
      ra.recruitment_name,
      ra.year,
      ra.total_score,
      ra.min_cut,
      ra.max_cut,
      ra.risk_plus_1,
      ra.risk_minus_1
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%경북%' AND ra.recruitment_name LIKE '%의예%'
    ORDER BY ra.year DESC
  `);
  kyungpookResult.rows.forEach(row => {
    console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name);
    console.log('  total=' + row.total_score + ', min=' + row.min_cut + ', max=' + row.max_cut);
    console.log('  +1=' + row.risk_plus_1 + ', -1=' + row.risk_minus_1);
  });

  // 2. 성균관대 의예과
  console.log('\n=== 2. 성균관대 의예과 ===');
  const skuResult = await client.query(`
    SELECT
      ra.id,
      ra.recruitment_name,
      ra.year,
      ra.total_score,
      ra.min_cut,
      ra.max_cut,
      ra.risk_plus_1,
      ra.risk_minus_1
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%성균관%' AND ra.recruitment_name LIKE '%의예%'
    ORDER BY ra.year DESC
  `);
  skuResult.rows.forEach(row => {
    console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name);
    console.log('  total=' + row.total_score + ', min=' + row.min_cut + ', max=' + row.max_cut);
    console.log('  +1=' + row.risk_plus_1 + ', -1=' + row.risk_minus_1);
  });

  // 3. 가천대 의예과, 약학과 - 유불리 관련 필드 확인
  console.log('\n=== 3. 가천대 의예과/약학과 - 모든 점수 필드 ===');
  const gachonResult = await client.query(`
    SELECT
      ra.id,
      ra.recruitment_name,
      ra.year,
      ra.total_score,
      ra.min_cut,
      ra.max_cut,
      ra.min_cut_percent,
      ra.max_cut_percent,
      ra.initial_cumulative_percentile,
      ra.additional_cumulative_percentile
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%가천%' AND (ra.recruitment_name LIKE '%의예%' OR ra.recruitment_name LIKE '%약학%')
    ORDER BY ra.year DESC, ra.recruitment_name
  `);
  gachonResult.rows.forEach(row => {
    console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name);
    console.log('  total=' + row.total_score + ', min=' + row.min_cut + ', max=' + row.max_cut);
    console.log('  min_percent=' + row.min_cut_percent + ', max_percent=' + row.max_cut_percent);
    console.log('  initial_percentile=' + row.initial_cumulative_percentile + ', additional_percentile=' + row.additional_cumulative_percentile);
  });

  // 4. 유불리 관련 테이블 확인
  console.log('\n=== 4. 유불리 관련 테이블 검색 ===');
  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%yubul%' OR table_name LIKE '%유불%' OR table_name LIKE '%advantage%' OR table_name LIKE '%score%')
    ORDER BY table_name
  `);
  tablesResult.rows.forEach(row => {
    console.log('  ' + row.table_name);
  });

  // 5. ts_jungsi 관련 테이블 확인
  console.log('\n=== 5. ts_jungsi 관련 테이블 ===');
  const jungsiTablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%jungsi%'
    ORDER BY table_name
  `);
  jungsiTablesResult.rows.forEach(row => {
    console.log('  ' + row.table_name);
  });

  await client.end();
}

check().catch(console.error);
