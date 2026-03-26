/**
 * 2026년 ts_regular_admissions score_calculation 및 total_score 채우기
 * 2025년 데이터에서 같은 대학+모집단위명으로 매핑
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
    console.log('=== 수정 전 2026년 score_calculation null 현황 ===');
    const beforeResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE score_calculation IS NULL) as null_calc,
        COUNT(*) FILTER (WHERE total_score IS NULL) as null_total
      FROM ts_regular_admissions
      WHERE year = 2026
    `);
    console.log('2026년 전체: ' + beforeResult.rows[0].total + '개');
    console.log('  score_calculation null: ' + beforeResult.rows[0].null_calc + '개');
    console.log('  total_score null: ' + beforeResult.rows[0].null_total + '개');

    // 2025년 데이터에서 score_calculation 매핑 (대학명 + 모집단위명 기준)
    console.log('\n=== score_calculation 업데이트 실행 ===');
    const updateCalcResult = await client.query(`
      UPDATE ts_regular_admissions ra2026
      SET score_calculation = ra2025.score_calculation
      FROM ts_regular_admissions ra2025
      WHERE ra2026.year = 2026
        AND ra2025.year = 2025
        AND ra2026.score_calculation IS NULL
        AND ra2026.university_id = ra2025.university_id
        AND ra2026.recruitment_name = ra2025.recruitment_name
    `);
    console.log('✅ score_calculation 수정된 행: ' + updateCalcResult.rowCount + '개');

    // total_score 업데이트
    console.log('\n=== total_score 업데이트 실행 ===');
    const updateTotalResult = await client.query(`
      UPDATE ts_regular_admissions ra2026
      SET total_score = ra2025.total_score
      FROM ts_regular_admissions ra2025
      WHERE ra2026.year = 2026
        AND ra2025.year = 2025
        AND ra2026.total_score IS NULL
        AND ra2026.university_id = ra2025.university_id
        AND ra2026.recruitment_name = ra2025.recruitment_name
    `);
    console.log('✅ total_score 수정된 행: ' + updateTotalResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 ===');
    const afterResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE score_calculation IS NULL) as null_calc,
        COUNT(*) FILTER (WHERE total_score IS NULL) as null_total
      FROM ts_regular_admissions
      WHERE year = 2026
    `);
    console.log('2026년 전체: ' + afterResult.rows[0].total + '개');
    console.log('  score_calculation null: ' + afterResult.rows[0].null_calc + '개');
    console.log('  total_score null: ' + afterResult.rows[0].null_total + '개');

    // 경북대, 성균관대 수정 후 상태
    console.log('\n=== 수정 후 경북대, 성균관대 의예과 ===');
    const afterUnivResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
        ra.score_calculation,
        ra.total_score,
        ra.min_cut,
        ra.max_cut
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE (u.name LIKE '%경북대%' OR u.name LIKE '%성균관%')
        AND ra.recruitment_name LIKE '%의예%'
        AND ra.year = 2026
      ORDER BY u.name
    `);
    afterUnivResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ': calc=' + row.score_calculation + ', total=' + row.total_score + ', min=' + Number(row.min_cut).toFixed(2));
    });

    // 가천대 의예과도 확인
    console.log('\n=== 수정 후 가천대 의예과/약학과 ===');
    const gachonResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
        ra.score_calculation,
        ra.total_score,
        ra.min_cut
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%가천%'
        AND (ra.recruitment_name LIKE '%의예%' OR ra.recruitment_name LIKE '%약학%')
        AND ra.year = 2026
      ORDER BY ra.recruitment_name
    `);
    gachonResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ': calc=' + row.score_calculation + ', total=' + row.total_score + ', min=' + Number(row.min_cut).toFixed(2));
    });

    console.log('\n✅ 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
