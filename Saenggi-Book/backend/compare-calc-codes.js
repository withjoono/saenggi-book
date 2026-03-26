const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function compareCalcCodes() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // ts_regular_admissions의 score_calculation 코드
    console.log('=== ts_regular_admissions의 score_calculation 코드 ===');
    const raResult = await client.query(`
      SELECT DISTINCT score_calculation, COUNT(*) as count
      FROM ts_regular_admissions
      WHERE year = 2026
        AND score_calculation IS NOT NULL
      GROUP BY score_calculation
      ORDER BY score_calculation
    `);
    console.log('총 유형:', raResult.rows.length + '개\n');

    // ts_member_jungsi_calculated_scores의 score_calculation 코드
    console.log('=== 계산된 점수의 score_calculation 코드 ===');
    const calcResult = await client.query(`
      SELECT DISTINCT score_calculation, COUNT(*) as count
      FROM ts_member_jungsi_calculated_scores
      GROUP BY score_calculation
      ORDER BY score_calculation
    `);
    console.log('총 유형:', calcResult.rows.length + '개\n');

    // 비교: ts_regular_admissions에는 있지만 계산되지 않은 코드
    console.log('=== 계산되지 않은 score_calculation 코드 ===');
    const missingResult = await client.query(`
      SELECT DISTINCT ra.score_calculation
      FROM ts_regular_admissions ra
      WHERE ra.year = 2026
        AND ra.score_calculation IS NOT NULL
        AND ra.score_calculation NOT IN (
          SELECT DISTINCT score_calculation
          FROM ts_member_jungsi_calculated_scores
          WHERE score_calculation IS NOT NULL
        )
      ORDER BY ra.score_calculation
    `);

    if (missingResult.rows.length === 0) {
      console.log('✅ 모든 코드가 계산되었습니다.');
    } else {
      console.log('❌ 누락된 코드 수:', missingResult.rows.length + '개');
      for (const row of missingResult.rows) {
        console.log('  -', row.score_calculation);
      }
    }

    // 문제 대학들 중 누락된 코드
    console.log('\n=== 문제 대학 중 누락된 score_calculation ===');
    const problemMissingResult = await client.query(`
      SELECT DISTINCT u.name, ra.score_calculation
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.year = 2026
        AND ra.score_calculation IS NOT NULL
        AND u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
        AND ra.score_calculation NOT IN (
          SELECT DISTINCT score_calculation
          FROM ts_member_jungsi_calculated_scores
          WHERE score_calculation IS NOT NULL
        )
      ORDER BY u.name, ra.score_calculation
    `);

    if (problemMissingResult.rows.length === 0) {
      console.log('✅ 문제 대학의 모든 코드가 계산되었습니다.');
    } else {
      console.log('❌ 누락된 코드:');
      for (const row of problemMissingResult.rows) {
        console.log('  -', row.name + ':', row.score_calculation);
      }
    }

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

compareCalcCodes();
