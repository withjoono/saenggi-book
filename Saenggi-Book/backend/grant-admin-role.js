const { Client } = require('pg');

async function grantAdminRole() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('✅ Database connected');

    // Check current role
    const checkQuery = 'SELECT id, email, role_type FROM member_tb WHERE email = $1';
    const checkResult = await client.query(checkQuery, ['test2@test.com']);

    if (checkResult.rowCount === 0) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n현재 사용자 정보:');
    console.log(checkResult.rows[0]);

    // Update role to ROLE_ADMIN
    const updateQuery = "UPDATE member_tb SET role_type = 'ROLE_ADMIN' WHERE email = $1";
    await client.query(updateQuery, ['test2@test.com']);

    console.log('\n✅ 관리자 권한 부여 완료!');

    // Verify
    const verifyResult = await client.query(checkQuery, ['test2@test.com']);
    console.log('\n업데이트된 사용자 정보:');
    console.log(verifyResult.rows[0]);

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  process.exit(0);
}

grantAdminRole();
