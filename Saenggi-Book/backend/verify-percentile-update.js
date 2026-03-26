const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });
  await client.connect();

  console.log('=== 모집군별 백분위 데이터 검증 ===\n');

  // 모집군별 통계
  const statsQuery = `
    SELECT
      ra.admission_type,
      ra.general_field_name,
      COUNT(*) as total,
      COUNT(CASE WHEN ra.initial_cumulative_percentile IS NOT NULL THEN 1 END) as with_percentile,
      MIN(ra.initial_cumulative_percentile) as min_percentile,
      MAX(ra.initial_cumulative_percentile) as max_percentile,
      AVG(ra.initial_cumulative_percentile) as avg_percentile
    FROM ts_regular_admissions ra
    WHERE ra.year = 2026
    GROUP BY ra.admission_type, ra.general_field_name
    ORDER BY ra.admission_type, ra.general_field_name
  `;
  const stats = await client.query(statsQuery);

  let currentType = '';
  stats.rows.forEach(row => {
    if (row.admission_type !== currentType) {
      currentType = row.admission_type;
      console.log(`\n[${currentType}군]`);
    }
    const coverage = ((row.with_percentile / row.total) * 100).toFixed(1);
    console.log(`  ${row.general_field_name.padEnd(10)}: ${row.with_percentile}/${row.total} (${coverage}%) | 범위: ${Number(row.min_percentile).toFixed(2)} ~ ${Number(row.max_percentile).toFixed(2)} | 평균: ${Number(row.avg_percentile).toFixed(2)}`);
  });

  // 샘플 데이터 출력
  console.log('\n\n=== 샘플 데이터 (각 군별 상위 5개) ===');

  for (const admType of ['가', '나', '다']) {
    console.log(`\n[${admType}군 - 인문]`);
    const sample1 = await client.query(`
      SELECT u.name as university, ra.recruitment_name, ra.initial_cumulative_percentile as percentile
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.year = 2026 AND ra.admission_type = $1 AND ra.general_field_name = '인문'
      ORDER BY ra.initial_cumulative_percentile ASC NULLS LAST
      LIMIT 5
    `, [admType]);
    sample1.rows.forEach(r => console.log(`  ${r.university} ${r.recruitment_name}: ${Number(r.percentile).toFixed(2)}%`));

    console.log(`[${admType}군 - 자연]`);
    const sample2 = await client.query(`
      SELECT u.name as university, ra.recruitment_name, ra.initial_cumulative_percentile as percentile
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.year = 2026 AND ra.admission_type = $1 AND ra.general_field_name = '자연'
      ORDER BY ra.initial_cumulative_percentile ASC NULLS LAST
      LIMIT 5
    `, [admType]);
    sample2.rows.forEach(r => console.log(`  ${r.university} ${r.recruitment_name}: ${Number(r.percentile).toFixed(2)}%`));
  }

  // NULL 값 확인
  const nullCheck = await client.query(`
    SELECT COUNT(*) as count
    FROM ts_regular_admissions
    WHERE year = 2026 AND initial_cumulative_percentile IS NULL
  `);
  console.log(`\n\n=== NULL 값 확인 ===`);
  console.log(`백분위 NULL인 모집단위: ${nullCheck.rows[0].count}개`);

  await client.end();
}
main();
