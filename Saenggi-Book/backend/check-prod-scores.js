/**
 * 프로덕션 DB에서 문제 대학들의 계산된 점수 확인
 */
const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkProdScores() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // member_calculated_scores 테이블 존재 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'member_calculated_scores'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ member_calculated_scores 테이블이 없습니다.');
      return;
    }

    // 문제 대학들의 계산된 점수 현황
    console.log('=== 문제 대학별 계산된 점수 현황 ===\n');
    const result = await client.query(`
      SELECT
        mcs.university_name,
        mcs.score_calculation,
        COUNT(*) as member_count,
        AVG(mcs.converted_score) as avg_score
      FROM member_calculated_scores mcs
      WHERE mcs.university_name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
      GROUP BY mcs.university_name, mcs.score_calculation
      ORDER BY mcs.university_name, mcs.score_calculation
    `);

    if (result.rows.length === 0) {
      console.log('⚠️ 문제 대학들에 대한 계산된 점수가 없습니다.\n');

      // 전체 계산된 점수 현황 확인
      const totalResult = await client.query(`
        SELECT
          COUNT(DISTINCT member_id) as member_count,
          COUNT(DISTINCT university_name) as univ_count,
          COUNT(*) as total_scores
        FROM member_calculated_scores
      `);
      console.log('=== 전체 계산된 점수 현황 ===');
      console.log('회원 수:', totalResult.rows[0].member_count);
      console.log('대학 수:', totalResult.rows[0].univ_count);
      console.log('총 점수 수:', totalResult.rows[0].total_scores);

      // 최근 계산된 대학 샘플
      const sampleResult = await client.query(`
        SELECT DISTINCT university_name
        FROM member_calculated_scores
        ORDER BY university_name
        LIMIT 20
      `);
      console.log('\n=== 계산된 대학 샘플 (20개) ===');
      for (const row of sampleResult.rows) {
        console.log('  -', row.university_name);
      }
    } else {
      console.log('대학명                | 환산식         | 회원수 | 평균점수');
      console.log('-'.repeat(65));
      for (const row of result.rows) {
        const avgScore = row.avg_score ? Number(row.avg_score).toFixed(2) : 'N/A';
        console.log(row.university_name.padEnd(20) + ' | ' + (row.score_calculation || 'NULL').padEnd(14) + ' | ' + String(row.member_count).padStart(6) + ' | ' + avgScore);
      }
    }

    // converted_score가 0이거나 NULL인 경우 확인
    console.log('\n\n=== converted_score가 0 또는 NULL인 레코드 ===');
    const zeroResult = await client.query(`
      SELECT
        university_name,
        score_calculation,
        COUNT(*) as count
      FROM member_calculated_scores
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

checkProdScores();
