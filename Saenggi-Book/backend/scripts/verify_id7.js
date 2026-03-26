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

        console.log('\n[1] Finding evaluations for User ID 7 (Kang Junho)...');
        const res = await client.query(
            "SELECT id, member_id, series, status FROM officer_student_evaludate_relation_tb WHERE student_id = 7"
        );

        console.log(`Found ${res.rows.length} records.`);
        res.rows.forEach(r => console.log(r));

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
