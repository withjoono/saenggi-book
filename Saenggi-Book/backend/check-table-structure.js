const { Client } = require('pg');

async function checkTableStructure() {
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

    // Check ts_universities
    console.log('=== ts_universities (대학 테이블) ===');
    const univCount = await client.query('SELECT COUNT(*) as count FROM ts_universities');
    console.log(`총 ${univCount.rows[0].count}개의 대학 데이터\n`);

    if (univCount.rows[0].count > 0) {
      const univSample = await client.query('SELECT * FROM ts_universities LIMIT 1');
      console.log('샘플 데이터:');
      console.log(JSON.stringify(univSample.rows[0], null, 2));
    }

    // Check susi_subject_tb structure
    console.log('\n\n=== susi_subject_tb (수시 교과 테이블 구조) ===');
    const susiColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'susi_subject_tb'
      ORDER BY ordinal_position
      LIMIT 15
    `);
    console.log('주요 컬럼들:');
    susiColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Check susi_subject_tb data
    const susiCount = await client.query('SELECT COUNT(*) as count FROM susi_subject_tb');
    console.log(`\n총 ${susiCount.rows[0].count}개의 수시 교과 데이터`);

    if (susiCount.rows[0].count > 0) {
      const susiSample = await client.query('SELECT * FROM susi_subject_tb LIMIT 1');
      console.log('\n샘플 데이터 (첫 10개 필드):');
      const sample = susiSample.rows[0];
      Object.keys(sample).slice(0, 10).forEach(key => {
        console.log(`  ${key}: ${sample[key]}`);
      });
    }

    // Explain ts_regular_admissions purpose
    console.log('\n\n=== ts_regular_admissions (정시 전형 테이블) ===');
    console.log('이 테이블은 "정시 전형" 데이터를 저장합니다.');
    console.log('정시 전형 = 수능 점수로 지원하는 대학 입시');
    console.log('\n저장되는 정보:');
    console.log('  - 대학명, 모집단위(학과)');
    console.log('  - 모집군 (가군, 나군, 다군)');
    console.log('  - 수능 반영 비율, 과목 조합');
    console.log('  - 등급컷, 백분위 등');

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

checkTableStructure();
