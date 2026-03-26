const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
};

async function main() {
  const client = new Client(config);
  await client.connect();

  console.log('=== 샘플 데이터 5개 ===\n');
  
  const result = await client.query(`
    SELECT 
      essay_type, 
      essay_subject, 
      recruitment_unit, 
      college_code, 
      mun_mathen, 
      cross_support, 
      rthree_etc_flag,
      rthree_region_flag
    FROM essay_list_tb 
    LIMIT 5
  `);

  result.rows.forEach((row, i) => {
    console.log(`${i + 1}. ${row.recruitment_unit}`);
    console.log(`   유형: ${row.essay_type} | 과목: ${row.essay_subject}`);
    console.log(`   대학: ${row.college_code}`);
    console.log(`   문과수리: ${row.mun_mathen} | 교차지원: ${row.cross_support}`);
    console.log(`   의대기타: ${row.rthree_etc_flag} | 의대지역: ${row.rthree_region_flag}`);
    console.log('');
  });

  await client.end();
}

main().catch(console.error);
















