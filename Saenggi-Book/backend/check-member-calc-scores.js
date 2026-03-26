/**
 * ts_member_calculated_scores 90점대 데이터 확인 및 수정
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

  // 1. 테이블 구조 확인
  console.log('=== 1. ts_member_calculated_scores 컬럼 ===');
  const colResult = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ts_member_calculated_scores'
    ORDER BY ordinal_position
  `);
  colResult.rows.forEach(row => {
    console.log('  ' + row.column_name + ': ' + row.data_type);
  });

  // 2. 90점대 converted_score
  console.log('\n=== 2. 90점대 converted_score 확인 ===');
  const score90Result = await client.query(`
    SELECT
      university_name,
      score_calculation,
      major,
      converted_score,
      optimal_score,
      COUNT(*) as count
    FROM ts_member_calculated_scores
    WHERE converted_score > 90 AND converted_score < 100
    GROUP BY university_name, score_calculation, major, converted_score, optimal_score
    ORDER BY count DESC
    LIMIT 15
  `);
  console.log('90점대 converted_score: ' + score90Result.rowCount + '개 그룹');
  score90Result.rows.forEach(row => {
    console.log(row.university_name + ' (' + row.score_calculation + ') ' + row.major + ': converted=' + Number(row.converted_score).toFixed(2) + ', optimal=' + Number(row.optimal_score).toFixed(2) + ' (' + row.count + '개)');
  });

  // 3. 가천대 데이터
  console.log('\n=== 3. 가천대 저장된 점수 ===');
  const gachonResult = await client.query(`
    SELECT
      university_name,
      score_calculation,
      major,
      converted_score,
      optimal_score,
      score_difference
    FROM ts_member_calculated_scores
    WHERE university_name LIKE '%가천%'
    ORDER BY score_calculation
    LIMIT 10
  `);
  gachonResult.rows.forEach(row => {
    console.log(row.university_name + ' (' + row.score_calculation + ') ' + row.major + ': converted=' + Number(row.converted_score).toFixed(2) + ', optimal=' + Number(row.optimal_score).toFixed(2) + ', diff=' + Number(row.score_difference).toFixed(2));
  });

  // 4. 전체 점수 분포
  console.log('\n=== 4. converted_score 분포 ===');
  const distResult = await client.query(`
    SELECT
      CASE
        WHEN converted_score < 100 THEN '0-100'
        WHEN converted_score < 200 THEN '100-200'
        WHEN converted_score < 500 THEN '200-500'
        WHEN converted_score < 800 THEN '500-800'
        WHEN converted_score < 1000 THEN '800-1000'
        ELSE '1000+'
      END as score_range,
      COUNT(*) as count
    FROM ts_member_calculated_scores
    WHERE converted_score > 0
    GROUP BY 1
    ORDER BY 1
  `);
  distResult.rows.forEach(row => {
    console.log(row.score_range + ': ' + row.count + '개');
  });

  await client.end();
}

check().catch(console.error);
