const { Client } = require('pg');

(async () => {
    const client = new Client({
        host: '127.0.0.1',
        port: 5432,
        user: 'tsuser',
        password: 'tsuser1234',
        database: 'geobukschool_dev'
    });

    try {
        await client.connect();

        // 1. Total Count
        const resCount = await client.query("SELECT COUNT(*) as count FROM susi_jonghap_recruitment");
        console.log(`\nTotal Records in susi_jonghap_recruitment: ${resCount.rows[0].count}`);

        // 2. Distinct Major Fields
        console.log('\n[Distinct Major Fields]');
        const resMajor = await client.query("SELECT DISTINCT major_field FROM susi_jonghap_recruitment LIMIT 10");
        console.table(resMajor.rows);

        // 3. Distinct Minor Fields
        console.log('\n[Distinct Minor Fields (Sample)]');
        const resMinor = await client.query("SELECT DISTINCT minor_field FROM susi_jonghap_recruitment WHERE minor_field IS NOT NULL LIMIT 10");
        console.table(resMinor.rows);

        // 4. Check for 'Management' (Standard field)
        const resMgmt = await client.query("SELECT COUNT(*) as count FROM susi_jonghap_recruitment WHERE recruitment_unit LIKE '%경영%'");
        console.log(`\nRecords containing '경영' in recruitment_unit: ${resMgmt.rows[0].count}`);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
})();
