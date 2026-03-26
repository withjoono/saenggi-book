import { Client } from 'pg';

async function updateTestUser() {
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

    // Check current value
    const current = await client.query(
      `SELECT id, email, provider_type FROM member_tb WHERE email = $1`,
      ['test@test.com']
    );
    console.log('\nCurrent state:', current.rows[0]);

    // Update provider_type to null (for email login)
    const result = await client.query(
      `UPDATE member_tb SET provider_type = NULL WHERE email = $1 RETURNING id, email, provider_type`,
      ['test@test.com']
    );

    console.log('\n✅ Updated:', result.rows[0]);

    await client.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

updateTestUser();
