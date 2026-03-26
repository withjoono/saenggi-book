
import { Client } from 'pg';

const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    // @ts-ignore
    options: '-c search_path=mysanggibu,hub,susi,jungsi'
});

async function listMembers() {
    try {
        await client.connect();
        console.log('Connected to database geobukschool_dev');

        try {
            console.log('Checking if mysanggibu schema exists:');
            const resSchema = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mysanggibu'");
            console.log('Skipping standard migration check due to history mismatch.');

            console.log('Attempting manual creation of sv_auth_member table (in mysanggibu schema default)...');
            try {
                await client.query(`
                    CREATE TABLE IF NOT EXISTS mysanggibu.sv_auth_member (
                        "id" BIGSERIAL NOT NULL, 
                        "hub_member_id" bigint NOT NULL, 
                        "nickname" character varying(255), 
                        "email" character varying(500), 
                        "member_type" character varying(20) NOT NULL DEFAULT 'student', 
                        "graduate_year" character varying(10), 
                        "major" character varying(10), 
                        "hst_type_id" character varying(20), 
                        "account_stop_yn" character varying(1) NOT NULL DEFAULT 'N', 
                        "create_dt" TIMESTAMP, 
                        "update_dt" TIMESTAMP, 
                        CONSTRAINT "UQ_c1308731e66268fa4e2bd3b260d" UNIQUE ("hub_member_id"), 
                        CONSTRAINT "PK_7a579f0f64ef1d3d020d6251af7" PRIMARY KEY ("id")
                    )
                 `);
                console.log('Table creation query executed.');

                // Create index if not exists (Postgres doesn't support IF NOT EXISTS for INDEX easily in one line, but we can try catch)
                try {
                    await client.query(`CREATE UNIQUE INDEX "IDX_c1308731e66268fa4e2bd3b260" ON mysanggibu.sv_auth_member ("hub_member_id")`);
                    console.log('Index created.');
                } catch (idxErr) {
                    console.log('Index creation skipped (likely exists):', idxErr.message);
                }
            } catch (err) {
                console.log('Error creating table manualy:', err.message);
            }

            console.log('Searching for sv_auth_member table after manual creation:');
            const resFind = await client.query(`
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_name = 'sv_auth_member'
            `);
            console.table(resFind.rows);

            if (resFind.rows.length > 0) {
                const schema = resFind.rows[0].table_schema;
                console.log(`Found sv_auth_member in schema: ${schema}`);
            } else {
                console.log('sv_auth_member table NOT found even after manual creation.');
            }
        } catch (e) {
            console.log('Error checking/creating schema:', e.message);
        }

    } catch (err) {
        console.error('Error connecting:', err);
    } finally {
        await client.end();
    }
}

listMembers();
