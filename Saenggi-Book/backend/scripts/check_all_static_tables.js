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

        const tables = [
            'earlyd_subject_code_list_tb',
            'ss_general_field',
            'ss_major_field',
            'ss_mid_field',
            'ss_minor_field',
            'ss_admission_subtype',
            'ss_admission_subtype_category',
            'ss_university',
            'ss_admission',
            'ss_recruitment_unit'
        ];

        for (const table of tables) {
            try {
                // Select columns to verify schema match
                const res = await client.query(`SELECT * FROM ${table} LIMIT 1`);
                console.log(`✅ ${table}: Scanned ok`);
            } catch (err) {
                console.log(`❌ ${table}: Error - ${err.message}`);
            }
        }

    } catch (e) {
        console.error('FINAL ERROR:', e);
    } finally {
        await client.end();
    }
}

main();
