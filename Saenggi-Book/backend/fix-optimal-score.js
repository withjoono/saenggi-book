/**
 * ts_member_calculated_scores 테이블 optimal_score 수정
 * 200 미만 값을 10배로 복원
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
    console.log('=== 수정 전 상태 ===');
    const beforeResult = await client.query(`
      SELECT
        CASE
          WHEN optimal_score < 100 THEN '0-100'
          WHEN optimal_score < 200 THEN '100-200'
          WHEN optimal_score < 500 THEN '200-500'
          ELSE '500+'
        END as score_range,
        COUNT(*) as count
      FROM ts_member_calculated_scores
      WHERE optimal_score > 0
      GROUP BY 1
      ORDER BY 1
    `);
    beforeResult.rows.forEach(row => {
      console.log(row.score_range + ': ' + row.count + '개');
    });

    // 샘플 데이터 확인
    console.log('\n=== 수정될 데이터 샘플 ===');
    const sampleResult = await client.query(`
      SELECT
        university_name,
        score_calculation,
        converted_score,
        optimal_score
      FROM ts_member_calculated_scores
      WHERE optimal_score > 0 AND optimal_score < 200
        AND converted_score > 500
      ORDER BY university_name
      LIMIT 10
    `);
    sampleResult.rows.forEach(row => {
      console.log(row.university_name + ' (' + row.score_calculation + '): converted=' + Number(row.converted_score).toFixed(2) + ', optimal=' + Number(row.optimal_score).toFixed(2) + '→' + (Number(row.optimal_score) * 10).toFixed(2));
    });

    // optimal_score 수정 (converted_score가 500 이상이면서 optimal_score가 200 미만인 경우)
    // 이렇게 하면 실제로 총점이 100점인 대학은 제외됨
    console.log('\n=== optimal_score 수정 실행 ===');
    const updateResult = await client.query(`
      UPDATE ts_member_calculated_scores
      SET optimal_score = optimal_score * 10,
          score_difference = (optimal_score * 10) - converted_score
      WHERE optimal_score > 0 AND optimal_score < 200
        AND converted_score > 500
    `);
    console.log('✅ 수정된 행: ' + updateResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 ===');
    const afterResult = await client.query(`
      SELECT
        CASE
          WHEN optimal_score < 100 THEN '0-100'
          WHEN optimal_score < 200 THEN '100-200'
          WHEN optimal_score < 500 THEN '200-500'
          ELSE '500+'
        END as score_range,
        COUNT(*) as count
      FROM ts_member_calculated_scores
      WHERE optimal_score > 0
      GROUP BY 1
      ORDER BY 1
    `);
    afterResult.rows.forEach(row => {
      console.log(row.score_range + ': ' + row.count + '개');
    });

    // 가천대 확인
    console.log('\n=== 수정 후 가천대 데이터 ===');
    const gachonResult = await client.query(`
      SELECT
        university_name,
        score_calculation,
        converted_score,
        optimal_score,
        score_difference
      FROM ts_member_calculated_scores
      WHERE university_name LIKE '%가천%'
        AND score_calculation IN ('가천의학', '가천한의', '가천약학')
      ORDER BY score_calculation
      LIMIT 10
    `);
    gachonResult.rows.forEach(row => {
      console.log(row.university_name + ' (' + row.score_calculation + '): converted=' + Number(row.converted_score).toFixed(2) + ', optimal=' + Number(row.optimal_score).toFixed(2) + ', diff=' + Number(row.score_difference).toFixed(2));
    });

    console.log('\n✅ 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
