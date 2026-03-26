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

        console.log('--- GLOBAL SEARCH ---');

        // Search Minor
        const minorSearch = await client.query(`
            SELECT mn.name as minor, md.name as mid, mj.name as major
            FROM ss_minor_field mn
            JOIN ss_mid_field md ON mn.mid_field_id = md.id
            JOIN ss_major_field mj ON md.major_field_id = mj.id
            WHERE mn.name LIKE '%원예%' OR mn.name LIKE '%작물%'
        `);
        if (minorSearch.rows.length > 0) {
            console.log('Found in Minors:');
            minorSearch.rows.forEach(r => console.log(` - ${r.major} > ${r.mid} > ${r.minor}`));
        } else {
            console.log('No matches for (원예, 작물) in Minors.');
        }

        // Search Mid
        const midSearch = await client.query(`
            SELECT md.name as mid, mj.name as major
            FROM ss_mid_field md
            JOIN ss_major_field mj ON md.major_field_id = mj.id
            WHERE md.name LIKE '%농림%' OR md.name LIKE '%수산%'
        `);
        if (midSearch.rows.length > 0) {
            console.log('Found in Mids:');
            midSearch.rows.forEach(r => console.log(` - ${r.major} > ${r.mid}`));
        } else {
            console.log('No matches for (농림, 수산) in Mids.');
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
