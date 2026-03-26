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
            console.log('❌ User test@test.com NOT found.');
            return;
        }

        const user = userRes.rows[0];
        console.log(`✅ User found: ID=${user.id}`);

        console.log('\n[2] Checking officer record...');
        const officerRes = await client.query(
            "SELECT * FROM officer_list_tb WHERE member_id = $1",
            [user.id]
        );

        if (officerRes.rows.length === 0) {
            console.log('❌ No officer record found. Restoring "거북쌤"...');
            await client.query(`
                INSERT INTO officer_list_tb 
                (approval_status, create_dt, del_yn, education, officer_name, officer_profile_image, university, update_dt, member_id)
                VALUES 
                (1, NOW(), 'N', 'Seoul National Univ.', '거북쌤', 'https://via.placeholder.com/150', 'Seoul National Univ.', NOW(), $1)
            `, [user.id]);
            console.log('✅ "거북쌤" officer restored.');
        } else {
            console.log('✅ Officer record exists.');
            if (officerRes.rows[0].del_yn === 'Y') {
                console.log('⚠️ Officer is hidden. Unhiding...');
                await client.query("UPDATE officer_list_tb SET del_yn = 'N' WHERE id = $1", [officerRes.rows[0].id]);
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
