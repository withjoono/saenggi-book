const { Client } = require('pg');
const fs = require('fs');

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

        const res = await client.query(
            "SELECT id, member_id, series FROM officer_student_evaludate_relation_tb WHERE student_id = 8 ORDER BY id ASC"
        );

        let output = "";
        output += `Found ${res.rows.length} records.\n`;

        res.rows.forEach((row, idx) => {
            output += `Record #${idx + 1} | ID: ${row.id} | OfficerID: ${row.member_id} | Series: "${row.series}"\n`;
        });

        fs.writeFileSync('scripts/verify_output.txt', output);
        console.log("File written.");

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
