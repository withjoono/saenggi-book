/**
 * ts_regular_admissions 테이블 위험도 점수(risk_*) 수정 스크립트
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
    console.log('=== 수정 전 가천대 의예과 위험도 ===');
    const beforeResult = await client.query(`
      SELECT
        ra.id,
        ra.recruitment_name,
        ra.year,
        ra.risk_plus_5,
        ra.risk_plus_1,
        ra.risk_minus_1,
        ra.risk_minus_5
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
      ORDER BY ra.year DESC
    `);
    beforeResult.rows.forEach(row => {
      console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name);
      console.log('  +5=' + Number(row.risk_plus_5).toFixed(2) + ', +1=' + Number(row.risk_plus_1).toFixed(2) + ', -1=' + Number(row.risk_minus_1).toFixed(2) + ', -5=' + Number(row.risk_minus_5).toFixed(2));
    });

    // 200 미만인 위험도 데이터 개수 확인
    console.log('\n=== 200 미만 위험도 데이터 개수 ===');
    const countResult = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE risk_plus_5 > 0 AND risk_plus_5 < 200) as plus5,
        COUNT(*) FILTER (WHERE risk_plus_4 > 0 AND risk_plus_4 < 200) as plus4,
        COUNT(*) FILTER (WHERE risk_plus_3 > 0 AND risk_plus_3 < 200) as plus3,
        COUNT(*) FILTER (WHERE risk_plus_2 > 0 AND risk_plus_2 < 200) as plus2,
        COUNT(*) FILTER (WHERE risk_plus_1 > 0 AND risk_plus_1 < 200) as plus1,
        COUNT(*) FILTER (WHERE risk_minus_1 > 0 AND risk_minus_1 < 200) as minus1,
        COUNT(*) FILTER (WHERE risk_minus_2 > 0 AND risk_minus_2 < 200) as minus2,
        COUNT(*) FILTER (WHERE risk_minus_3 > 0 AND risk_minus_3 < 200) as minus3,
        COUNT(*) FILTER (WHERE risk_minus_4 > 0 AND risk_minus_4 < 200) as minus4,
        COUNT(*) FILTER (WHERE risk_minus_5 > 0 AND risk_minus_5 < 200) as minus5
      FROM ts_regular_admissions
    `);
    const c = countResult.rows[0];
    console.log('risk_plus_5: ' + c.plus5 + '개, risk_plus_4: ' + c.plus4 + '개, risk_plus_3: ' + c.plus3 + '개');
    console.log('risk_plus_2: ' + c.plus2 + '개, risk_plus_1: ' + c.plus1 + '개');
    console.log('risk_minus_1: ' + c.minus1 + '개, risk_minus_2: ' + c.minus2 + '개');
    console.log('risk_minus_3: ' + c.minus3 + '개, risk_minus_4: ' + c.minus4 + '개, risk_minus_5: ' + c.minus5 + '개');

    // 모든 위험도 필드 수정
    console.log('\n=== 위험도 필드 수정 실행 ===');

    const riskFields = [
      'risk_plus_5', 'risk_plus_4', 'risk_plus_3', 'risk_plus_2', 'risk_plus_1',
      'risk_minus_1', 'risk_minus_2', 'risk_minus_3', 'risk_minus_4', 'risk_minus_5'
    ];

    for (const field of riskFields) {
      const result = await client.query(`
        UPDATE ts_regular_admissions
        SET ${field} = ${field} * 10
        WHERE ${field} > 0 AND ${field} < 200
      `);
      console.log(field + ': ' + result.rowCount + '개 수정');
    }

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 가천대 의예과 위험도 ===');
    const afterResult = await client.query(`
      SELECT
        ra.id,
        ra.recruitment_name,
        ra.year,
        ra.min_cut,
        ra.max_cut,
        ra.risk_plus_5,
        ra.risk_plus_1,
        ra.risk_minus_1,
        ra.risk_minus_5
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%가천%' AND ra.recruitment_name LIKE '%의예%'
      ORDER BY ra.year DESC
    `);
    afterResult.rows.forEach(row => {
      console.log('ID ' + row.id + ' (' + row.year + ') ' + row.recruitment_name);
      console.log('  min=' + Number(row.min_cut).toFixed(2) + ', max=' + Number(row.max_cut).toFixed(2));
      console.log('  +5=' + Number(row.risk_plus_5).toFixed(2) + ', +1=' + Number(row.risk_plus_1).toFixed(2) + ', -1=' + Number(row.risk_minus_1).toFixed(2) + ', -5=' + Number(row.risk_minus_5).toFixed(2));
    });

    console.log('\n✅ 위험도 수정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
