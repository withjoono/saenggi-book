/**
 * 운영 DB 입결 데이터 확인 스크립트
 */
const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,  // Cloud SQL Proxy
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkData() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 가천대 의학과 데이터 확인
    const result = await client.query(`
      SELECT
        ra.id as admission_id,
        u.name as univ_name,
        ra.recruitment_name,
        ra.score_calculation,
        pr.year,
        pr.min_cut,
        pr.max_cut,
        pr.converted_score_total,
        pr.percentile_50,
        pr.percentile_70
      FROM ts_regular_admission_previous_results pr
      JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%가천%'
      ORDER BY u.name, ra.recruitment_name, pr.year DESC
      LIMIT 20
    `);

    console.log('=== 가천대 입결 데이터 ===');
    result.rows.forEach(row => {
      console.log(row.univ_name + ' | ' + row.recruitment_name + ' | ' + row.year + '년');
      console.log('  min_cut(50%): ' + row.min_cut + ', max_cut(70%): ' + row.max_cut + ', total: ' + row.converted_score_total);
      console.log('  score_calculation: ' + row.score_calculation);
      console.log('');
    });

    // 전체 데이터 범위 확인
    const statsResult = await client.query(`
      SELECT
        MIN(min_cut) as min_min_cut,
        MAX(min_cut) as max_min_cut,
        AVG(min_cut) as avg_min_cut,
        MIN(max_cut) as min_max_cut,
        MAX(max_cut) as max_max_cut,
        AVG(max_cut) as avg_max_cut,
        COUNT(*) as total_count
      FROM ts_regular_admission_previous_results
      WHERE min_cut IS NOT NULL
    `);

    console.log('\n=== 전체 입결 데이터 통계 ===');
    const stats = statsResult.rows[0];
    console.log('총 데이터 수: ' + stats.total_count);
    console.log('min_cut 범위: ' + Number(stats.min_min_cut).toFixed(2) + ' ~ ' + Number(stats.max_min_cut).toFixed(2) + ' (평균: ' + Number(stats.avg_min_cut).toFixed(2) + ')');
    console.log('max_cut 범위: ' + Number(stats.min_max_cut).toFixed(2) + ' ~ ' + Number(stats.max_max_cut).toFixed(2) + ' (평균: ' + Number(stats.avg_max_cut).toFixed(2) + ')');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkData();
