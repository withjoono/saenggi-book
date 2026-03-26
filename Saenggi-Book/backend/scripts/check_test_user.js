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

        console.log('\n[1] Finding user test@test.com...');
        const userRes = await client.query(
            "SELECT * FROM auth_member WHERE email = $1",
            ['test@test.com']
        );

        if (userRes.rows.length === 0) {
            console.log('❌ User test@test.com NOT found in auth_member.');
        } else {
            const user = userRes.rows[0];
            console.log(`✅ User found: ID=${user.id}, Email=${user.email}, Nickname=${user.nickname}`);

            console.log('\n[2] Checking officer record...');
            const officerRes = await client.query(
                "SELECT * FROM officer_list_tb WHERE member_id = $1",
                [user.id]
            );

            if (officerRes.rows.length === 0) {
                console.log('❌ No officer record found for this user.');
            } else {
                console.table(officerRes.rows);
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
