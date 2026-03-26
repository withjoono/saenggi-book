/**
 * 운영 DB 2022년 입결 데이터 수정 스크립트
 * 2022년 min_cut 값을 10배로 복원
 */
const { Client } = require('pg');

const client = new Client({
  host: '34.64.165.158',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixData() {
  try {
    await client.connect();
    console.log('✅ 운영 DB 연결 성공\n');

    // 수정 전 상태 확인
    console.log('=== 수정 전 2022년 데이터 상태 ===');
    const beforeResult = await client.query(`
      SELECT
        COUNT(*) as total_count,
        COUNT(min_cut) as has_min_cut,
        MIN(min_cut) as min_val,
        MAX(min_cut) as max_val,
        AVG(min_cut) as avg_val
      FROM ts_regular_admission_previous_results
      WHERE year = 2022
    `);
    const before = beforeResult.rows[0];
    console.log('총 데이터: ' + before.total_count + '개');
    console.log('min_cut 있는 데이터: ' + before.has_min_cut + '개');
    console.log('범위: ' + Number(before.min_val).toFixed(2) + ' ~ ' + Number(before.max_val).toFixed(2));
    console.log('평균: ' + Number(before.avg_val).toFixed(2));

    // 영향받는 데이터 샘플
    console.log('\n=== 수정될 데이터 샘플 ===');
    const sampleResult = await client.query(`
      SELECT
        u.name as univ_name,
        ra.recruitment_name,
        pr.min_cut as old_val,
        pr.min_cut * 10 as new_val
      FROM ts_regular_admission_previous_results pr
      JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE pr.year = 2022 AND pr.min_cut IS NOT NULL AND pr.min_cut < 200
      ORDER BY u.name
      LIMIT 10
    `);
    sampleResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ': ' +
        Number(row.old_val).toFixed(2) + ' → ' + Number(row.new_val).toFixed(2));
    });

    // 실제 수정 쿼리 실행
    console.log('\n=== 2022년 min_cut 값 10배 복원 실행 ===');
    const updateResult = await client.query(`
      UPDATE ts_regular_admission_previous_results
      SET min_cut = min_cut * 10
      WHERE year = 2022 AND min_cut IS NOT NULL AND min_cut < 200
    `);
    console.log('✅ 수정된 행: ' + updateResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 2022년 데이터 상태 ===');
    const afterResult = await client.query(`
      SELECT
        MIN(min_cut) as min_val,
        MAX(min_cut) as max_val,
        AVG(min_cut) as avg_val,
        COUNT(*) FILTER (WHERE min_cut < 200) as under_200_count
      FROM ts_regular_admission_previous_results
      WHERE year = 2022 AND min_cut IS NOT NULL
    `);
    const after = afterResult.rows[0];
    console.log('범위: ' + Number(after.min_val).toFixed(2) + ' ~ ' + Number(after.max_val).toFixed(2));
    console.log('평균: ' + Number(after.avg_val).toFixed(2));
    console.log('200 미만 데이터: ' + after.under_200_count + '개 (0이어야 함)');

    console.log('\n✅ 2022년 min_cut 수정 완료!');
    console.log('⚠️  max_cut(70%컷)은 별도 임포트 필요합니다.');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
