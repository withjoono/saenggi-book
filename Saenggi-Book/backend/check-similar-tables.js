const { Client } = require('pg');

async function checkSimilarTables() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('✅ Database connected\n');

    // Check ts_universities for reference
    console.log('=== ts_universities (샘플 대학 데이터) ===');
    const universityQuery = 'SELECT id, name FROM ts_universities LIMIT 3';
    const universities = await client.query(universityQuery);
    universities.rows.forEach(u => {
      console.log(`ID: ${u.id}, 대학명: ${u.name}`);
    });

    // Check susi tables for similar structure
    console.log('\n=== susi_subject_tb (수시 교과 샘플 데이터) ===');
    const susiQuery = `
      SELECT
        id,
        year,
        univ_name,
        admission_name,
        recruitment_name,
        selection_method
      FROM susi_subject_tb
      LIMIT 2
    `;
    const susi = await client.query(susiQuery);
    if (susi.rowCount > 0) {
      susi.rows.forEach(row => {
        console.log(JSON.stringify(row, null, 2));
      });
    } else {
      console.log('데이터 없음');
    }

    // Check ts_admissions (새로운 구조)
    console.log('\n=== ts_admissions (새로운 전형 테이블) ===');
    const admissionQuery = `
      SELECT COUNT(*) as count
      FROM ts_admissions
    `;
    const admissions = await client.query(admissionQuery);
    console.log(`총 ${admissions.rows[0].count}개의 전형 데이터`);

    if (admissions.rows[0].count > 0) {
      const sampleQuery = `
        SELECT
          id,
          name,
          year
        FROM ts_admissions
        LIMIT 3
      `;
      const samples = await client.query(sampleQuery);
      samples.rows.forEach(row => {
        console.log(`ID: ${row.id}, 전형명: ${row.name}, 년도: ${row.year}`);
      });
    }

    // Check ts_recruitment_units (모집단위)
    console.log('\n=== ts_recruitment_units (모집단위 샘플) ===');
    const recruitmentQuery = `
      SELECT COUNT(*) as count
      FROM ts_recruitment_units
    `;
    const recruitments = await client.query(recruitmentQuery);
    console.log(`총 ${recruitments.rows[0].count}개의 모집단위 데이터`);

    if (recruitments.rows[0].count > 0) {
      const sampleQuery = `
        SELECT
          id,
          name,
          year
        FROM ts_recruitment_units
        LIMIT 3
      `;
      const samples = await client.query(sampleQuery);
      samples.rows.forEach(row => {
        console.log(`ID: ${row.id}, 모집단위명: ${row.name}, 년도: ${row.year}`);
      });
    }

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  process.exit(0);
}

checkSimilarTables();
