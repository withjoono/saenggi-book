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

        console.log('Checking officer_bottom_survey_tb...');

        const surveyQuery = `SELECT COUNT(*) as count FROM officer_bottom_survey_tb`;
        const surveyRes = await client.query(surveyQuery);
        console.log(`Total survey items: ${surveyRes.rows[0].count}`);

        if (parseInt(surveyRes.rows[0].count) > 0) {
            const itemsQuery = `SELECT * FROM officer_bottom_survey_tb ORDER BY order_num ASC LIMIT 5`;
            const itemsRes = await client.query(itemsQuery);
            console.log('Sample items:', itemsRes.rows);
        } else {
            console.log('❌ No survey items found! This is the cause of the issue.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
})();
