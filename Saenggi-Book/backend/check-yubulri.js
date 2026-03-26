/**
 * 유불리 관련 테이블 확인
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

  // 1. ts_member_calculated_scores 테이블 구조 확인
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

  // 2. ts_member_calculated_scores 샘플 데이터
  console.log('\n=== 2. ts_member_calculated_scores 샘플 ===');
  const sampleResult = await client.query(`
    SELECT *
    FROM ts_member_calculated_scores
    LIMIT 3
  `);
  sampleResult.rows.forEach(row => {
    console.log(JSON.stringify(row, null, 2));
  });

  // 3. 90점대 데이터 확인
  console.log('\n=== 3. 90점대 유불리 점수 확인 ===');
  const score90Result = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'ts_member_calculated_scores'
    AND data_type IN ('numeric', 'decimal', 'double precision', 'real')
  `);
  const numericCols = score90Result.rows.map(r => r.column_name);
  console.log('숫자형 컬럼: ' + numericCols.join(', '));

  // 4. 가천대 관련 계산 점수가 있는지 확인
  console.log('\n=== 4. 가천대 관련 계산 점수 ===');
  const gachonCalcResult = await client.query(`
    SELECT mcs.*, ra.recruitment_name, u.name as univ_name
    FROM ts_member_calculated_scores mcs
    JOIN ts_regular_admissions ra ON mcs.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
    LIMIT 5
  `);
  console.log('가천대 의예과 계산 점수: ' + gachonCalcResult.rowCount + '개');
  gachonCalcResult.rows.forEach(row => {
    console.log(JSON.stringify(row, null, 2));
  });

  // 5. 유불리 데이터 저장 테이블 추가 검색
  console.log('\n=== 5. yubul 관련 컬럼 검색 ===');
  const yubulColResult = await client.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE column_name LIKE '%yubul%' OR column_name LIKE '%유불%' OR column_name LIKE '%advantage%' OR column_name LIKE '%same_score%' OR column_name LIKE '%동점%'
  `);
  yubulColResult.rows.forEach(row => {
    console.log('  ' + row.table_name + '.' + row.column_name);
  });

  // 6. regular admission 테이블에서 유불리 관련 컬럼
  console.log('\n=== 6. ts_regular_admissions 모든 컬럼 ===');
  const raColResult = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'ts_regular_admissions'
    ORDER BY ordinal_position
  `);
  console.log(raColResult.rows.map(r => r.column_name).join(', '));

  await client.end();
}

check().catch(console.error);
