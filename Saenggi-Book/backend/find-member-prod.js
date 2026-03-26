const { Client } = require('pg');

// 운영 DB 설정
const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function test() {
  await client.connect();
  console.log('운영 DB 연결 성공\n');

  // 이메일로 유사 검색
  const members = await client.query(`
    SELECT id, email, nickname, phone FROM member_tb
    WHERE LOWER(email) LIKE '%eunchaning%' OR LOWER(email) LIKE '%917%'
    LIMIT 10
  `);
  console.log('유사 이메일 검색 결과:');
  members.rows.forEach(m => console.log(m));

  // 최근 가입한 회원 확인
  const recentMembers = await client.query(`
    SELECT id, email, nickname, create_dt FROM member_tb
    ORDER BY create_dt DESC
    LIMIT 10
  `);
  console.log('\n최근 가입 회원:');
  recentMembers.rows.forEach(m => console.log(m));

  await client.end();
}

test().catch(e => {
  console.error('오류:', e.message);
  process.exit(1);
});
