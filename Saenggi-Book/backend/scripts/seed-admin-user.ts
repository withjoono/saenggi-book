import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

/**
 * Development seed script: Creates or updates test@test.com admin account
 * This ensures the admin account persists across server restarts
 *
 * Usage: npx ts-node scripts/seed-admin-user.ts
 */
async function seedAdminUser() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'Junho@46852',
    database: 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('✅ Connected to local PostgreSQL (geobukschool_dev)');

    // Check if user already exists
    const existing = await client.query(
      `SELECT id, email, role_type FROM member_tb WHERE email = $1`,
      ['test@test.com']
    );

    // Hash password with bcrypt (Spring compatible format)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('test1234', saltRounds);
    const springCompatiblePassword = `{bcrypt}${hashedPassword}`;

    if (existing.rows.length > 0) {
      // Update existing user to ensure ROLE_ADMIN
      const user = existing.rows[0];
      console.log(`\n📝 User exists (id: ${user.id}, role: ${user.role_type})`);

      if (user.role_type !== 'ROLE_ADMIN') {
        await client.query(
          `UPDATE member_tb SET role_type = 'ROLE_ADMIN', password = $1, update_dt = NOW() WHERE email = $2`,
          [springCompatiblePassword, 'test@test.com']
        );
        console.log('✅ Updated to ROLE_ADMIN');
      } else {
        // Just update password to ensure it's correct
        await client.query(
          `UPDATE member_tb SET password = $1, update_dt = NOW() WHERE email = $2`,
          [springCompatiblePassword, 'test@test.com']
        );
        console.log('✅ Password refreshed (already ROLE_ADMIN)');
      }
    } else {
      // Insert new admin user
      const result = await client.query(`
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
        ) RETURNING id, email, nickname, role_type
      `, [
        'test@test.com',
        springCompatiblePassword,
        '관리자 테스트',
        '01012345678',
        'ROLE_ADMIN',
        'STUDENT'
      ]);

      console.log('\n✅ Admin user created:', result.rows[0]);
    }

    // Verify final state
    const verified = await client.query(
      `SELECT id, email, nickname, role_type FROM member_tb WHERE email = $1`,
      ['test@test.com']
    );
    console.log('\n📋 Final user state:', verified.rows[0]);
    console.log('\n🔑 Login credentials:');
    console.log('   Email: test@test.com');
    console.log('   Password: test1234');

    await client.end();
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

seedAdminUser();
