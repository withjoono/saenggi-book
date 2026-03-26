/**
 * ts_regular_admission_previous_results 테이블
 * 200 미만 min_cut/max_cut 값을 10배로 수정
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

async function fixData() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 수정 전 상태 확인
    console.log('=== 수정 전 상태 (ts_regular_admission_previous_results) ===');
    const beforeResult = await client.query(`
      SELECT
        CASE
          WHEN min_cut < 100 THEN '0-100'
          WHEN min_cut < 200 THEN '100-200'
          WHEN min_cut < 500 THEN '200-500'
          ELSE '500+'
        END as score_range,
        COUNT(*) as count
      FROM ts_regular_admission_previous_results
      WHERE min_cut IS NOT NULL AND min_cut > 0
      GROUP BY 1
      ORDER BY 1
    `);
    beforeResult.rows.forEach(row => {
      console.log(row.score_range + ': ' + row.count + '개');
    });

    // 수정될 데이터 샘플
    console.log('\n=== 수정될 데이터 샘플 ===');
    const sampleResult = await client.query(`
      SELECT
        pr.id,
        u.name as univ_name,
        ra.recruitment_name,
        pr.year,
        pr.min_cut as old_min,
        pr.max_cut as old_max
      FROM ts_regular_admission_previous_results pr
      JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE pr.min_cut > 0 AND pr.min_cut < 200
      ORDER BY u.name, ra.recruitment_name
      LIMIT 15
    `);
    sampleResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): min ' +
        Number(row.old_min).toFixed(2) + '→' + (Number(row.old_min) * 10).toFixed(2) +
        ', max ' + Number(row.old_max).toFixed(2) + '→' + (Number(row.old_max) * 10).toFixed(2));
    });

    // min_cut 수정
    console.log('\n=== min_cut 수정 실행 ===');
    const updateMinResult = await client.query(`
      UPDATE ts_regular_admission_previous_results
      SET min_cut = min_cut * 10
      WHERE min_cut > 0 AND min_cut < 200
    `);
    console.log('✅ min_cut 수정된 행: ' + updateMinResult.rowCount + '개');

    // max_cut 수정 (200 미만이고 0보다 큰 값)
    console.log('\n=== max_cut 수정 실행 ===');
    const updateMaxResult = await client.query(`
      UPDATE ts_regular_admission_previous_results
      SET max_cut = max_cut * 10
      WHERE max_cut > 0 AND max_cut < 200
    `);
    console.log('✅ max_cut 수정된 행: ' + updateMaxResult.rowCount + '개');

    // converted_score_total 수정 (100인 값을 1000으로)
    console.log('\n=== converted_score_total 수정 실행 ===');
    const updateTotalResult = await client.query(`
      UPDATE ts_regular_admission_previous_results
      SET converted_score_total = converted_score_total * 10
      WHERE converted_score_total = 100
    `);
    console.log('✅ converted_score_total 수정된 행: ' + updateTotalResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 ===');
    const afterResult = await client.query(`
      SELECT
        CASE
          WHEN min_cut < 100 THEN '0-100'
          WHEN min_cut < 200 THEN '100-200'
          WHEN min_cut < 500 THEN '200-500'
          ELSE '500+'
        END as score_range,
        COUNT(*) as count
      FROM ts_regular_admission_previous_results
      WHERE min_cut IS NOT NULL AND min_cut > 0
      GROUP BY 1
      ORDER BY 1
    `);
    afterResult.rows.forEach(row => {
      console.log(row.score_range + ': ' + row.count + '개');
    });

    // 가천대 의예과 확인
    console.log('\n=== 수정 후 가천대 의예과 확인 ===');
    const gachonResult = await client.query(`
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
      ORDER BY pr.year DESC, pr.id
    `);
    gachonResult.rows.forEach(row => {
      console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name + ': min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2) + ', total=' + row.converted_score_total);
    });

    console.log('\n✅ 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
