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

  // 테이블 컬럼 확인
  const columns = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'earlyd_subject_code_list_tb'
    ORDER BY ordinal_position
  `);
  console.log('=== earlyd_subject_code_list_tb 컬럼 ===');
  columns.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

  // 샘플 데이터
  const sample = await client.query(`
    SELECT * FROM earlyd_subject_code_list_tb LIMIT 5
  `);
  console.log('\n=== 샘플 데이터 ===');
  sample.rows.forEach(r => console.log(JSON.stringify(r)));

  // 수학 관련 데이터
  const mathData = await client.query(`
    SELECT * FROM earlyd_subject_code_list_tb
    WHERE subject_name LIKE '%수학%' OR main_subject_name LIKE '%수학%'
    LIMIT 20
  `);
  console.log('\n=== 수학 관련 데이터 ===');
  mathData.rows.forEach(r => console.log(JSON.stringify(r)));

  // 미적분, 기하, 확통 관련
  const mathDetail = await client.query(`
    SELECT * FROM earlyd_subject_code_list_tb
    WHERE subject_name LIKE '%미적%' OR subject_name LIKE '%기하%' OR subject_name LIKE '%확통%'
       OR subject_name LIKE '%확률%'
    LIMIT 20
  `);
  console.log('\n=== 미적분/기하/확통 데이터 ===');
  mathDetail.rows.forEach(r => console.log(JSON.stringify(r)));

  await client.end();
}

main().catch(console.error);
