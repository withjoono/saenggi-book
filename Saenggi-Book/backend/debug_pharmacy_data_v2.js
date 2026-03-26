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

        // 1. Find 'Pharmacy' related Minor Fields
        console.log('\n[Searching for Pharmacy logic in ss_minor_field]');
        const resMinor = await client.query("SELECT * FROM ss_minor_field WHERE name LIKE '%약학%' OR name LIKE '%의약%'");
        console.table(resMinor.rows);

        if (resMinor.rows.length > 0) {
            for (const field of resMinor.rows) {
                const name = field.name;
                console.log(`\n[Checking Matches for Minor Field: "${name}"]`);

                // Check exact match in minor_field column of susi_jonghap_recruitment
                const exact = await client.query(
                    "SELECT COUNT(*) as count FROM susi_jonghap_recruitment WHERE minor_field = $1",
                    [name]
                );
                console.log(`- Exact match (minor_field = '${name}'): ${exact.rows[0].count}`);

                // Check partial match
                const partial = await client.query(
                    "SELECT COUNT(*) as count FROM susi_jonghap_recruitment WHERE minor_field LIKE $1",
                    [`%${name}%`]
                );
                console.log(`- Partial match (minor_field LIKE '%${name}%'): ${partial.rows[0].count}`);

                // Check if it exists in major_field or mid_field
                const major = await client.query(
                    "SELECT COUNT(*) as count FROM susi_jonghap_recruitment WHERE major_field LIKE $1",
                    [`%${name}%`]
                );
                console.log(`- Match in 'major_field': ${major.rows[0].count}`);
            }
        } else {
            console.log('No Minor Field found with "약학" or "의약".');
        }

        // Sample recruitment records
        console.log('\n[Sample Recruitment Records containing "약학"]');
        const samples = await client.query(
            "SELECT id, university_name, major_field, mid_field, minor_field, recruitment_unit FROM susi_jonghap_recruitment WHERE recruitment_unit LIKE '%약학%' OR minor_field LIKE '%약학%' LIMIT 5"
        );
        console.table(samples.rows);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
})();
