const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkCalcTimes() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 계산된 점수의 시간대 확인
    console.log('=== 계산된 점수의 생성 시간 분포 ===\n');
    const timeResult = await client.query(`
      SELECT
        DATE(calculated_at) as calc_date,
        COUNT(*) as count,
        COUNT(DISTINCT member_id) as member_count
      FROM ts_member_jungsi_calculated_scores
      GROUP BY DATE(calculated_at)
      ORDER BY calc_date DESC
    `);

    console.log('날짜          | 점수 수 | 회원 수');
    console.log('-'.repeat(40));
    for (const row of timeResult.rows) {
      console.log(row.calc_date.toISOString().split('T')[0] + ' | ' + String(row.count).padStart(7) + ' | ' + String(row.member_count).padStart(7));
    }

    // 대전대 점수의 계산 시간
    console.log('\n\n=== 대전대 점수 상세 ===');
    const daejeonResult = await client.query(`
      SELECT
        member_id,
        university_name,
        score_calculation,
        converted_score,
        calculated_at
      FROM ts_member_jungsi_calculated_scores
      WHERE university_name LIKE '%대전대%'
      ORDER BY calculated_at DESC, score_calculation
    `);

    console.log('회원ID | 대학명 | 환산식 | 점수 | 계산시간');
    console.log('-'.repeat(70));
    for (const row of daejeonResult.rows) {
      const calcTime = row.calculated_at ? row.calculated_at.toISOString().replace('T', ' ').substring(0, 19) : 'N/A';
      const score = row.converted_score ? Number(row.converted_score).toFixed(2) : 'N/A';
      console.log(row.member_id + ' | ' + row.university_name + ' | ' + row.score_calculation + ' | ' + score + ' | ' + calcTime);
    }

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkCalcTimes();
