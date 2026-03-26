import { Client } from 'pg';

async function checkUserData() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  try {
    await client.connect();
    console.log('✅ Connected');

    const member = await client.query(
      `SELECT id, email FROM member_tb WHERE email = $1`,
      ['test@test.com']
    );
    const memberId = member.rows[0]?.id;
    console.log('\n👤 Member ID:', memberId);

    // Check mockexam scores (standard scores)
    const mockexam = await client.query(
      `SELECT COUNT(*) as cnt FROM mockexam_standard_score_tb WHERE member_id = $1`,
      [memberId]
    );
    console.log('📊 모의고사 점수:', mockexam.rows[0].cnt, '개');

    // Check regular interests (정시 관심대학)
    const interests = await client.query(
      `SELECT COUNT(*) as cnt FROM ts_member_regular_interests WHERE member_id = $1`,
      [memberId]
    );
    console.log('🎯 정시 관심대학:', interests.rows[0].cnt, '개');

    // Check total regular admission data
    const totalAdmissions = await client.query(
      `SELECT COUNT(*) as cnt FROM ts_regular_admissions`
    );
    console.log('🏫 전체 정시 모집단위:', totalAdmissions.rows[0].cnt, '개');

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkUserData();
