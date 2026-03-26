const { Client } = require('pg');

async function checkMemberStructure() {
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

    // Get table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'member_tb'
      ORDER BY ordinal_position
    `;
    const structure = await client.query(structureQuery);

    console.log('=== member_tb 테이블 구조 ===');
    structure.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Get test2@test.com data
    const dataQuery = 'SELECT * FROM member_tb WHERE email = $1';
    const data = await client.query(dataQuery, ['test2@test.com']);

    if (data.rowCount > 0) {
      console.log('\n=== test2@test.com 사용자 데이터 ===');
      const keys = Object.keys(data.rows[0]).slice(0, 15);
      keys.forEach(key => {
        console.log(`  ${key}: ${data.rows[0][key]}`);
      });
    }

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  process.exit(0);
}

checkMemberStructure();
