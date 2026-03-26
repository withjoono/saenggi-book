/**
 * ts_regular_admissions 테이블 min_cut/max_cut 수정 스크립트
 * 200 미만 값을 10배로 복원
 */
const { Client } = require('pg');

const client = new Client({
  host: '34.64.165.158',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
  ssl: { rejectUnauthorized: false }
});

async function fixData() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 수정 전 상태 확인
    console.log('=== 수정 전 상태 (ts_regular_admissions) ===');
    const beforeResult = await client.query(`
      SELECT
        year,
        COUNT(*) FILTER (WHERE min_cut < 200 AND min_cut > 0) as min_cut_under_200,
        COUNT(*) FILTER (WHERE max_cut < 200 AND max_cut > 0) as max_cut_under_200
      FROM ts_regular_admissions
      GROUP BY year
      ORDER BY year DESC
    `);
    beforeResult.rows.forEach(row => {
      console.log(row.year + '년: min_cut<200: ' + row.min_cut_under_200 + '개, max_cut<200: ' + row.max_cut_under_200 + '개');
    });

    // 샘플 데이터 확인
    console.log('\n=== 수정될 데이터 샘플 ===');
    const sampleResult = await client.query(`
      SELECT
        ra.id,
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
        ra.min_cut as old_min,
        ra.max_cut as old_max
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.min_cut > 0 AND ra.min_cut < 200
      ORDER BY u.name, ra.recruitment_name
      LIMIT 10
    `);
    sampleResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): min ' +
        Number(row.old_min).toFixed(2) + '→' + (Number(row.old_min) * 10).toFixed(2) +
        ', max ' + Number(row.old_max).toFixed(2) + '→' + (Number(row.old_max) * 10).toFixed(2));
    });

    // min_cut 수정
    console.log('\n=== min_cut 수정 실행 ===');
    const updateMinResult = await client.query(`
      UPDATE ts_regular_admissions
      SET min_cut = min_cut * 10
      WHERE min_cut > 0 AND min_cut < 200
    `);
    console.log('✅ min_cut 수정된 행: ' + updateMinResult.rowCount + '개');

    // max_cut 수정
    console.log('\n=== max_cut 수정 실행 ===');
    const updateMaxResult = await client.query(`
      UPDATE ts_regular_admissions
      SET max_cut = max_cut * 10
      WHERE max_cut > 0 AND max_cut < 200
    `);
    console.log('✅ max_cut 수정된 행: ' + updateMaxResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 ===');
    const afterResult = await client.query(`
      SELECT
        year,
        COUNT(*) FILTER (WHERE min_cut < 200 AND min_cut > 0) as min_cut_under_200,
        COUNT(*) FILTER (WHERE max_cut < 200 AND max_cut > 0) as max_cut_under_200,
        AVG(min_cut) as avg_min_cut
      FROM ts_regular_admissions
      GROUP BY year
      ORDER BY year DESC
    `);
    afterResult.rows.forEach(row => {
      console.log(row.year + '년: min_cut<200: ' + row.min_cut_under_200 + '개, max_cut<200: ' + row.max_cut_under_200 + '개, 평균: ' + Number(row.avg_min_cut).toFixed(2));
    });

    // 가천대 의예과 확인
    console.log('\n=== 수정 후 가천대 의예과 확인 ===');
    const gachonResult = await client.query(`
      SELECT
        ra.id,
        ra.recruitment_name,
        ra.year,
        ra.min_cut,
        ra.max_cut
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
      ORDER BY ra.year DESC, ra.id
    `);
    gachonResult.rows.forEach(row => {
      console.log('ID ' + row.id + ' ' + row.recruitment_name + ' (' + row.year + '): min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2));
    });

    console.log('\n✅ 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
