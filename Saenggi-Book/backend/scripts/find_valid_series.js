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

        console.log('--- Searching for valid Bio series ---');

        // Mid Field = 생명과학?
        const midRes = await client.query("SELECT id, name, major_field_id FROM ss_mid_field WHERE name LIKE '%생명%'");
        if (midRes.rows.length === 0) {
            console.log("No Mid field '생명' found.");
        } else {
            midRes.rows.forEach(mid => {
                console.log(`Mid: ${mid.name} (ID: ${mid.id})`);
            });

            const midId = midRes.rows[0].id;
            const majorId = midRes.rows[0].major_field_id;

            // Get Major Name
            const majorRes = await client.query(`SELECT name FROM ss_major_field WHERE id = ${majorId}`);
            const majorName = majorRes.rows[0].name;

            // Get Minors
            const minorRes = await client.query(`SELECT name FROM ss_minor_field WHERE mid_field_id = ${midId}`);
            if (minorRes.rows.length > 0) {
                const minorName = minorRes.rows[0].name;
                console.log(`\nVALID SERIES: ${majorName}>${midRes.rows[0].name}>${minorName}`);
            } else {
                console.log(`\nNo Minors for ${midRes.rows[0].name}. (This might still be valid if UI handles missing minor?)`);
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
