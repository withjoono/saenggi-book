const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function debugOfficerMember() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Check officer and its member relationship
    console.log('🔍 Checking officer member relationship...\n');

    const result = await dataSource.query(`
      SELECT
        o.id as officer_id,
        o.officer_name,
        o.member_id,
        m.id as member_actual_id,
        m.email,
        m.nickname,
        m.phone
      FROM officer_list_tb o
      LEFT JOIN auth_member m ON o.member_id = m.id
      WHERE o.officer_name = '거북쌤'
    `);

    if (result.length === 0) {
      console.log('❌ Officer not found');
      return;
    }

    const officer = result[0];
    console.log('Officer Information:');
    console.log(JSON.stringify(officer, null, 2));

    if (!officer.member_actual_id) {
      console.log('\n❌ PROBLEM: Officer has member_id but member does not exist!');
      console.log(`   Officer member_id: ${officer.member_id}`);
      console.log(`   This will cause 500 error when trying to use ticket.\n`);

      // Find a suitable member to use
      console.log('🔍 Finding a suitable member account...');
      const members = await dataSource.query(`
        SELECT id, email, nickname, phone
        FROM auth_member
        LIMIT 5
      `);

      console.log('\nAvailable member accounts:');
      members.forEach((m, idx) => {
        console.log(`${idx + 1}. ID: ${m.id}, Email: ${m.email}, Nickname: ${m.nickname}`);
      });

      if (members.length > 0) {
        console.log(`\n💡 Suggestion: Update officer member_id to ${members[0].id} (${members[0].email})`);
      }

    } else {
      console.log('\n✅ Officer member relationship is valid');

      if (!officer.phone) {
        console.log('⚠️  WARNING: Member has no phone number (SMS notification will fail)');
      }

      console.log('\n📊 Member details:');
      console.log(`   Email: ${officer.email}`);
      console.log(`   Nickname: ${officer.nickname}`);
      console.log(`   Phone: ${officer.phone || 'NOT SET'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

debugOfficerMember();
