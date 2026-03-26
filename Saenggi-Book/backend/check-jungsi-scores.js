const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkJungsiScores() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 테이블 구조 확인
    const structResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'ts_member_jungsi_calculated_scores'
      ORDER BY ordinal_position
    `);
    console.log('=== ts_member_jungsi_calculated_scores 테이블 구조 ===');
    for (const row of structResult.rows) {
      console.log('  -', row.column_name, '(' + row.data_type + ')');
    }

    // 문제 대학들의 계산된 점수 현황
    console.log('\n\n=== 문제 대학별 계산된 점수 현황 ===\n');
    const result = await client.query(`
      SELECT
        university_name,
        score_calculation,
        COUNT(*) as member_count,
        AVG(converted_score) as avg_score
      FROM ts_member_jungsi_calculated_scores
      WHERE university_name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
      GROUP BY university_name, score_calculation
      ORDER BY university_name, score_calculation
    `);

    if (result.rows.length === 0) {
      console.log('⚠️ 문제 대학들에 대한 계산된 점수가 없습니다.');
    } else {
      console.log('대학명                | 환산식         | 회원수 | 평균점수');
      console.log('-'.repeat(65));
      for (const row of result.rows) {
        const avgScore = row.avg_score ? Number(row.avg_score).toFixed(2) : 'N/A';
        console.log(row.university_name.padEnd(20) + ' | ' + (row.score_calculation || 'NULL').padEnd(14) + ' | ' + String(row.member_count).padStart(6) + ' | ' + avgScore);
      }
    }

    // 전체 현황
    const totalResult = await client.query(`
      SELECT
        COUNT(DISTINCT member_id) as member_count,
        COUNT(DISTINCT university_name) as univ_count,
        COUNT(*) as total_scores
      FROM ts_member_jungsi_calculated_scores
    `);
    console.log('\n\n=== 전체 계산된 점수 현황 ===');
    console.log('회원 수:', totalResult.rows[0].member_count);
    console.log('대학 수:', totalResult.rows[0].univ_count);
    console.log('총 점수 수:', totalResult.rows[0].total_scores);

    // 0점인 경우 확인
    console.log('\n\n=== converted_score가 0 또는 NULL인 레코드 (문제 대학) ===');
    const zeroResult = await client.query(`
      SELECT
        university_name,
        score_calculation,
        COUNT(*) as count
      FROM ts_member_jungsi_calculated_scores
      WHERE university_name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
        AND (converted_score IS NULL OR converted_score = 0)
      GROUP BY university_name, score_calculation
      ORDER BY university_name
    `);

    if (zeroResult.rows.length === 0) {
      console.log('✅ 0 또는 NULL인 점수가 없습니다.');
    } else {
      for (const row of zeroResult.rows) {
        console.log('❌', row.university_name, '(' + row.score_calculation + '):', row.count + '개');
      }
    }

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkJungsiScores();
