const { Client } = require('pg');

async function checkAllProblemUnivs() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('Connected to DB\n');

    // 모든 문제 대학들 확인 (LIMIT 없이)
    const result = await client.query(`
      SELECT
        u.name as university_name,
        COUNT(*) as total_count,
        COUNT(ra.score_calculation) as with_score_calc,
        COUNT(*) - COUNT(ra.score_calculation) as null_count
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
      GROUP BY u.name
      ORDER BY u.name
    `);

    console.log('=== 문제 대학별 score_calculation 현황 ===\n');
    console.log('대학명                | 전체 | 유효 | NULL');
    console.log('-'.repeat(50));

    for (const row of result.rows) {
      console.log(`${row.university_name.padEnd(20)} | ${String(row.total_count).padStart(4)} | ${String(row.with_score_calc).padStart(4)} | ${String(row.null_count).padStart(4)}`);
    }

    // score_calculation이 NULL인 모집단위 확인
    const nullResult = await client.query(`
      SELECT
        u.name as university_name,
        ra.recruitment_name,
        ra.general_field_name,
        ra.score_calculation
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
        AND ra.score_calculation IS NULL
      ORDER BY u.name, ra.recruitment_name
      LIMIT 20
    `);

    if (nullResult.rows.length > 0) {
      console.log('\n\n=== score_calculation이 NULL인 모집단위 (최대 20개) ===');
      for (const row of nullResult.rows) {
        console.log(`❌ ${row.university_name} - ${row.recruitment_name} (${row.general_field_name})`);
      }
    }

    // 유효한 score_calculation 종류 확인
    const validCalcResult = await client.query(`
      SELECT DISTINCT
        u.name as university_name,
        ra.score_calculation
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
        AND ra.score_calculation IS NOT NULL
      ORDER BY u.name, ra.score_calculation
    `);

    console.log('\n\n=== 유효한 score_calculation 종류 ===');
    let currentUniv = '';
    for (const row of validCalcResult.rows) {
      if (row.university_name !== currentUniv) {
        currentUniv = row.university_name;
        console.log(`\n📍 ${currentUniv}:`);
      }
      console.log(`   - ${row.score_calculation}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAllProblemUnivs();
