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

        console.log('\n[1] Finding user withjuno6...');
        const userRes = await client.query(
            "SELECT id, email FROM auth_member WHERE email LIKE $1 OR email LIKE $2",
            ['withjuno6@nver.com', 'withjuno6@naver.com']
        );

        if (userRes.rows.length === 0) {
            console.log('❌ User not found');
            return;
        }
        const user = userRes.rows[0];
        console.log(`✅ User found: ID=${user.id}`);

        console.log('\n[2] Checking evaluation records...');
        // Assuming officer_evaluation_tb has 'target_member_id' or 'member_id' depending on schema (Need to verify Entity)
        // From memory/context, it's likely 'target_member_id' (student) or just 'member_id' (if it stores student).
        // Let's check information_schema to be sure or just guess generic naming.
        // Actually, let's view the entity file first to be 100% sure. But for now I'll query assuming 'member_id' might be the one,
        // or I'll list columns first.

        const columnRes = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'officer_evaluation_tb'"
        );
        const columns = columnRes.rows.map(r => r.column_name);
        console.log('Columns:', columns.join(', '));

        // Construct query based on columns
        let query = "";
        // Usually: id, officer_id, member_id (student?), status...
        if (columns.includes('member_id')) {
            query = "SELECT * FROM officer_evaluation_tb WHERE member_id = $1";
        } else if (columns.includes('student_id')) {
            query = "SELECT * FROM officer_evaluation_tb WHERE student_id = $1";
        } else {
            console.log("Could not identify student ID column");
            return;
        }

        const evalRes = await client.query(query, [user.id]);

        if (evalRes.rows.length === 0) {
            console.log('❌ No evaluation records found.');
        } else {
            console.log(`✅ Found ${evalRes.rows.length} records.`);
            console.table(evalRes.rows);
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
