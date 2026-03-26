const { Client } = require('pg');

// 운영 DB 설정 (Cloud SQL Proxy 필요: cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-sql --port 5434)
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

  // 사용자 정보 찾기
  const member = await client.query(`
    SELECT id, email, nickname FROM member_tb WHERE email = 'eunchaning917@gmail.com'
  `);
  console.log('회원 정보:');
  console.log(member.rows[0] || '회원 없음');

  if (member.rows[0]) {
    const memberId = member.rows[0].id;
    console.log('\n회원 ID:', memberId);

    // 해당 회원의 pay_contract 확인
    const contracts = await client.query(`
      SELECT id, contract_period_end_dt, contract_start_dt, contract_use, product_code, order_id
      FROM pay_contract_tb WHERE member_id = $1
    `, [memberId]);
    console.log('\n계약 정보:');
    if (contracts.rows.length === 0) {
      console.log('계약 없음');
    } else {
      contracts.rows.forEach(c => console.log(c));
    }

    // officer_ticket 확인
    const tickets = await client.query(`
      SELECT * FROM officer_ticket_tb WHERE member_id = $1
    `, [memberId]);
    console.log('\nofficer_ticket 정보:');
    console.log(tickets.rows[0] || '티켓 없음');

    // ts_member_jungsi_input_scores 테이블 존재 여부 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'ts_member_jungsi_input_scores'
      )
    `);
    console.log('\nts_member_jungsi_input_scores 테이블 존재:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // ts_member_jungsi_input_scores 확인
      const inputScores = await client.query(`
        SELECT * FROM ts_member_jungsi_input_scores WHERE member_id = $1
      `, [memberId]);
      console.log('\n정시 입력 점수:');
      console.log(inputScores.rows[0] || '점수 없음');

      // 컬럼 확인
      const cols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = 'ts_member_jungsi_input_scores'
        ORDER BY ordinal_position
      `);
      console.log('\n테이블 컬럼:');
      cols.rows.forEach(c => console.log('-', c.column_name, ':', c.data_type));
    }

    // jungsi ticket 관련 테이블 찾기
    const jungsiTables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND (table_name LIKE '%jungsi%' OR table_name LIKE '%ticket%')
      ORDER BY table_name
    `);
    console.log('\njungsi/ticket 관련 테이블:');
    jungsiTables.rows.forEach(r => console.log('-', r.table_name));
  }

  await client.end();
}

test().catch(e => {
  console.error('오류:', e.message);
  console.log('\nCloud SQL Proxy가 실행 중인지 확인하세요:');
  console.log('cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-sql --port 5434');
  process.exit(1);
});
