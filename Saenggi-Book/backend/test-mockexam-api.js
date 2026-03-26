const { Client } = require('pg');

async function testMockExamAPI() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        ms.standard_score,
        ms.grade,
        ms.percentile,
        ms.subject_code,
        sch.mockexam_year,
        sch.mockexam_month
      FROM mockexam_standard_score_tb ms
      LEFT JOIN mockexam_schedule_tb sch ON ms.schedule_id = sch.id
      WHERE ms.member_id = 1
      ORDER BY ms.id
    `);

    console.log('\n=== Mock Exam Standard Scores (member_id=1) ===\n');
    console.log(JSON.stringify(result.rows, null, 2));

    // 백엔드 서비스와 동일한 포맷으로 변환
    const formattedData = result.rows.map(score => ({
      code: score.subject_code,
      grade: score.grade.toString(),
      standard_score: score.standard_score.toString(),
      percentile: score.percentile
    }));

    console.log('\n=== Formatted API Response (Expected by Frontend) ===\n');
    console.log(JSON.stringify(formattedData, null, 2));

    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

testMockExamAPI();
