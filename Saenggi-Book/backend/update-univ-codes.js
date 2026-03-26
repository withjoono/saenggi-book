const { Client } = require('pg');
const XLSX = require('xlsx');

async function run() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev'
  });

  await client.connect();
  console.log('DB 연결 성공\n');

  // 1. 2026 정시 디비 엑셀에서 대학 정보 추출
  console.log('=== 2026 정시 디비 엑셀 로딩 ===');
  const wb = XLSX.readFile('uploads/2026 정시 디비 251205.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // 대학 정보 추출 (지역, 대학명, 대학코드)
  const excelUnivs = new Map();
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    const region = row[0];    // 지역
    const univName = row[1];  // 대학명
    const univCode = row[84]; // 대학코드

    if (univName && univCode && !excelUnivs.has(univCode)) {
      excelUnivs.set(univCode, { name: univName, region: region });
    }
  }
  console.log('엑셀 대학 수:', excelUnivs.size);

  // 2. 현재 DB 대학 조회
  console.log('\n=== 현재 DB 대학 조회 ===');
  const dbUnivs = await client.query(`SELECT id, name, code, region FROM ts_universities ORDER BY id`);
  console.log('DB 대학 수:', dbUnivs.rows.length);

  // DB 맵 생성
  const dbByCode = new Map();
  const dbByName = new Map();
  dbUnivs.rows.forEach(u => {
    dbByCode.set(u.code, u);
    dbByName.set(u.name, u);
  });

  // 3. 업데이트/추가 필요한 항목 분석
  console.log('\n=== 분석 ===');
  const toUpdate = [];  // 코드 업데이트 필요
  const toInsert = [];  // 신규 추가 필요

  for (const [code, excel] of excelUnivs) {
    // DB에 해당 코드 있는지
    if (dbByCode.has(code)) {
      // 코드 존재 - OK
    } else {
      // 코드 없음 - 대학명으로 찾기
      if (dbByName.has(excel.name)) {
        const dbUniv = dbByName.get(excel.name);
        toUpdate.push({
          id: dbUniv.id,
          oldCode: dbUniv.code,
          newCode: code,
          name: excel.name
        });
      } else {
        // 대학명도 없음 - 신규 추가
        toInsert.push({
          code: code,
          name: excel.name,
          region: excel.region
        });
      }
    }
  }

  console.log(`코드 업데이트 필요: ${toUpdate.length}개`);
  console.log(`신규 추가 필요: ${toInsert.length}개`);

  // 4. 코드 업데이트
  if (toUpdate.length > 0) {
    console.log('\n=== 코드 업데이트 ===');
    for (const item of toUpdate) {
      console.log(`  ${item.name}: ${item.oldCode} → ${item.newCode}`);
      await client.query(
        'UPDATE ts_universities SET code = $1 WHERE id = $2',
        [item.newCode, item.id]
      );
    }
    console.log(`${toUpdate.length}개 업데이트 완료`);
  }

  // 5. 신규 추가
  if (toInsert.length > 0) {
    console.log('\n=== 신규 대학 추가 ===');
    for (const item of toInsert) {
      console.log(`  ${item.code}: ${item.name} (${item.region})`);
      await client.query(
        `INSERT INTO ts_universities (name, code, region, establishment_type)
         VALUES ($1, $2, $3, 'PRIVATE')`,
        [item.name, item.code, item.region]
      );
    }
    console.log(`${toInsert.length}개 추가 완료`);
  }

  // 6. 결과 확인
  console.log('\n=== 업데이트 후 확인 ===');
  const afterUnivs = await client.query(`SELECT id, name, code FROM ts_universities ORDER BY code`);
  console.log('DB 대학 수:', afterUnivs.rows.length);

  // 다시 매칭 확인
  let matchedAfter = 0;
  for (const [code, excel] of excelUnivs) {
    const found = afterUnivs.rows.find(u => u.code === code);
    if (found) matchedAfter++;
  }
  console.log(`엑셀-DB 매칭: ${matchedAfter}/${excelUnivs.size}`);

  await client.end();
  console.log('\n완료!');
}

run().catch(console.error);
