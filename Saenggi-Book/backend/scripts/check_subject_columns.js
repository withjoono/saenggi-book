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

        console.log('--- Checking SubjectCodeList Columns ---');
        const query = `
            SELECT id, main_subject_code, main_subject_name, subject_code, subject_name, type, course_type, is_required
            FROM earlyd_subject_code_list_tb LIMIT 1
        `;
        try {
            await client.query(query);
            console.log('✅ SubjectCodeList columns present.');
        } catch (e) {
            console.log(`❌ SubjectCodeList Error: ${e.message}`);
        }

    } catch (e) {
        console.error('FINAL ERROR:', e);
    } finally {
        await client.end();
    }
}

main();
