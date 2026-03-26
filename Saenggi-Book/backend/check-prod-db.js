const { Client } = require('pg');

async function checkProdDB() {
  // 로컬 개발 DB 사용
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('Connected to production DB\n');

    // 문제 대학들의 score_calculation 값 확인
    const result = await client.query(`
      SELECT
        u.name as university_name,
        ra.recruitment_name,
        ra.score_calculation,
        ra.general_field_name
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%조선대%', '%전북대%'])
      ORDER BY u.name, ra.recruitment_name
      LIMIT 100
    `);

    console.log(`=== 문제 대학들의 score_calculation 값 (${result.rows.length}개) ===\n`);

    let nullCount = 0;
    let emptyCount = 0;
    let validCount = 0;

    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.university_name]) {
        grouped[row.university_name] = [];
      }
      grouped[row.university_name].push(row);

      if (row.score_calculation === null) nullCount++;
      else if (row.score_calculation === '') emptyCount++;
      else validCount++;
    }

    for (const [univ, rows] of Object.entries(grouped)) {
      console.log(`\n📍 ${univ} (${rows.length}개 모집단위)`);
      console.log('-'.repeat(60));

      const validRows = rows.filter(r => r.score_calculation && r.score_calculation !== '');
      const invalidRows = rows.filter(r => !r.score_calculation || r.score_calculation === '');

      if (validRows.length > 0) {
        console.log(`  ✅ 유효한 score_calculation:`);
        const uniqueCalcs = [...new Set(validRows.map(r => r.score_calculation))];
        uniqueCalcs.forEach(calc => {
          const count = validRows.filter(r => r.score_calculation === calc).length;
          console.log(`     - "${calc}" (${count}개 모집단위)`);
        });
      }

      if (invalidRows.length > 0) {
        console.log(`  ❌ NULL 또는 빈값: ${invalidRows.length}개`);
        invalidRows.slice(0, 3).forEach(r => {
          console.log(`     - ${r.recruitment_name} (${r.general_field_name})`);
        });
        if (invalidRows.length > 3) {
          console.log(`     ... 외 ${invalidRows.length - 3}개`);
        }
      }
    }

    console.log('\n\n=== 요약 ===');
    console.log(`유효한 score_calculation: ${validCount}개`);
    console.log(`NULL: ${nullCount}개`);
    console.log(`빈 문자열: ${emptyCount}개`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkProdDB();
