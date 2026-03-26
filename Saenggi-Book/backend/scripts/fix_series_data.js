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

        console.log('--- Updating Record #2 (Horticulture -> Software) ---');

        // Find the record for Officer 1 (who was assigned Horticulture)
        // Assuming Officer 1 is the one with Horticulture. 
        // Based on previous verify, Rec #2 was ID: 4, OfficerID: 1.

        const updateRes = await client.query(`
            UPDATE officer_student_evaludate_relation_tb
            SET series = '공학계열>컴퓨터공학>소프트웨어', update_dt = NOW()
            WHERE member_id = 1 AND student_id = 8
            RETURNING id, series
        `);

        if (updateRes.rows.length > 0) {
            console.log(`✅ Updated Record ID ${updateRes.rows[0].id} to "${updateRes.rows[0].series}"`);
        } else {
            console.log("❌ No record found for Officer 1 and Student 8.");
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
