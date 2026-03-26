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

        console.log("Connected to DB.");

        // 1. Check Minor Field ID and Name for '약학'
        const minorRes = await client.query("SELECT * FROM ss_minor_field WHERE name = '약학'");
        if (minorRes.rows.length === 0) {
            console.log("No Minor Field found for '약학'");
            return;
        }
        const minorId = minorRes.rows[0].id;
        const minorName = minorRes.rows[0].name;
        console.log(`Minor Field: ID=${minorId}, Name=${minorName}`);

        // 2. Check Recruitment Records for this Minor Field
        console.log(`\nChecking records with minor_field LIKE '%${minorName}%'...`);
        const recRes = await client.query(
            "SELECT id, university_name, admission_category, minor_field, major_field FROM susi_jonghap_recruitment WHERE minor_field LIKE $1",
            [`%${minorName}%`]
        );

        console.log(`Total Matches via LIKE: ${recRes.rows.length}`);

        if (recRes.rows.length > 0) {
            // Group by admission_category
            const categories = {};
            recRes.rows.forEach(r => {
                const cat = r.admission_category || 'NULL';
                if (!categories[cat]) categories[cat] = 0;
                categories[cat]++;
            });
            console.log("Matches by Admission Category:", categories);

            console.log("Matches by Admission Category:", categories);

            // KEY: Check Field distribution
            const majors = {};
            const mids = {};
            recRes.rows.forEach(r => {
                const mj = r.major_field || 'NULL';
                if (!majors[mj]) majors[mj] = 0;
                majors[mj]++;

                const md = r.mid_field || 'NULL';
                if (!mids[md]) mids[md] = 0;
                mids[md]++;
            });
            console.log("\nMatches by Major Field:", majors);
            console.log("Matches by Mid Field:", mids);

            console.log("\nSample Records (id, univ, minor, mid, major):");
            recRes.rows.slice(0, 5).forEach(r => {
                console.log(`[${r.id}] ${r.university_name}: ${r.minor_field} | ${r.mid_field} | ${r.major_field}`);
            });
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
})();
