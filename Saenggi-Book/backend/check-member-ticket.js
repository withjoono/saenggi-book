const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
});

async function test() {
  await client.connect();

  // 사용자 정보 찾기
  const member = await client.query(`
    SELECT id, email, nickname FROM member_tb WHERE email = 'eunchaning917@gmail.com'
  `);
  console.log('회원 정보:');
  console.log(member.rows[0] || '회원 없음');

  if (member.rows[0]) {
    const memberId = member.rows[0].id;

    // 해당 회원의 pay_contract 확인
    const contracts = await client.query(`
      SELECT * FROM pay_contract_tb WHERE member_id = $1
    `, [memberId]);
    console.log('\n계약 정보:');
    contracts.rows.forEach(c => console.log(c));

    // officer_ticket 확인
    const tickets = await client.query(`
      SELECT * FROM officer_ticket_tb WHERE member_id = $1
    `, [memberId]);
    console.log('\nofficer_ticket 정보:');
    console.log(tickets.rows[0] || '티켓 없음');

    // ts_member_calculated_scores 확인
    const scores = await client.query(`
      SELECT * FROM ts_member_calculated_scores WHERE member_id = $1 LIMIT 3
    `, [memberId]);
    console.log('\n환산점수 저장 정보:');
    console.log(scores.rows.length ? scores.rows : '점수 없음');
  }

  await client.end();
}

test().catch(console.error);
