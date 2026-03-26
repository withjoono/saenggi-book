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

        // 1. Check Total Ipkyul Count
        const resCount = await client.query("SELECT COUNT(*) as count FROM susi_jonghap_ipkyul");
        console.log(`\nTotal Records in susi_jonghap_ipkyul: ${resCount.rows[0].count}`);

        // 2. Find Pharmacy Recruitment IDs
        console.log('\n[Checking Pharmacy Recruitment records]');
        const resPharmacy = await client.query("SELECT id, ida_id, university_name, admission_name FROM susi_jonghap_recruitment WHERE minor_field LIKE '%약학%' OR minor_field LIKE '%의약%' LIMIT 5");

        if (resPharmacy.rows.length === 0) {
            console.log("No Pharmacy recruitment records found.");
        } else {
            console.table(resPharmacy.rows);

            // 3. Check for matching Ipkyul data
            console.log('\n[Checking Matches in susi_jonghap_ipkyul]');
            for (const row of resPharmacy.rows) {
                const idaId = row.ida_id;
                const matches = await client.query("SELECT * FROM susi_jonghap_ipkyul WHERE ida_id = $1", [idaId]);
                if (matches.rows.length > 0) {
                    console.log(`- MATCH FOUND for ${row.university_name} (${idaId}): gradeAvg=${matches.rows[0].grade_avg}`);
                } else {
                    console.log(`- NO MATCH for ${row.university_name} (${idaId})`);
                }
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
})();
