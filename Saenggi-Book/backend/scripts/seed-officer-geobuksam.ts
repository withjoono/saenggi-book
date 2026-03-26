import { Client } from 'pg';

/**
 * Development seed script: Creates 거북쌤 as an officer for all categories
 *
 * Usage: npx ts-node scripts/seed-officer-geobuksam.ts
 */
async function seedOfficerGeobuksam() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('✅ Connected to local PostgreSQL (geobukschool_dev)');

    // First, find or create a member for 거북쌤
    let memberResult = await client.query(
      `SELECT id FROM member_tb WHERE email = $1`,
      ['geobuksam@turtleskool.com']
    );

    let memberId: number;

    if (memberResult.rows.length === 0) {
      // Create a new member for 거북쌤
      const insertMember = await client.query(`
        INSERT INTO member_tb (
          email,
          password,
          nickname,
          phone,
          role_type,
          provider_type,
          member_type,
          ck_sms,
          ck_sms_agree,
          account_stop_yn,
          create_dt,
          update_dt
        ) VALUES (
          $1, $2, $3, $4, $5, NULL, $6, B'0', B'0', 'N', NOW(), NOW()
        ) RETURNING id
      `, [
        'geobuksam@turtleskool.com',
        '{bcrypt}$2b$10$placeholder', // Not used for login
        '거북쌤',
        '01000000000',
        'ROLE_ADMIN',
        'TEACHER'
      ]);
      memberId = insertMember.rows[0].id;
      console.log(`✅ Created new member for 거북쌤 (id: ${memberId})`);
    } else {
      memberId = memberResult.rows[0].id;
      console.log(`📝 Member for 거북쌤 already exists (id: ${memberId})`);
    }

    // Check if officer entry already exists
    const existingOfficer = await client.query(
      `SELECT id FROM officer_list_tb WHERE member_id = $1`,
      [memberId]
    );

    if (existingOfficer.rows.length > 0) {
      // Update existing officer
      await client.query(`
        UPDATE officer_list_tb
        SET officer_name = $1,
            university = $2,
            education = $3,
            officer_profile_image = $4,
            approval_status = 1,
            del_yn = 'N',
            update_dt = NOW()
        WHERE member_id = $5
      `, [
        '거북쌤',
        '서울대학교',
        '입시전문가 / AI 개발자',
        '/images/geobuksam-profile.png',
        memberId
      ]);
      console.log('✅ Updated existing officer entry for 거북쌤');
    } else {
      // Insert new officer entry
      await client.query(`
        INSERT INTO officer_list_tb (
          member_id,
          officer_name,
          university,
          education,
          officer_profile_image,
          approval_status,
          del_yn,
          create_dt,
          update_dt
        ) VALUES ($1, $2, $3, $4, $5, 1, 'N', NOW(), NOW())
      `, [
        memberId,
        '거북쌤',
        '서울대학교',
        '입시전문가 / AI 개발자',
        '/images/geobuksam-profile.png'
      ]);
      console.log('✅ Created new officer entry for 거북쌤');
    }

    // Verify the officer was added
    const verified = await client.query(`
      SELECT o.id, o.member_id, o.officer_name, o.university, o.education, o.del_yn
      FROM officer_list_tb o
      WHERE o.officer_name = '거북쌤'
    `);
    console.log('\n📋 거북쌤 Officer entry:', verified.rows[0]);

    // Show all officers
    const allOfficers = await client.query(`
      SELECT o.id, o.officer_name, o.university, o.del_yn
      FROM officer_list_tb o
      WHERE o.del_yn = 'N'
      ORDER BY o.id
    `);
    console.log('\n📋 All active officers:');
    allOfficers.rows.forEach((officer, idx) => {
      console.log(`   ${idx + 1}. ${officer.officer_name} (${officer.university})`);
    });

    await client.end();
    console.log('\n✅ Done! 거북쌤 is now available as an officer for all categories.');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

seedOfficerGeobuksam();
