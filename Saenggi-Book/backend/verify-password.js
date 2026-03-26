const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function verifyPassword() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'Junho@46852',
    database: 'geobukschool_dev'
  });

  try {
    await client.connect();
    
    // Get stored password
    const result = await client.query("SELECT password FROM member_tb WHERE email = 'h61442409@gmail.com'");
    const storedPassword = result.rows[0]?.password;
    console.log('저장된 비밀번호:', storedPassword);
    
    // Remove prefix and compare
    const prefix = '{bcrypt}';
    let hash = storedPassword;
    if (hash.startsWith(prefix)) {
      hash = hash.slice(prefix.length);
    }
    console.log('해시 (prefix 제거):', hash);
    
    // Compare with test1234
    const match = await bcrypt.compare('test1234', hash);
    console.log('비밀번호 일치:', match);
    
    await client.end();
  } catch(e) {
    console.log('에러:', e.message);
  }
}

verifyPassword();
