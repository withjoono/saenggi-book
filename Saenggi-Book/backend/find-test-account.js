const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function findTestAccount() {
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

    // Find email/password accounts (not social login)
    const members = await dataSource.query(`
      SELECT id, email, nickname, provider_type
      FROM auth_member
      WHERE provider_type IS NULL OR provider_type = ''
      ORDER BY id
      LIMIT 5
    `);

    if (members.length > 0) {
      console.log('📋 Available email/password accounts:');
      members.forEach((m, idx) => {
        console.log(`${idx + 1}. ID: ${m.id}, Email: ${m.email}, Nickname: ${m.nickname}`);
      });

      console.log('\n💡 You can use any of these accounts for testing');
      console.log('   Default password is usually: 123456 or test1234');
    } else {
      console.log('❌ No email/password accounts found');
      console.log('💡 All accounts use social login (sns_type is set)');
      console.log('\n🔧 Creating a test account...');

      // Create test account
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test1234', 10);

      const result = await dataSource.query(`
        INSERT INTO auth_member (email, password, nickname, provider_type, oauth_id, role_type, create_dt, update_dt)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, email, nickname
      `, ['test@test.com', `{bcrypt}${hashedPassword}`, 'Test User', '', '', 'ROLE_USER']);

      console.log('✅ Test account created:');
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Password: test1234`);
      console.log(`   Nickname: ${result[0].nickname}`);
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

findTestAccount();
