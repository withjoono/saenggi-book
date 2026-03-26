const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkRecruitmentScores() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 테이블 존재 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'ts_member_jungsi_recruitment_scores'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ ts_member_jungsi_recruitment_scores 테이블이 없습니다.');
      return;
    }

    // 대전통합 실패 이유 확인
    console.log('=== 대전통합 점수 현황 ===\n');
    const result = await client.query(`
      SELECT
        member_id,
        university_name,
        recruitment_name,
        score_calculation,
        converted_score,
        success,
        failure_reason,
        calculated_at
      FROM ts_member_jungsi_recruitment_scores
      WHERE score_calculation = '대전통합'
      ORDER BY calculated_at DESC
      LIMIT 20
    `);

    if (result.rows.length === 0) {
      console.log('⚠️ 대전통합 점수 기록이 없습니다.');
    } else {
      console.log('회원ID | 성공 | 점수 | 실패사유 | 계산시간');
      console.log('-'.repeat(70));
      for (const row of result.rows) {
        const calcTime = row.calculated_at ? row.calculated_at.toISOString().replace('T', ' ').substring(0, 19) : 'N/A';
        const score = row.converted_score ? Number(row.converted_score).toFixed(2) : 'N/A';
        console.log(row.member_id + ' | ' + (row.success ? '✅' : '❌') + ' | ' + score + ' | ' + (row.failure_reason || '-') + ' | ' + calcTime);
      }
    }

    // 대전대 전체 점수 현황
    console.log('\n\n=== 대전대 점수 현황 (success별) ===');
    const daejeonResult = await client.query(`
      SELECT
        score_calculation,
        success,
        COUNT(*) as count,
        string_agg(DISTINCT failure_reason, ', ') as failure_reasons
      FROM ts_member_jungsi_recruitment_scores
      WHERE university_name LIKE '%대전대%'
      GROUP BY score_calculation, success
      ORDER BY score_calculation, success
    `);

    for (const row of daejeonResult.rows) {
      const status = row.success ? '✅ 성공' : '❌ 실패';
      console.log(row.score_calculation + ' | ' + status + ' | ' + row.count + '개' + (row.failure_reasons ? ' | 사유: ' + row.failure_reasons : ''));
    }

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkRecruitmentScores();
