const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function fixPassword() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'Junho@46852',
    database: 'geobukschool_dev'
  });

  try {
    await client.connect();
    
    // Generate bcrypt hash for password "test1234"
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('test1234', salt);
    const passwordWithPrefix = '{bcrypt}' + hash;
    
    console.log('Generated password hash:', passwordWithPrefix.substring(0, 50) + '...');
    
    // Update password
    await client.query(
      "UPDATE member_tb SET password = $1 WHERE email = 'h61442409@gmail.com'",
      [passwordWithPrefix]
    );
    
    console.log('비밀번호 업데이트 완료');
    
    // Verify
    const result = await client.query("SELECT email, password FROM member_tb WHERE email = 'h61442409@gmail.com'");
    console.log('확인:', result.rows[0]?.email, '- password set');
    
    await client.end();
  } catch(e) {
    console.log('에러:', e.message);
  }
}

fixPassword();
