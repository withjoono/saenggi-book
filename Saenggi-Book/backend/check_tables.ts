
import { Client } from 'pg';

const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
});

async function checkTables() {
    try {
        await client.connect();
        console.log('Connected to database geobukschool_dev');

        const tableNames = [
            'sv_attendance',
            'sv_select_subject',
            'sv_subject_learning',
            'sv_volunteer',
            'sv_sport_art'
        ];

        const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
    `;

        const res = await client.query(query, [tableNames]);

        const foundTables = res.rows.map(row => row.table_name);
        console.log('Found tables:', foundTables);

        const missingTables = tableNames.filter(name => !foundTables.includes(name));
        if (missingTables.length > 0) {
            console.log('Missing tables:', missingTables);
        } else {
            console.log('All tables found.');
        }

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await client.end();
    }
}

checkTables();
