/**
 * ts_regular_admissions 테이블 total_score 수정 스크립트
 * 100인 값을 1000으로 복원 (10배)
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
    console.log('=== 수정 전 total_score 상태 ===');
    const beforeResult = await client.query(`
      SELECT
        total_score,
        COUNT(*) as count
      FROM ts_regular_admissions
      WHERE total_score IS NOT NULL
      GROUP BY total_score
      ORDER BY total_score
    `);
    beforeResult.rows.forEach(row => {
      console.log('total_score=' + row.total_score + ': ' + row.count + '개');
    });

    // 샘플 데이터 확인 (total_score = 100인 데이터)
    console.log('\n=== total_score=100 샘플 데이터 ===');
    const sampleResult = await client.query(`
      SELECT
        ra.id,
        u.name as univ_name,
        ra.recruitment_name,
        ra.year,
        ra.total_score,
        ra.min_cut,
        ra.max_cut
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.total_score = 100
      ORDER BY u.name, ra.recruitment_name
      LIMIT 10
    `);
    sampleResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' (' + row.year + '): total=' + row.total_score + ', min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2));
    });

    // total_score = 100인 데이터를 1000으로 수정
    console.log('\n=== total_score 수정 실행 ===');
    const updateResult = await client.query(`
      UPDATE ts_regular_admissions
      SET total_score = total_score * 10
      WHERE total_score = 100
    `);
    console.log('✅ total_score 수정된 행: ' + updateResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 total_score 상태 ===');
    const afterResult = await client.query(`
      SELECT
        total_score,
        COUNT(*) as count
      FROM ts_regular_admissions
      WHERE total_score IS NOT NULL
      GROUP BY total_score
      ORDER BY total_score
    `);
    afterResult.rows.forEach(row => {
      console.log('total_score=' + row.total_score + ': ' + row.count + '개');
    });

    // 가천대 의예과 확인
    console.log('\n=== 수정 후 가천대 의예과 확인 ===');
    const gachonResult = await client.query(`
      SELECT
        ra.id,
        ra.recruitment_name,
        ra.year,
        ra.total_score,
        ra.min_cut,
        ra.max_cut
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
      ORDER BY ra.year DESC, ra.id
    `);
    gachonResult.rows.forEach(row => {
      console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name + ': total=' + row.total_score + ', min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2));
    });

    console.log('\n✅ total_score 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
