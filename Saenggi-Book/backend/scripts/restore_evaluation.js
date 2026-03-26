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

        // 1. Get Student (withjuno6)
        console.log('\n[1] Finding student (withjuno6)...');
        const studentRes = await client.query("SELECT id FROM auth_member WHERE email LIKE 'withjuno6%'");
        if (studentRes.rows.length === 0) { console.error('❌ Student withjuno6 not found'); return; }
        const studentId = studentRes.rows[0].id; // 8
        console.log(`✅ Student ID: ${studentId}`);

        // 2. Get Officer 1 (test@test.com / 거북쌤)
        console.log('\n[2] Finding officer 1 (test@test.com)...');
        const officerRes1 = await client.query("SELECT id FROM auth_member WHERE email = 'test@test.com'");
        if (officerRes1.rows.length === 0) { console.error('❌ Officer test@test.com not found'); return; }
        const officerMemberId1 = officerRes1.rows[0].id; // 1
        console.log(`✅ Officer 1 ID: ${officerMemberId1}`);

        // 3. Get Officer 2 (using student as dummy officer, assuming we made them officer previously)
        // In fix_officer_and_ticket.js, we inserted an officer record with member_id = studentId (8).
        const officerMemberId2 = studentId;
        console.log(`✅ Officer 2 ID (Dummy): ${officerMemberId2}`);

        // 4. Create Evaluation Records
        console.log('\n[3] Creating dummy evaluation records...');

        // Strategy: Use Officer 1 for first eval, Officer 2 for second eval
        // because unique constraint ['student_id', 'member_id'] exists.

        const evaluations = [
            { officerId: officerMemberId1, series: '자연과학계열>농림・수산>작물・원예학', status: 'COMPLETE' },
            { officerId: officerMemberId2, series: '인문사회계열>경영・경제>경영학', status: 'READY' }
        ];

        for (const ev of evaluations) {
            // Check if exists using member_id (officer) and student_id
            const check = await client.query(
                "SELECT id FROM officer_student_evaludate_relation_tb WHERE member_id = $1 AND student_id = $2",
                [ev.officerId, studentId]
            );

            if (check.rows.length > 0) {
                console.log(`ℹ️ Record for officer ${ev.officerId} already exists.`);
            } else {
                await client.query(
                    "INSERT INTO officer_student_evaludate_relation_tb (member_id, student_id, series, status, create_dt, update_dt) VALUES ($1, $2, $3, $4, NOW(), NOW())",
                    [ev.officerId, studentId, ev.series, ev.status]
                );
                console.log(`✅ Created ${ev.status} record for officer ${ev.officerId}`);
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
