/**
 * 운영 DB 입결 데이터 분석 스크립트
 */
const { Client } = require('pg');

const client = new Client({
  host: '34.64.165.158',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
  ssl: {
    rejectUnauthorized: false
  }
});

async function analyzeData() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 점수 구간별 분포 확인
    console.log('=== min_cut 점수 구간별 분포 ===');
    const distributionResult = await client.query(`
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
      WHERE min_cut IS NOT NULL
      GROUP BY 1
      ORDER BY 1
    `);
    distributionResult.rows.forEach(row => {
      console.log(row.score_range + ': ' + row.count + '개');
    });

    // 연도별 분포 확인
    console.log('\n=== 연도별 데이터 현황 ===');
    const yearResult = await client.query(`
      SELECT
        year,
        COUNT(*) as total,
        COUNT(min_cut) as has_min_cut,
        COUNT(max_cut) FILTER (WHERE max_cut > 0) as has_max_cut,
        AVG(min_cut) as avg_min_cut
      FROM ts_regular_admission_previous_results
      GROUP BY year
      ORDER BY year DESC
    `);
    yearResult.rows.forEach(row => {
      console.log(row.year + '년: 총 ' + row.total + '개, min_cut ' + row.has_min_cut + '개, max_cut ' + row.has_max_cut + '개' +
        (row.avg_min_cut ? ', 평균 min_cut: ' + Number(row.avg_min_cut).toFixed(2) : ''));
    });

    // 90점대 데이터 샘플 (대학별)
    console.log('\n=== 90점대 데이터 샘플 (예상: 900점대이어야 함) ===');
    const lowScoreResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.score_calculation,
        pr.year,
        pr.min_cut,
        pr.min_cut * 10 as expected_min_cut
      FROM ts_regular_admission_previous_results pr
      JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE pr.min_cut > 90 AND pr.min_cut < 110
      ORDER BY u.name, pr.year DESC
      LIMIT 15
    `);
    lowScoreResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' ' + row.year + '년: ' +
        Number(row.min_cut).toFixed(2) + ' → (x10) ' + Number(row.expected_min_cut).toFixed(2) +
        ' [' + row.score_calculation + ']');
    });

    // 정상 범위 데이터 샘플 (800-1000)
    console.log('\n=== 정상 범위 데이터 샘플 (800-1000) ===');
    const normalScoreResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        ra.score_calculation,
        pr.year,
        pr.min_cut
      FROM ts_regular_admission_previous_results pr
      JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE pr.min_cut > 800 AND pr.min_cut < 1000
      ORDER BY u.name, pr.year DESC
      LIMIT 10
    `);
    normalScoreResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' ' + row.year + '년: ' +
        Number(row.min_cut).toFixed(2) + ' [' + row.score_calculation + ']');
    });

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

analyzeData();
