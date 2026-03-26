import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  try {
    await client.connect();
    console.log('✅ Connected to Cloud SQL');

    // First check table structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'member_tb'
      ORDER BY ordinal_position
    `);
    console.log('\nMember table columns:');
    columns.rows.forEach((col: any) =>
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`)
    );

    // Check if user already exists
    const existing = await client.query(
      `SELECT id, email FROM member_tb WHERE email = $1`,
      ['test@test.com']
    );

    if (existing.rows.length > 0) {
      console.log('\n⚠️ User already exists:', existing.rows[0]);
      await client.end();
      return;
    }

    // Hash password with bcrypt (Spring compatible format)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('test1234', saltRounds);
    const springCompatiblePassword = `{bcrypt}${hashedPassword}`;

    console.log('\nPassword hashed:', springCompatiblePassword.substring(0, 50) + '...');

    // Insert test user with correct column names
    // NOTE: provider_type should be NULL for email login accounts (not 'EMAIL')
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
      '테스트 사용자',
      '01012345678',
      'ROLE_USER',
      'STUDENT'
    ]);

    console.log('\n✅ Test user created:', result.rows[0]);

    await client.end();
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

createTestUser();
