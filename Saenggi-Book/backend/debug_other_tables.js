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

        const resRecruitmentUnit = await client.query("SELECT COUNT(*) as count FROM recruitment_unit");
        console.log(`\nTotal Records in recruitment_unit: ${resRecruitmentUnit.rows[0].count}`);

        const resIpkyul = await client.query("SELECT COUNT(*) as count FROM susi_jonghap_ipkyul");
        console.log(`\nTotal Records in susi_jonghap_ipkyul: ${resIpkyul.rows[0].count}`);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
})();
