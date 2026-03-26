/**
 * Cloud SQL Proxy를 통해 운영 DB 확인
 */
const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,  // 운영 Cloud SQL Proxy 포트
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkProdDB() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공 (geobukschool_prod via Cloud SQL Proxy)\n');

    // 문제 대학들의 2026년 score_calculation 현황
    console.log('=== 문제 대학별 score_calculation 현황 (2026년) ===\n');
    const result = await client.query(`
      SELECT
        u.name as university_name,
        COUNT(*) as total_count,
        COUNT(ra.score_calculation) as with_score_calc,
        COUNT(*) - COUNT(ra.score_calculation) as null_count
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.year = 2026
        AND u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
      GROUP BY u.name
      ORDER BY u.name
    `);

    console.log('대학명                | 전체 | 유효 | NULL');
    console.log('-'.repeat(50));

    let totalNull = 0;
    for (const row of result.rows) {
      const nullCount = parseInt(row.null_count);
      totalNull += nullCount;
      const marker = nullCount > 0 ? '❌' : '✅';
      console.log(`${marker} ${row.university_name.padEnd(18)} | ${String(row.total_count).padStart(4)} | ${String(row.with_score_calc).padStart(4)} | ${String(row.null_count).padStart(4)}`);
    }

    console.log('-'.repeat(50));
    console.log(`총 NULL 수: ${totalNull}개`);

    if (totalNull > 0) {
      // NULL인 모집단위 상세 확인
      console.log('\n\n=== score_calculation이 NULL인 모집단위 (최대 30개) ===');
      const nullResult = await client.query(`
        SELECT
          u.name as university_name,
          ra.recruitment_name,
          ra.general_field_name
        FROM ts_regular_admissions ra
        JOIN ts_universities u ON ra.university_id = u.id
        WHERE ra.year = 2026
          AND u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
          AND ra.score_calculation IS NULL
        ORDER BY u.name, ra.recruitment_name
        LIMIT 30
      `);

      for (const row of nullResult.rows) {
        console.log(`❌ ${row.university_name} - ${row.recruitment_name} (${row.general_field_name})`);
      }
    } else {
      console.log('\n✅ 모든 문제 대학의 score_calculation이 정상적으로 설정되어 있습니다!');

      // 유효한 score_calculation 값 확인
      console.log('\n\n=== 유효한 score_calculation 종류 ===');
      const validResult = await client.query(`
        SELECT DISTINCT
          u.name as university_name,
          ra.score_calculation
        FROM ts_regular_admissions ra
        JOIN ts_universities u ON ra.university_id = u.id
        WHERE ra.year = 2026
          AND u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
          AND ra.score_calculation IS NOT NULL
        ORDER BY u.name, ra.score_calculation
      `);

      let currentUniv = '';
      for (const row of validResult.rows) {
        if (row.university_name !== currentUniv) {
          currentUniv = row.university_name;
          console.log(`\n📍 ${currentUniv}:`);
        }
        console.log(`   - ${row.score_calculation}`);
      }
    }

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

checkProdDB();
