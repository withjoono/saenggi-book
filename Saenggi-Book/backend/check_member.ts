
import { Client } from 'pg';

const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
});

async function checkMember() {
    try {
        await client.connect();
        console.log('Connected to database geobukschool_dev');

        const targetId = 'S26H302092';
        console.log(`Searching for member with ID related to: ${targetId}`);

        // Check oauth_id
        try {
            const resOauth = await client.query(`SELECT id, email, nickname, oauth_id FROM auth_member WHERE oauth_id = $1`, [targetId]);
            if (resOauth.rows.length > 0) {
                console.log('Found by oauth_id:', resOauth.rows[0]);
            } else {
                console.log('Not found by oauth_id');
            }
        } catch (e) {
            console.log('Error checking oauth_id:', e.message);
        }

        // Check nickname
        try {
            const resNick = await client.query(`SELECT id, email, nickname, oauth_id FROM auth_member WHERE nickname = $1`, [targetId]);
            if (resNick.rows.length > 0) {
                console.log('Found by nickname:', resNick.rows[0]);
            } else {
                console.log('Not found by nickname');
            }
        } catch (e) {
            console.log('Error checking nickname:', e.message);
        }

    } catch (err) {
        console.error('Error connecting:', err);
    } finally {
        await client.end();
    }
}

checkMember();
