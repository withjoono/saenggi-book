const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkSubjectCodes() {
  try {
    await client.connect();
    console.log('Connected\n');

    // subject_code 목록
    console.log('=== subject_code 종류 ===');
    const codeResult = await client.query(`
      SELECT DISTINCT subject_code, COUNT(*) as count
      FROM mockexam_standard_score_tb
      GROUP BY subject_code
      ORDER BY subject_code
    `);
    for (const row of codeResult.rows) {
      console.log('  ' + row.subject_code + ': ' + row.count + '개');
    }

    // 회원 3의 점수 상세
    console.log('\n=== 회원 3의 모든 점수 ===');
    const scoreResult = await client.query(`
      SELECT subject_code, standard_score, grade, percentile
      FROM mockexam_standard_score_tb
      WHERE member_id = 3
      ORDER BY subject_code
    `);
    for (const row of scoreResult.rows) {
      console.log('  ' + row.subject_code + ': 표점=' + row.standard_score + ', 등급=' + row.grade + ', 백분위=' + row.percentile);
    }

    // subject_code_list_entity 테이블 확인
    console.log('\n=== subject_code_list 테이블 존재 확인 ===');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name LIKE '%subject%code%'
      );
    `);
    
    const subjectTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE '%subject%'
      ORDER BY table_name
    `);
    console.log('subject 관련 테이블:');
    for (const row of subjectTables.rows) {
      console.log('  -', row.table_name);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSubjectCodes();
