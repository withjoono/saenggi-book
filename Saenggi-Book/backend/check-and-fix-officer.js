const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function checkAndFixOfficer() {
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
    console.log('✅ Database connected');

    // Check for existing officers
    const officers = await dataSource.query(
      `SELECT * FROM officer_list_tb ORDER BY id`
    );

    console.log('\n📋 Current officers in database:');
    console.log(JSON.stringify(officers, null, 2));

    // Check for "거북쌤" specifically
    const geobukOfficer = officers.find(o => o.officer_name === '거북쌤');

    if (!geobukOfficer) {
      console.log('\n❌ "거북쌤" officer not found');
      console.log('Creating "거북쌤" officer...');

      // First, check if there's a member we can use, or create one
      const members = await dataSource.query(
        `SELECT id FROM auth_member LIMIT 1`
      );

      let memberId;
      if (members.length > 0) {
        memberId = members[0].id;
        console.log(`Using existing member_id: ${memberId}`);
      } else {
        console.log('⚠️  No members found in database.');
        console.log('Creating officer without member_id (will need to be linked later)...');
        memberId = null;
      }

      // Insert "거북쌤" officer
      if (memberId) {
        await dataSource.query(`
          INSERT INTO officer_list_tb
          (member_id, officer_name, university, education, del_yn, approval_status, create_dt, update_dt)
          VALUES
          ($1, '거북쌤', '거북대학교', '교육학 석사', 'N', 1, NOW(), NOW())
        `, [memberId]);
      } else {
        await dataSource.query(`
          INSERT INTO officer_list_tb
          (officer_name, university, education, del_yn, approval_status, create_dt, update_dt)
          VALUES
          ('거북쌤', '거북대학교', '교육학 석사', 'N', 1, NOW(), NOW())
        `);
      }

      console.log('✅ "거북쌤" officer created successfully!');

    } else {
      console.log('\n✅ "거북쌤" officer found:');
      console.log(JSON.stringify(geobukOfficer, null, 2));

      if (geobukOfficer.del_yn === 'Y') {
        console.log('\n⚠️  "거북쌤" is marked as deleted (del_yn = Y)');
        console.log('Updating del_yn to N...');

        await dataSource.query(
          `UPDATE officer_list_tb SET del_yn = 'N', update_dt = NOW() WHERE id = $1`,
          [geobukOfficer.id]
        );

        console.log('✅ "거북쌤" reactivated successfully!');
      } else {
        console.log('✅ "거북쌤" is already active (del_yn = N)');
      }
    }

    // Verify final state
    const finalOfficers = await dataSource.query(
      `SELECT id, member_id, officer_name, university, education, del_yn
       FROM officer_list_tb
       WHERE del_yn = 'N'
       ORDER BY id`
    );

    console.log('\n📋 Active officers after fix:');
    console.log(JSON.stringify(finalOfficers, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

checkAndFixOfficer();
