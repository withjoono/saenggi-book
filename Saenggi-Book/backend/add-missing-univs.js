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
  
  // Dev에서 누락된 대학 정보 가져오기
  const missingCodes = ['U015', 'U040', 'U535'];
  
  for (const code of missingCodes) {
    const devRes = await devClient.query(
      'SELECT code, name, region, establishment_type FROM ts_universities WHERE code = $1',
      [code]
    );
    
    if (devRes.rows.length === 0) {
      console.log(`❌ ${code}: Dev에서 찾을 수 없음`);
      continue;
    }
    
    const univ = devRes.rows[0];
    
    // Prod에 이미 있는지 확인
    const checkRes = await prodClient.query(
      'SELECT id FROM ts_universities WHERE code = $1',
      [code]
    );
    
    if (checkRes.rows.length > 0) {
      console.log(`⏭️  ${code}: ${univ.name} - 이미 존재`);
      continue;
    }
    
    // Prod에 추가
    const insertRes = await prodClient.query(
      'INSERT INTO ts_universities (region, name, code, establishment_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [univ.region, univ.name, univ.code, univ.establishment_type || '']
    );
    
    console.log(`✅ ${code}: ${univ.name} (${univ.region}) - 추가됨 (id: ${insertRes.rows[0].id})`);
  }
  
  await devClient.end();
  await prodClient.end();
}
main();
