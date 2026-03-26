import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

/**
 * Production seed script: Updates test@test.com to ROLE_ADMIN on Cloud SQL
 * Requires Cloud SQL Proxy running on port 5434
 *
 * Usage: npx ts-node scripts/seed-admin-prod.ts
 */
async function seedAdminProd() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5600,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  try {
    await client.connect();
    console.log('✅ Connected to Cloud SQL (geobukschool_prod)');

    // Check if user already exists
    const existing = await client.query(
      `SELECT id, email, role_type FROM member_tb WHERE email = $1`,
      ['test@test.com']
    );

    if (existing.rows.length === 0) {
      // Hash password with bcrypt (Spring compatible format)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('test1234', saltRounds);
      const springCompatiblePassword = `{bcrypt}${hashedPassword}`;

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
    } else {
      const user = existing.rows[0];
      console.log(`\n📝 User exists (id: ${user.id}, role: ${user.role_type})`);

      if (user.role_type !== 'ROLE_ADMIN') {
        await client.query(
          `UPDATE member_tb SET role_type = 'ROLE_ADMIN', update_dt = NOW() WHERE email = $1`,
          ['test@test.com']
        );
        console.log('✅ Updated to ROLE_ADMIN');
      } else {
        console.log('✅ Already has ROLE_ADMIN');
      }
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
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Cloud SQL Proxy가 실행 중인지 확인하세요:');
      console.error('   cloud-sql-proxy ts-back-nest-479305:asia-northeast3:ts-back-nest --port=5434');
    }
    await client.end();
    process.exit(1);
  }
}

seedAdminProd();
