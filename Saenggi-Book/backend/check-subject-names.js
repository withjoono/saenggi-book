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

  // 과목 코드 테이블에서 매핑 확인
  const codeTable = await client.query(`
    SELECT subject_code, subject_name, main_subject_name
    FROM earlyd_subject_code_list_tb
    WHERE subject_code IN ('S1', 'S3', 'S4', 'S7', 'S8', 'S9', 'S12', 'S16')
    ORDER BY subject_code
  `);

  console.log('=== 과목 코드 → 과목명 매핑 ===');
  codeTable.rows.forEach(r => {
    console.log(`  ${r.subject_code}: ${r.subject_name} (${r.main_subject_name})`);
  });

  // 점수표 과목명
  const scoreTable = require('./dist/modules/jungsi/calculation/data/score-table-26-jungsi.json');
  console.log('\n=== 점수표 과목명 (수학 관련) ===');
  Object.keys(scoreTable).filter(k => k.includes('수학')).forEach(k => console.log('  ' + k));

  await client.end();
}

main().catch(console.error);
