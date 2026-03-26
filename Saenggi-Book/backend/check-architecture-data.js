/**
 * 건축 관련 데이터 확인 스크립트
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

async function checkData() {
  const client = await pool.connect();

  try {
    console.log('📊 건축 관련 데이터 확인...\n');

    // 1. 건축 중계열 데이터 조회
    const query1 = `
      SELECT mid_field, COUNT(*) as count
      FROM ss_category_subject_necessity
      WHERE mid_field LIKE '%건축%'
      GROUP BY mid_field
    `;
    const result1 = await client.query(query1);
    console.log('1️⃣ 건축 관련 중계열:');
    result1.rows.forEach(row => {
      console.log(`   - ${row.mid_field}: ${row.count}개`);
    });

    // 2. "건축" 중계열의 탐구과목 (inquiry) 데이터
    const query2 = `
      SELECT
        subject_name,
        necessity_level,
        subject_type,
        COUNT(*) as count
      FROM ss_category_subject_necessity
      WHERE mid_field = '건축'
        AND subject_type = 'inquiry'
      GROUP BY subject_name, necessity_level, subject_type
      ORDER BY necessity_level, subject_name
    `;
    const result2 = await client.query(query2);
    console.log('\n2️⃣ "건축" 중계열의 탐구과목 (inquiry):');
    console.log('   필수과목 (necessity_level = 1):');
    result2.rows.filter(r => r.necessity_level === 1).forEach(row => {
      console.log(`     - ${row.subject_name} (${row.count}개 소계열)`);
    });
    console.log('   권장과목 (necessity_level = 2):');
    result2.rows.filter(r => r.necessity_level === 2).forEach(row => {
      console.log(`     - ${row.subject_name} (${row.count}개 소계열)`);
    });

    // 3. "건축" 중계열의 주요교과 (major) 데이터
    const query3 = `
      SELECT
        subject_name,
        necessity_level,
        subject_type,
        COUNT(*) as count
      FROM ss_category_subject_necessity
      WHERE mid_field = '건축'
        AND subject_type = 'major'
      GROUP BY subject_name, necessity_level, subject_type
      ORDER BY necessity_level, subject_name
    `;
    const result3 = await client.query(query3);
    console.log('\n3️⃣ "건축" 중계열의 주요교과 (major):');
    result3.rows.forEach(row => {
      console.log(`   - ${row.subject_name} (level: ${row.necessity_level}, ${row.count}개 소계열)`);
    });

    // 4. 샘플 데이터 상세 조회
    const query4 = `
      SELECT *
      FROM ss_category_subject_necessity
      WHERE mid_field = '건축'
        AND subject_type = 'inquiry'
      LIMIT 10
    `;
    const result4 = await client.query(query4);
    console.log('\n4️⃣ 샘플 데이터 (상위 10개):');
    result4.rows.forEach(row => {
      console.log(`   ${row.minor_field} (${row.category_id}): ${row.subject_name} - ${row.necessity_level === 1 ? '필수' : '권장'}`);
    });

  } catch (error) {
    console.error('❌ 조회 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();
