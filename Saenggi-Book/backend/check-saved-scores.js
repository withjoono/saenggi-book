/**
 * 저장된 정시 계산 점수 확인
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

  // 1. ts_member_jungsi_calculated_scores 테이블 구조 확인
  console.log('=== 1. ts_member_jungsi_calculated_scores 컬럼 ===');
  const colResult = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ts_member_jungsi_calculated_scores'
    ORDER BY ordinal_position
  `);
  colResult.rows.forEach(row => {
    console.log('  ' + row.column_name + ': ' + row.data_type);
  });

  // 2. 가천대 의예과 저장된 점수 확인
  console.log('\n=== 2. 가천대 의예과 저장된 계산 점수 ===');
  const gachonResult = await client.query(`
    SELECT
      mcs.*
    FROM ts_member_jungsi_calculated_scores mcs
    WHERE mcs.university_name LIKE '%가천%'
      AND (mcs.recruitment_name LIKE '%의예%' OR mcs.recruitment_name LIKE '%약학%')
    ORDER BY mcs.member_id, mcs.recruitment_name
    LIMIT 10
  `);
  console.log('저장된 가천대 계산 점수: ' + gachonResult.rowCount + '개');
  gachonResult.rows.forEach(row => {
    console.log(JSON.stringify(row, null, 2));
  });

  // 3. 90점대 저장된 점수 확인
  console.log('\n=== 3. 90점대 저장된 converted_score ===');
  const score90Result = await client.query(`
    SELECT
      university_name,
      recruitment_name,
      converted_score,
      optimal_score,
      COUNT(*) as count
    FROM ts_member_jungsi_calculated_scores
    WHERE converted_score > 90 AND converted_score < 100
    GROUP BY university_name, recruitment_name, converted_score, optimal_score
    ORDER BY count DESC
    LIMIT 15
  `);
  console.log('90점대 저장 점수: ' + score90Result.rowCount + '개 그룹');
  score90Result.rows.forEach(row => {
    console.log(row.university_name + ' ' + row.recruitment_name + ': converted=' + row.converted_score + ', optimal=' + row.optimal_score + ' (' + row.count + '개)');
  });

  // 4. optimal_score가 90점대인 데이터
  console.log('\n=== 4. 90점대 optimal_score ===');
  const optimal90Result = await client.query(`
    SELECT
      university_name,
      recruitment_name,
      optimal_score,
      COUNT(*) as count
    FROM ts_member_jungsi_calculated_scores
    WHERE optimal_score > 90 AND optimal_score < 100
    GROUP BY university_name, recruitment_name, optimal_score
    ORDER BY count DESC
    LIMIT 15
  `);
  console.log('90점대 optimal_score: ' + optimal90Result.rowCount + '개 그룹');
  optimal90Result.rows.forEach(row => {
    console.log(row.university_name + ' ' + row.recruitment_name + ': optimal=' + row.optimal_score + ' (' + row.count + '개)');
  });

  await client.end();
}

check().catch(console.error);
