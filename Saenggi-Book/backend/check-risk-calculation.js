/**
 * 위험도 계산 규칙 조회 스크립트
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

async function checkRiskCalculation() {
  const client = await pool.connect();

  try {
    console.log('📊 위험도 계산 규칙 조회...\n');

    // 1. RecruitmentUnitScore 테이블에서 위험도 값들 샘플 조회
    const query = `
      SELECT
        rms.recruitment_unit_id,
        ru.name as recruitment_name,
        u.name as university_name,
        rms.grade_50_cut,
        rms.grade_70_cut,
        rms.risk_plus_5,
        rms.risk_plus_4,
        rms.risk_plus_3,
        rms.risk_plus_2,
        rms.risk_plus_1,
        rms.risk_minus_1,
        rms.risk_minus_2,
        rms.risk_minus_3,
        rms.risk_minus_4,
        rms.risk_minus_5
      FROM ss_recruitment_unit_score rms
      JOIN ss_recruitment_unit ru ON rms.recruitment_unit_id = ru.id
      JOIN ss_admission adm ON ru.admission_id = adm.id
      JOIN ss_university u ON adm.university_id = u.id
      WHERE rms.risk_plus_1 IS NOT NULL
      LIMIT 10
    `;

    const result = await client.query(query);

    console.log(`✅ 위험도 데이터 샘플 (${result.rows.length}개):\n`);

    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.university_name} - ${row.recruitment_name}`);
      console.log(`   등급50컷: ${row.grade_50_cut}, 등급70컷: ${row.grade_70_cut}`);
      console.log(`   위험도 +5: ${row.risk_plus_5}`);
      console.log(`   위험도 +4: ${row.risk_plus_4}`);
      console.log(`   위험도 +3: ${row.risk_plus_3}`);
      console.log(`   위험도 +2: ${row.risk_plus_2}`);
      console.log(`   위험도 +1: ${row.risk_plus_1}`);
      console.log(`   위험도 -1: ${row.risk_minus_1}`);
      console.log(`   위험도 -2: ${row.risk_minus_2}`);
      console.log(`   위험도 -3: ${row.risk_minus_3}`);
      console.log(`   위험도 -4: ${row.risk_minus_4}`);
      console.log(`   위험도 -5: ${row.risk_minus_5}\n`);
    });

    // 2. 대학 레벨별 패턴 분석
    const levelQuery = `
      SELECT
        ul.level,
        AVG(rms.risk_plus_1) as avg_risk_plus_1,
        AVG(rms.risk_plus_2) as avg_risk_plus_2,
        AVG(rms.risk_plus_3) as avg_risk_plus_3,
        AVG(rms.risk_plus_4) as avg_risk_plus_4,
        AVG(rms.risk_plus_5) as avg_risk_plus_5,
        COUNT(*) as count
      FROM ss_recruitment_unit_score rms
      JOIN ss_recruitment_unit ru ON rms.recruitment_unit_id = ru.id
      JOIN ss_admission adm ON ru.admission_id = adm.id
      JOIN ss_university u ON adm.university_id = u.id
      JOIN ss_university_level ul ON u.name = ul.university_name
      WHERE rms.risk_plus_1 IS NOT NULL
      GROUP BY ul.level
      ORDER BY ul.level DESC
    `;

    const levelResult = await client.query(levelQuery);

    console.log('\n📈 대학 레벨별 평균 위험도:');
    console.log('레벨\t+1등급\t+2등급\t+3등급\t+4등급\t+5등급\t개수');
    levelResult.rows.forEach(row => {
      console.log(
        `${row.level}\t${row.avg_risk_plus_1?.toFixed(1) || '-'}\t` +
        `${row.avg_risk_plus_2?.toFixed(1) || '-'}\t` +
        `${row.avg_risk_plus_3?.toFixed(1) || '-'}\t` +
        `${row.avg_risk_plus_4?.toFixed(1) || '-'}\t` +
        `${row.avg_risk_plus_5?.toFixed(1) || '-'}\t` +
        `${row.count}`
      );
    });

  } catch (error) {
    console.error('❌ 조회 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRiskCalculation();
