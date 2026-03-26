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

        console.log('--- Checking for Pharmacy (약학) ---');
        const midRes = await client.query("SELECT name FROM ss_mid_field WHERE name LIKE '%약학%'");
        console.log(`Mid matches: ${midRes.rows.length}`);
        midRes.rows.forEach(r => console.log(` - Mid: ${r.name}`));

        const minorRes = await client.query("SELECT name FROM ss_minor_field WHERE name LIKE '%약학%'");
        console.log(`Minor matches: ${minorRes.rows.length}`);
        minorRes.rows.forEach(r => console.log(` - Minor: ${r.name}`));

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
