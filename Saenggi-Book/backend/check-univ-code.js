const { Client } = require('pg');
const XLSX = require('xlsx');

async function run() {
  // 1. 엑셀 파일 구조 확인
  console.log('=== 엑셀 파일 구조 확인 ===');
  const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  console.log('시트 목록:', wb.SheetNames);
  console.log('\n첫 10행:');
  for (let i = 0; i < 10; i++) {
    console.log(`${i}행:`, data[i]);
  }

  // 대학코드가 있는 열 찾기
  console.log('\n\n=== 대학코드 열 찾기 ===');
  // 첫 번째 데이터 행들 확인
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (row && row.length > 0) {
      // 숫자로 된 코드 찾기
      for (let j = 0; j < row.length; j++) {
        const val = row[j];
        if (val && typeof val === 'number' && val > 1000 && val < 100000) {
          console.log(`${i}행 [${j}열]: ${val} (가능한 대학코드)`);
        }
      }
    }
  }

  // 대학 행 확인 (대학명이 있는 행)
  console.log('\n\n=== 대학 행 샘플 ===');
  let count = 0;
  for (let i = 0; i < data.length && count < 10; i++) {
    const row = data[i];
    if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
      console.log(`${i}행:`, row.slice(0, 5));
      count++;
    }
  }

  // DB 연결 및 대학 코드 확인
  console.log('\n\n=== DB 대학 코드 확인 ===');
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev'
  });

  await client.connect();

  // 대학 테이블 구조 확인
  const cols = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ts_universities'
    ORDER BY ordinal_position
  `);
  console.log('\nts_universities 컬럼:');
  cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  // 대학 데이터 샘플
  const univs = await client.query(`
    SELECT * FROM ts_universities ORDER BY name LIMIT 20
  `);
  console.log('\n대학 샘플:');
  univs.rows.forEach(r => console.log(`  id:${r.id} | ${r.name} | code:${r.code}`));

  await client.end();
}

run().catch(console.error);
