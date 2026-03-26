const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function setupTestAccount() {
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

    const testEmail = 'test2@test.com';
    const memberId = 17;

    console.log(`🔧 Setting up test account: ${testEmail} (ID: ${memberId})\n`);

    // 1. Check tickets
    console.log('🎫 Step 1: Checking tickets...');
    const tickets = await dataSource.query(
      `SELECT * FROM officer_ticket_tb WHERE member_id = $1`,
      [memberId]
    );

    if (tickets.length === 0) {
      console.log('   Adding 5 tickets...');
      await dataSource.query(
        `INSERT INTO officer_ticket_tb (member_id, ticket_count)
         VALUES ($1, $2)`,
        [memberId, 5]
      );
      console.log('   ✅ Tickets added');
    } else {
      console.log(`   ✅ Tickets exist: ${tickets[0].ticket_count}`);
    }

    // 2. Check school records
    console.log('\n📚 Step 2: Checking school records...');
    const schoolRecords = await dataSource.query(
      `SELECT COUNT(*) as count FROM sgb_subject_learning WHERE member_id = $1`,
      [memberId]
    );

    const recordCount = parseInt(schoolRecords[0].count);
    if (recordCount === 0) {
      console.log('   Adding dummy school record...');
      await dataSource.query(
        `INSERT INTO sgb_subject_learning (
          member_id, grade, semester,
          main_subject_name, subject_name, achievement, unit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [memberId, '3', '1', '국어', '국어', 'A', '3']
      );
      console.log('   ✅ School record added');
    } else {
      console.log(`   ✅ School records exist: ${recordCount} records`);
    }

    // 3. Summary
    console.log('\n📊 Test Account Summary:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: 123456 or test1234`);
    console.log(`   Member ID: ${memberId}`);
    console.log(`   Status: Ready for testing`);

    await dataSource.destroy();
    console.log('\n✅ Setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

setupTestAccount();
