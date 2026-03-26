/**
 * 2026년 ts_regular_admissions 위험도 필드 채우기
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
    console.log('=== 수정 전 2026년 risk 필드 null 현황 ===');
    const beforeResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE risk_plus_1 IS NULL) as null_risk
      FROM ts_regular_admissions
      WHERE year = 2026
    `);
    console.log('2026년 전체: ' + beforeResult.rows[0].total + '개, risk null: ' + beforeResult.rows[0].null_risk + '개');

    // 경북대, 성균관대 현재 상태
    console.log('\n=== 경북대, 성균관대 위험도 현재 상태 ===');
    const univResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
        ra.risk_plus_1,
        ra.risk_minus_1
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE (u.name LIKE '%경북대%' OR u.name LIKE '%성균관%')
        AND ra.recruitment_name LIKE '%의예%'
        AND ra.year IN (2025, 2026)
      ORDER BY u.name, ra.recruitment_name, ra.year DESC
    `);
    univResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): +1=' + row.risk_plus_1 + ', -1=' + row.risk_minus_1);
    });

    // 2025년 데이터에서 위험도 필드 매핑
    console.log('\n=== risk 필드 업데이트 실행 ===');
    const riskFields = [
      'risk_plus_5', 'risk_plus_4', 'risk_plus_3', 'risk_plus_2', 'risk_plus_1',
      'risk_minus_1', 'risk_minus_2', 'risk_minus_3', 'risk_minus_4', 'risk_minus_5'
    ];

    for (const field of riskFields) {
      const result = await client.query(`
        UPDATE ts_regular_admissions ra2026
        SET ${field} = ra2025.${field}
        FROM ts_regular_admissions ra2025
        WHERE ra2026.year = 2026
          AND ra2025.year = 2025
          AND ra2026.${field} IS NULL
          AND ra2025.${field} IS NOT NULL
          AND ra2026.university_id = ra2025.university_id
          AND ra2026.recruitment_name = ra2025.recruitment_name
      `);
      console.log(field + ': ' + result.rowCount + '개 업데이트');
    }

    // min_cut_percent, max_cut_percent도 업데이트
    console.log('\n=== percent 필드 업데이트 ===');
    const percentResult1 = await client.query(`
      UPDATE ts_regular_admissions ra2026
      SET min_cut_percent = ra2025.min_cut_percent
      FROM ts_regular_admissions ra2025
      WHERE ra2026.year = 2026
        AND ra2025.year = 2025
        AND ra2026.min_cut_percent IS NULL
        AND ra2025.min_cut_percent IS NOT NULL
        AND ra2026.university_id = ra2025.university_id
        AND ra2026.recruitment_name = ra2025.recruitment_name
    `);
    console.log('min_cut_percent: ' + percentResult1.rowCount + '개 업데이트');

    const percentResult2 = await client.query(`
      UPDATE ts_regular_admissions ra2026
      SET max_cut_percent = ra2025.max_cut_percent
      FROM ts_regular_admissions ra2025
      WHERE ra2026.year = 2026
        AND ra2025.year = 2025
        AND ra2026.max_cut_percent IS NULL
        AND ra2025.max_cut_percent IS NOT NULL
        AND ra2026.university_id = ra2025.university_id
        AND ra2026.recruitment_name = ra2025.recruitment_name
    `);
    console.log('max_cut_percent: ' + percentResult2.rowCount + '개 업데이트');

    // initial/additional percentile도 업데이트
    const ipResult = await client.query(`
      UPDATE ts_regular_admissions ra2026
      SET initial_cumulative_percentile = ra2025.initial_cumulative_percentile,
          additional_cumulative_percentile = ra2025.additional_cumulative_percentile
      FROM ts_regular_admissions ra2025
      WHERE ra2026.year = 2026
        AND ra2025.year = 2025
        AND ra2026.initial_cumulative_percentile IS NULL
        AND ra2025.initial_cumulative_percentile IS NOT NULL
        AND ra2026.university_id = ra2025.university_id
        AND ra2026.recruitment_name = ra2025.recruitment_name
    `);
    console.log('cumulative_percentile: ' + ipResult.rowCount + '개 업데이트');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 ===');
    const afterResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE risk_plus_1 IS NULL) as null_risk
      FROM ts_regular_admissions
      WHERE year = 2026
    `);
    console.log('2026년 전체: ' + afterResult.rows[0].total + '개, risk null: ' + afterResult.rows[0].null_risk + '개');

    // 경북대, 성균관대 수정 후 상태
    console.log('\n=== 수정 후 경북대, 성균관대 ===');
    const afterUnivResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
        ra.min_cut,
        ra.risk_plus_1,
        ra.risk_minus_1,
        ra.min_cut_percent
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE (u.name LIKE '%경북대%' OR u.name LIKE '%성균관%')
        AND ra.recruitment_name LIKE '%의예%'
        AND ra.year = 2026
      ORDER BY u.name
    `);
    afterUnivResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ': min=' + Number(row.min_cut).toFixed(2) + ', +1=' + row.risk_plus_1 + ', -1=' + row.risk_minus_1 + ', percent=' + row.min_cut_percent);
    });

    console.log('\n✅ 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
