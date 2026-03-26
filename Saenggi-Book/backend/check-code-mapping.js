const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function checkCodeMapping() {
  try {
    await client.connect();
    console.log('Connected\n');

    // earlyd_subject_code_list_tb 구조 및 데이터 확인
    console.log('=== earlyd_subject_code_list_tb 구조 ===');
    const structResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'earlyd_subject_code_list_tb'
      ORDER BY ordinal_position
    `);
    for (const row of structResult.rows) {
      console.log('  -', row.column_name);
    }

    // 데이터 확인
    console.log('\n=== 과목 코드 매핑 ===');
    const dataResult = await client.query(`
      SELECT *
      FROM earlyd_subject_code_list_tb
      ORDER BY id
      LIMIT 30
    `);
    for (const row of dataResult.rows) {
      console.log('  ' + row.code + ': ' + (row.name || row.subject_name || JSON.stringify(row)));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCodeMapping();
