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

        console.log('--- ALL MINOR FIELDS ---');
        const res = await client.query(`
            SELECT mn.name as minor, md.name as mid, mj.name as major
            FROM ss_minor_field mn
            JOIN ss_mid_field md ON mn.mid_field_id = md.id
            JOIN ss_major_field mj ON md.major_field_id = mj.id
        `);

        res.rows.forEach((r, idx) => {
            console.log(`${idx + 1}. ${r.major}>${r.mid}>${r.minor}`);
        });

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
