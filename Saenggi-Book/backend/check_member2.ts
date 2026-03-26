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

    // Check all members
    const r1 = await client.query('SELECT id, email, oauth_id, nickname FROM member_tb LIMIT 10');
    console.log('All members:', JSON.stringify(r1.rows, null, 2));

    // Search for S26H302092
    const r2 = await client.query("SELECT * FROM member_tb WHERE oauth_id = $1", ['S26H302092']);
    console.log('By oauth_id S26H302092:', r2.rows);

    // Check sv_auth_member
    try {
        const r3 = await client.query('SELECT * FROM sv_auth_member LIMIT 5');
        console.log('sv_auth_member:', JSON.stringify(r3.rows, null, 2));
    } catch (e: any) {
        console.log('sv_auth_member error:', e.message);
    }

    // Check auth_member (Hub table)
    try {
        const r4 = await client.query('SELECT * FROM auth_member LIMIT 5');
        console.log('auth_member:', JSON.stringify(r4.rows, null, 2));
    } catch (e: any) {
        console.log('auth_member error:', e.message);
    }

    await client.end();
}

check().catch(console.error);
