/**
 * 운영 DB 입결 데이터 수정 스크립트
 * min_cut 값을 10배로 복원
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
    console.log('=== 수정 전 상태 ===');
    const beforeResult = await client.query(`
      SELECT
        MIN(min_cut) as min_val,
        MAX(min_cut) as max_val,
        AVG(min_cut) as avg_val,
        COUNT(*) as count
      FROM ts_regular_admission_previous_results
      WHERE min_cut IS NOT NULL AND min_cut < 200
    `);
    const before = beforeResult.rows[0];
    console.log('90점대 이하 데이터: ' + before.count + '개');
    console.log('범위: ' + Number(before.min_val).toFixed(2) + ' ~ ' + Number(before.max_val).toFixed(2));
    console.log('평균: ' + Number(before.avg_val).toFixed(2));

    // DRY RUN - 영향받는 데이터 확인
    console.log('\n=== 영향받는 데이터 샘플 (수정 전 → 수정 후) ===');
    const sampleResult = await client.query(`
      SELECT
        pr.id,
        u.name as univ_name,
        ra.recruitment_name,
        pr.year,
        pr.min_cut as old_min_cut,
        pr.min_cut * 10 as new_min_cut
      FROM ts_regular_admission_previous_results pr
      JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE pr.min_cut IS NOT NULL AND pr.min_cut < 200
      ORDER BY u.name, ra.recruitment_name, pr.year DESC
      LIMIT 10
    `);
    sampleResult.rows.forEach(row => {
      console.log(row.univ_name + ' ' + row.recruitment_name + ' ' + row.year + '년: ' +
        Number(row.old_min_cut).toFixed(2) + ' → ' + Number(row.new_min_cut).toFixed(2));
    });

    // 사용자 확인 (실제 실행 시 주석 해제)
    console.log('\n⚠️  DRY RUN 모드입니다.');
    console.log('실제 수정을 원하시면 아래 UPDATE 쿼리의 주석을 해제하세요.\n');

    /*
    // 실제 수정 쿼리
    console.log('\n=== min_cut 값 10배 복원 실행 ===');
    const updateResult = await client.query(`
      UPDATE ts_regular_admission_previous_results
      SET min_cut = min_cut * 10
      WHERE min_cut IS NOT NULL AND min_cut < 200
    `);
    console.log('✅ 수정된 행: ' + updateResult.rowCount + '개');

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 ===');
    const afterResult = await client.query(`
      SELECT
        MIN(min_cut) as min_val,
        MAX(min_cut) as max_val,
        AVG(min_cut) as avg_val,
        COUNT(*) as count
      FROM ts_regular_admission_previous_results
      WHERE min_cut IS NOT NULL AND min_cut < 200
    `);
    const after = afterResult.rows[0];
    console.log('90점대 이하 데이터: ' + after.count + '개 (0이어야 함)');
    */

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
