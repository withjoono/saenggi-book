/**
 * ts_member_jungsi_calculated_scores의 university_id를
 * ts_regular_admissions의 올바른 university_id로 수정하는 스크립트
 *
 * 문제: 환산점수 저장 시 잘못된 university_id가 저장됨
 * 해결: score_calculation(환산인자명)을 기준으로 올바른 university_id 매핑
 *
 * 유니크 인덱스: (member_id, university_id, score_calculation_code)
 * → 중복 발생 시 기존 잘못된 데이터 삭제 후 업데이트
 *
 * 사용법:
 *   node fix-calculated-scores-university-id.js [local|prod]
 */

const { Client } = require('pg');

const configs = {
  local: {
    host: 'localhost',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  },
  prod: {
    host: 'localhost',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  },
};

async function fixUniversityIds(env) {
  const config = configs[env];
  if (!config) {
    console.error('사용법: node fix-calculated-scores-university-id.js [local|prod]');
    process.exit(1);
  }

  const client = new Client(config);
  await client.connect();
  console.log(`${env} DB 연결 성공 (포트 ${config.port})`);

  try {
    // 1. ts_regular_admissions에서 score_calculation → university_id 매핑 테이블 생성
    console.log('\n=== 1단계: score_calculation → university_id 매핑 조회 ===');
    const mappingResult = await client.query(`
      SELECT DISTINCT ra.score_calculation, u.id as correct_university_id, u.name as university_name
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.score_calculation IS NOT NULL AND ra.year = 2026
      ORDER BY ra.score_calculation
    `);

    const scoreToUnivMap = new Map();
    for (const row of mappingResult.rows) {
      scoreToUnivMap.set(row.score_calculation, {
        universityId: row.correct_university_id,
        universityName: row.university_name,
      });
    }
    console.log(`매핑 테이블 생성 완료: ${scoreToUnivMap.size}개 환산인자`);

    // 2. 잘못된 university_id를 가진 데이터 삭제 (올바른 데이터가 이미 있는 경우)
    console.log('\n=== 2단계: 중복 데이터 정리 ===');

    // 각 환산인자별로 올바른 university_id가 있으면, 잘못된 것은 삭제
    let deleteCount = 0;
    for (const [scoreCalc, mapping] of scoreToUnivMap) {
      // 올바른 university_id를 가진 행이 있는지 확인
      const correctResult = await client.query(`
        SELECT id FROM ts_member_jungsi_calculated_scores
        WHERE score_calculation = $1 AND university_id = $2
      `, [scoreCalc, mapping.universityId]);

      if (correctResult.rows.length > 0) {
        // 올바른 데이터가 있으면, 잘못된 university_id를 가진 행 삭제
        const deleteResult = await client.query(`
          DELETE FROM ts_member_jungsi_calculated_scores
          WHERE score_calculation = $1 AND university_id != $2
          RETURNING id
        `, [scoreCalc, mapping.universityId]);
        deleteCount += deleteResult.rowCount;
      }
    }
    console.log(`중복 데이터 삭제: ${deleteCount}개`);

    // 3. 이제 남은 잘못된 데이터 업데이트
    console.log('\n=== 3단계: 남은 데이터 업데이트 ===');
    const wrongDataResult = await client.query(`
      SELECT cs.id, cs.member_id, cs.score_calculation, cs.score_calculation_code,
             cs.university_id as current_univ_id, cs.university_name
      FROM ts_member_jungsi_calculated_scores cs
    `);

    let updateCount = 0;
    let skipCount = 0;

    for (const row of wrongDataResult.rows) {
      const mapping = scoreToUnivMap.get(row.score_calculation);
      if (!mapping) {
        skipCount++;
        continue;
      }

      if (row.current_univ_id !== mapping.universityId) {
        // 중복 체크: 이미 같은 (member_id, university_id, score_calculation_code) 조합이 있는지
        const duplicateCheck = await client.query(`
          SELECT id FROM ts_member_jungsi_calculated_scores
          WHERE member_id = $1 AND university_id = $2 AND score_calculation_code = $3 AND id != $4
        `, [row.member_id, mapping.universityId, row.score_calculation_code, row.id]);

        if (duplicateCheck.rows.length > 0) {
          // 중복이 있으면 현재 행 삭제
          await client.query(`DELETE FROM ts_member_jungsi_calculated_scores WHERE id = $1`, [row.id]);
        } else {
          // 중복 없으면 업데이트
          await client.query(`
            UPDATE ts_member_jungsi_calculated_scores
            SET university_id = $1
            WHERE id = $2
          `, [mapping.universityId, row.id]);
        }
        updateCount++;
      }
    }
    console.log(`업데이트/삭제 완료: ${updateCount}개`);
    console.log(`스킵 (매핑 없음): ${skipCount}개`);

    // 4. ts_member_jungsi_recruitment_scores도 동일하게 수정
    console.log('\n=== 4단계: recruitment_scores 테이블도 수정 ===');

    // 먼저 중복 삭제
    let recruitDeleteCount = 0;
    for (const [scoreCalc, mapping] of scoreToUnivMap) {
      const correctResult = await client.query(`
        SELECT id FROM ts_member_jungsi_recruitment_scores
        WHERE score_calculation = $1 AND university_id = $2
      `, [scoreCalc, mapping.universityId]);

      if (correctResult.rows.length > 0) {
        const deleteResult = await client.query(`
          DELETE FROM ts_member_jungsi_recruitment_scores
          WHERE score_calculation = $1 AND university_id != $2
          RETURNING id
        `, [scoreCalc, mapping.universityId]);
        recruitDeleteCount += deleteResult.rowCount;
      }
    }
    console.log(`recruitment_scores 중복 삭제: ${recruitDeleteCount}개`);

    // 남은 데이터 업데이트
    const recruitmentResult = await client.query(`
      SELECT rs.id, rs.member_id, rs.score_calculation, rs.university_id as current_univ_id, rs.regular_admission_id
      FROM ts_member_jungsi_recruitment_scores rs
    `);

    let recruitmentUpdateCount = 0;
    for (const row of recruitmentResult.rows) {
      const mapping = scoreToUnivMap.get(row.score_calculation);
      if (mapping && row.current_univ_id !== mapping.universityId) {
        // 중복 체크
        const duplicateCheck = await client.query(`
          SELECT id FROM ts_member_jungsi_recruitment_scores
          WHERE member_id = $1 AND regular_admission_id = $2 AND id != $3
        `, [row.member_id, row.regular_admission_id, row.id]);

        if (duplicateCheck.rows.length > 0) {
          await client.query(`DELETE FROM ts_member_jungsi_recruitment_scores WHERE id = $1`, [row.id]);
        } else {
          await client.query(`
            UPDATE ts_member_jungsi_recruitment_scores
            SET university_id = $1
            WHERE id = $2
          `, [mapping.universityId, row.id]);
        }
        recruitmentUpdateCount++;
      }
    }
    console.log(`recruitment_scores 업데이트/삭제 완료: ${recruitmentUpdateCount}개`);

    // 5. 검증
    console.log('\n=== 5단계: 수정 결과 검증 ===');
    const verifyResult = await client.query(`
      SELECT COUNT(*) as mismatch_count
      FROM ts_member_jungsi_calculated_scores cs
      JOIN ts_regular_admissions ra ON cs.score_calculation = ra.score_calculation AND ra.year = 2026
      WHERE cs.university_id != ra.university_id
    `);

    console.log(`불일치 행 수: ${verifyResult.rows[0].mismatch_count}`);

    // 가천대, 가톨릭대 샘플 확인
    const sampleResult = await client.query(`
      SELECT cs.score_calculation, cs.university_id, cs.university_name
      FROM ts_member_jungsi_calculated_scores cs
      WHERE cs.score_calculation LIKE '가천%' OR cs.score_calculation LIKE '가톨릭%'
      LIMIT 10
    `);
    console.log('\n가천대/가톨릭대 샘플:');
    sampleResult.rows.forEach((r) => console.log(`  ${r.score_calculation}: univ_id=${r.university_id} (${r.university_name})`));

    console.log('\n완료!');

  } catch (error) {
    console.error('오류 발생:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

// 실행
const env = process.argv[2] || 'prod';
fixUniversityIds(env);
