import { Client } from 'pg';

async function addTestInterests() {
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

    const memberId = 1; // test@test.com

    // Get some regular admission IDs (가군)
    const admissions = await client.query(`
      SELECT id, admission_name, recruitment_name, admission_type
      FROM ts_regular_admissions
      WHERE admission_type = '가'
      ORDER BY RANDOM()
      LIMIT 10
    `);

    console.log('\n📋 선택된 정시 모집단위 (10개):');
    for (const adm of admissions.rows) {
      console.log(`  - ${adm.recruitment_name} ${adm.admission_name} (${adm.admission_type}군)`);
    }

    // Insert interests - ts_member_regular_interests has: id, member_id, admission_type, target_id, created_at
    console.log('\n➕ 관심대학 추가 중...');
    let inserted = 0;
    for (const adm of admissions.rows) {
      try {
        await client.query(`
          INSERT INTO ts_member_regular_interests (member_id, admission_type, target_id, created_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT DO NOTHING
        `, [memberId, adm.admission_type, adm.id]);
        inserted++;
        console.log(`  ✅ ${adm.recruitment_name} ${adm.admission_name}`);
      } catch (e: any) {
        console.log(`  ⚠️ ${adm.recruitment_name}: ${e.message.substring(0, 80)}`);
      }
    }

    console.log(`\n✅ ${inserted}개 관심대학 추가 완료!`);

    // Verify
    const count = await client.query(`
      SELECT COUNT(*) as cnt FROM ts_member_regular_interests WHERE member_id = $1
    `, [memberId]);
    console.log(`📊 총 관심대학: ${count.rows[0].cnt}개`);

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

addTestInterests();
