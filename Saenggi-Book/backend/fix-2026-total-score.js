/**
 * 2026년 ts_regular_admissions total_score null 데이터 수정
 * 2025년 데이터 기준으로 채우기
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
    console.log('=== 수정 전 2026년 total_score null 현황 ===');
    const beforeResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE total_score IS NULL) as null_count
      FROM ts_regular_admissions
      WHERE year = 2026
    `);
    console.log('2026년 전체: ' + beforeResult.rows[0].total + '개, null: ' + beforeResult.rows[0].null_count + '개');

    // 경북대, 성균관대 의예과 현재 상태
    console.log('\n=== 경북대, 성균관대 현재 상태 ===');
    const univResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
        ra.total_score,
        ra.score_calculation
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE (u.name LIKE '%경북대%' OR u.name LIKE '%성균관%')
        AND ra.recruitment_name LIKE '%의예%'
      ORDER BY u.name, ra.year DESC
    `);
    univResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): total=' + row.total_score + ', calc=' + row.score_calculation);
    });

    // 2025년 데이터에서 score_calculation별 total_score 확인
    console.log('\n=== 2025년 score_calculation별 total_score ===');
    const scoreCalcResult = await client.query(`
      SELECT DISTINCT
        score_calculation,
        total_score
      FROM ts_regular_admissions
      WHERE year = 2025 AND total_score IS NOT NULL
      ORDER BY score_calculation
    `);
    console.log('score_calculation별 total_score 매핑: ' + scoreCalcResult.rowCount + '개');

    // 2026년 데이터 중 같은 score_calculation을 가진 2025년 데이터의 total_score로 업데이트
    console.log('\n=== total_score 업데이트 실행 ===');
    const updateResult = await client.query(`
      UPDATE ts_regular_admissions ra2026
      SET total_score = ra2025.total_score
      FROM (
        SELECT DISTINCT score_calculation, total_score
        FROM ts_regular_admissions
        WHERE year = 2025 AND total_score IS NOT NULL
      ) ra2025
      WHERE ra2026.year = 2026
        AND ra2026.total_score IS NULL
        AND ra2026.score_calculation = ra2025.score_calculation
    `);
    console.log('✅ 수정된 행: ' + updateResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 ===');
    const afterResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE total_score IS NULL) as null_count
      FROM ts_regular_admissions
      WHERE year = 2026
    `);
    console.log('2026년 전체: ' + afterResult.rows[0].total + '개, null: ' + afterResult.rows[0].null_count + '개');

    // 경북대, 성균관대 수정 후 상태
    console.log('\n=== 수정 후 경북대, 성균관대 ===');
    const afterUnivResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
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
      console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): total=' + row.total_score + ', min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2));
    });

    console.log('\n✅ 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
