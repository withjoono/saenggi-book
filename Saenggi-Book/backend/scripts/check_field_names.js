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

        console.log('--- MAJOR FIELDS ---');
        const majors = await client.query('SELECT name FROM ss_major_field');
        majors.rows.forEach(r => console.log(`"${r.name}"`));

        console.log('\n--- MID FIELDS (Filtered for 농림) ---');
        const mids = await client.query("SELECT name FROM ss_mid_field WHERE name LIKE '%농림%' OR name LIKE '%수산%'");
        mids.rows.forEach(r => console.log(`"${r.name}"`));

        console.log('\n--- MINOR FIELDS (Filtered for 작물) ---');
        const minors = await client.query("SELECT name FROM ss_minor_field WHERE name LIKE '%작물%' OR name LIKE '%원예%'");
        minors.rows.forEach(r => console.log(`"${r.name}"`));

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
