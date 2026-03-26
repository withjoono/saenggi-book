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

        console.log('--- Checking Display Order Column ---');
        try {
            const res = await client.query('SELECT id, display_order FROM ss_admission_subtype_category LIMIT 1');
            console.log('✅ display_order column exists.');
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }

    } catch (e) {
        console.error('FINAL ERROR:', e);
    } finally {
        await client.end();
    }
}

main();
