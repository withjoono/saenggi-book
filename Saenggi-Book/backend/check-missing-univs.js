const { Client } = require('pg');

const devClient = new Client({
  host: '127.0.0.1',
  port: 5433,
  user: 'postgres',
  password: 'Junho@46852',
  database: 'geobukschool_dev',
});

const prodClient = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

async function main() {
  await devClient.connect();
  await prodClient.connect();
  
  const devRes = await devClient.query('SELECT code, name, region, establishment_type FROM ts_universities ORDER BY code');
  const prodRes = await prodClient.query('SELECT code, name FROM ts_universities ORDER BY code');
  
  const prodCodes = new Set(prodRes.rows.map(r => r.code));
  const devCodes = new Set(devRes.rows.map(r => r.code));
  
  console.log('=== Dev에만 있는 대학 (Prod에 없음) ===');
  const missingInProd = devRes.rows.filter(r => !prodCodes.has(r.code));
  missingInProd.forEach(r => console.log(`${r.code}: ${r.name} (${r.region})`));
  console.log(`\n총 ${missingInProd.length}개\n`);
  
  console.log('=== Prod에만 있는 대학 (Dev에 없음) ===');
  const missingInDev = prodRes.rows.filter(r => !devCodes.has(r.code));
  missingInDev.forEach(r => console.log(`${r.code}: ${r.name}`));
  console.log(`\n총 ${missingInDev.length}개`);
  
  console.log('\n=== 요약 ===');
  console.log(`Dev 대학 수: ${devRes.rows.length}`);
  console.log(`Prod 대학 수: ${prodRes.rows.length}`);
  
  await devClient.end();
  await prodClient.end();
}
main();
