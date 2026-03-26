const { Client } = require('pg');
const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function main() {
  await client.connect();
  
  const check = await client.query('SELECT * FROM ts_universities WHERE code = $1', ['U504']);
  if (check.rows.length > 0) {
    console.log('이미 존재:', check.rows[0]);
    await client.end();
    return;
  }
  
  const res = await client.query(
    'INSERT INTO ts_universities (region, name, code, establishment_type) VALUES ($1, $2, $3, $4) RETURNING *',
    ['강원', '강원대학교', 'U504', '']
  );
  console.log('추가 완료:', res.rows[0]);
  await client.end();
}
main();
