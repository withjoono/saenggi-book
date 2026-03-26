const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_NAME || 'geobukschool_dev',
});

async function main() {
  await client.connect();
  console.log('DB 연결 성공\n');

  // mockexam_standard_score_tb 컬럼 확인
  const columns = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'mockexam_standard_score_tb'
    ORDER BY ordinal_position
  `);
  console.log('=== mockexam_standard_score_tb 컬럼 ===');
  columns.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

  // 샘플 데이터
  const sample = await client.query(`
    SELECT * FROM mockexam_standard_score_tb LIMIT 5
  `);
  console.log('\n=== 샘플 데이터 ===');
  sample.rows.forEach(r => console.log(JSON.stringify(r)));

  // subject_code 종류 확인
  const subjectCodes = await client.query(`
    SELECT DISTINCT subject_code, COUNT(*) as cnt
    FROM mockexam_standard_score_tb
    GROUP BY subject_code
    ORDER BY subject_code
  `);
  console.log('\n=== subject_code 종류 ===');
  subjectCodes.rows.forEach(r => console.log(`  ${r.subject_code}: ${r.cnt}개`));

  // mockexam_schedule_tb 확인 (과목 정보 있는지)
  const scheduleColumns = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'mockexam_schedule_tb'
    ORDER BY ordinal_position
  `);
  console.log('\n=== mockexam_schedule_tb 컬럼 ===');
  scheduleColumns.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

  await client.end();
}

main().catch(console.error);
