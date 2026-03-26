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
    console.log('All tables:', r0.rows.map((r: any) => r.tablename));

    await client.end();
}

check().catch(console.error);
