const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function checkUserStatus(email) {
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

    // 1. Find member
    console.log(`🔍 Checking member: ${email}`);
    const members = await dataSource.query(
      `SELECT id, email, nickname FROM auth_member WHERE email = $1`,
      [email]
    );

    if (members.length === 0) {
      console.log(`❌ Member not found`);
      return;
    }

    const member = members[0];
    console.log(`✅ Member found: ID ${member.id}, Nickname: ${member.nickname}\n`);

    // 2. Check tickets
    console.log(`🎫 Checking tickets...`);
    const tickets = await dataSource.query(
      `SELECT * FROM officer_ticket_tb WHERE member_id = $1`,
      [member.id]
    );

    if (tickets.length > 0) {
      console.log(`✅ Tickets: ${tickets[0].ticket_count} available\n`);
    } else {
      console.log(`❌ No tickets found\n`);
    }

    // 3. Check school records (생기부)
    console.log(`📚 Checking school records...`);
    const schoolRecords = await dataSource.query(
      `SELECT COUNT(*) as count FROM sgb_subject_learning WHERE member_id = $1`,
      [member.id]
    );

    const recordCount = parseInt(schoolRecords[0].count);
    if (recordCount > 0) {
      console.log(`✅ School records found: ${recordCount} records\n`);
    } else {
      console.log(`❌ No school records found`);
      console.log(`⚠️  User needs to upload school records first!\n`);
    }

    // 4. Check officer (거북쌤)
    console.log(`👨‍🏫 Checking officer...`);
    const officers = await dataSource.query(
      `SELECT o.*, m.id as member_exists
       FROM officer_list_tb o
       LEFT JOIN auth_member m ON o.member_id = m.id
       WHERE o.officer_name = '거북쌤'`
    );

    if (officers.length > 0) {
      const officer = officers[0];
      console.log(`✅ Officer found: ID ${officer.id}, member_id: ${officer.member_id}`);
      if (officer.member_exists) {
        console.log(`✅ Officer's member account exists\n`);
      } else {
        console.log(`❌ Officer's member account NOT found (member_id: ${officer.member_id})`);
        console.log(`⚠️  This will cause errors when trying to use tickets!\n`);
      }
    } else {
      console.log(`❌ Officer not found\n`);
    }

    // 5. Check existing evaluations
    console.log(`📋 Checking existing evaluations...`);
    const evaluations = await dataSource.query(
      `SELECT * FROM officer_student_evaludate_relation_tb
       WHERE student_id = $1 AND status = 'READY'`,
      [member.id]
    );

    if (evaluations.length > 0) {
      console.log(`⚠️  ${evaluations.length} pending evaluation(s) found:`);
      evaluations.forEach(e => {
        console.log(`   - Officer member_id: ${e.member_id}, Series: ${e.series}`);
      });
    } else {
      console.log(`✅ No pending evaluations\n`);
    }

    // Summary
    console.log(`\n📊 Summary for ${email}:`);
    console.log(`✅ Member exists: ${member.nickname} (ID: ${member.id})`);
    console.log(`${tickets.length > 0 ? '✅' : '❌'} Tickets: ${tickets.length > 0 ? tickets[0].ticket_count : 0}`);
    console.log(`${recordCount > 0 ? '✅' : '❌'} School records: ${recordCount}`);
    console.log(`${officers.length > 0 && officers[0].member_exists ? '✅' : '❌'} Officer ready`);

    if (recordCount === 0) {
      console.log(`\n⚠️  ACTION REQUIRED: Upload school records to use evaluation service!`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

const email = process.argv[2] || 'withjuno6@naver.com';
checkUserStatus(email);
