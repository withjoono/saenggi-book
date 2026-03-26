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

    const r = await client.query('SELECT id, email, oauth_id FROM auth_member');
    for (const row of r.rows) {
        console.log(`id=${row.id} email=${row.email} oauth_id=${row.oauth_id}`);
    }
    console.log(`Total: ${r.rows.length}`);

    const r2 = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%member%'`);
    for (const row of r2.rows) {
        console.log(`table: ${row.tablename}`);
    }

    await client.end();
}

check().catch(console.error);
