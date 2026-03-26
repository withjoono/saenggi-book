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

        console.log('Querying officer_list_tb...');

        // Query all officers
        const officerQuery = `
            SELECT o.id, o.officer_name, o.university, o.member_id, 
                   m.email, m.nickname, m.password
            FROM officer_list_tb o
            LEFT JOIN auth_member m ON o.member_id = m.id
            ORDER BY o.id
        `;

        const officerRes = await client.query(officerQuery);
        const officers = officerRes.rows;

        console.log(`Found ${officers.length} officers:`);

        for (const officer of officers) {
            console.log(`\n[Officer ID: ${officer.id}] Name: ${officer.officer_name}, Univ: ${officer.university}`);
            console.log(`  Linked Member ID: ${officer.member_id}`);
            console.log(`  Email: ${officer.email}, Nickname: ${officer.nickname}`);

            if (officer.member_id) {
                // Check pending evaluations for this member
                const evalsQuery = `
                    SELECT COUNT(*) as count 
                    FROM officer_student_evaludate_relation_tb 
                    WHERE member_id = $1 AND status = 'READY'
                `;
                const evalsRes = await client.query(evalsQuery, [officer.member_id]);
                console.log(`  Pending Evals (READY): ${evalsRes.rows[0].count}`);
            } else {
                console.log(`  (No linked member account)`);
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
})();
