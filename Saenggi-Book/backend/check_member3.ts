import { Client } from 'pg';

const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
});

async function check() {
    await client.connect();
    console.log('Connected');

    // List all tables
    const r0 = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    console.log('Tables:', r0.rows.map((r: any) => r.tablename).join(', '));

    // Check auth_member
    const r1 = await client.query('SELECT id, email, oauth_id, nickname FROM auth_member LIMIT 10');
    console.log('auth_member rows:', JSON.stringify(r1.rows, null, 2));

    // Search for S26H302092 in oauth_id
    const r2 = await client.query("SELECT id, email, oauth_id FROM auth_member WHERE oauth_id = $1", ['S26H302092']);
    console.log('oauth_id=S26H302092:', r2.rows);

    // Search any member at all
    const r3 = await client.query('SELECT COUNT(*) as cnt FROM auth_member');
    console.log('Total members:', r3.rows[0].cnt);

    await client.end();
}

check().catch(console.error);
