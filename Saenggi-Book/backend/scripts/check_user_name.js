const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev'
});

async function main() {
    try {
        await client.connect();

        console.log('--- Checking User ID 8 ---');
        const res = await client.query("SELECT id, nickname, email FROM auth_member WHERE id = 8");
        console.log(res.rows[0]);

        console.log('\n--- Searching for "강준호" (Kang Junho) ---');
        const searchRes = await client.query("SELECT id, nickname, email FROM auth_member WHERE nickname = '강준호'");
        console.log(searchRes.rows);

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
