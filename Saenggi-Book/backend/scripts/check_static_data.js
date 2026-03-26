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

        const tables = ['ss_major_field', 'ss_mid_field', 'ss_minor_field'];

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT count(*) FROM ${table}`);
                console.log(`${table}: ${res.rows[0].count}`);
            } catch (err) {
                console.log(`${table}: Error - ${err.message}`);
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
