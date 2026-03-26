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

  // 1. 2026 정시 디비 엑셀에서 대학코드 추출
  console.log('=== 2026 정시 디비 엑셀 로딩 ===');
  const wb = XLSX.readFile('uploads/2026 정시 디비 251205.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // 대학명(1번)과 대학코드(84번) 매핑
  const excelUnivCodes = new Map();
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    const univName = row[1];
    const univCode = row[84];
    if (univName && univCode && !excelUnivCodes.has(univCode)) {
      excelUnivCodes.set(univCode, univName);
    }
  }
  console.log('엑셀 대학코드 수:', excelUnivCodes.size);

  // 2. DB 대학코드 조회
  console.log('\n=== DB 대학 테이블 ===');
  const dbUnivs = await client.query(`
    SELECT id, name, code FROM ts_universities ORDER BY code
  `);
  console.log('DB 대학 수:', dbUnivs.rows.length);

  // DB 코드 맵
  const dbCodeMap = new Map();
  dbUnivs.rows.forEach(u => {
    dbCodeMap.set(u.code, { id: u.id, name: u.name });
  });

  // 3. 코드 비교
  console.log('\n=== 코드 비교 ===');
  let matched = 0;
  let mismatchName = [];
  let notInDb = [];

  for (const [code, excelName] of excelUnivCodes) {
    if (dbCodeMap.has(code)) {
      const dbUniv = dbCodeMap.get(code);
      if (dbUniv.name === excelName) {
        matched++;
      } else {
        mismatchName.push({ code, excel: excelName, db: dbUniv.name });
      }
    } else {
      notInDb.push({ code, name: excelName });
    }
  }

  console.log(`✅ 완전 일치: ${matched}개`);
  console.log(`⚠️ 코드는 있지만 이름 다름: ${mismatchName.length}개`);
  console.log(`❌ DB에 코드 없음: ${notInDb.length}개`);

  if (mismatchName.length > 0) {
    console.log('\n이름 불일치:');
    mismatchName.forEach(m => console.log(`  ${m.code}: 엑셀="${m.excel}" vs DB="${m.db}"`));
  }

  if (notInDb.length > 0) {
    console.log('\nDB에 없는 코드:');
    notInDb.forEach(n => console.log(`  ${n.code}: ${n.name}`));
  }

  // 4. 2025 컷 엑셀과 비교
  console.log('\n\n=== 2025 컷 엑셀 vs 2026 정시 엑셀 코드 비교 ===');
  const wb2025 = XLSX.readFile('uploads/2025-jungsi-cut-for-db-1.xlsx');
  const ws2025 = wb2025.Sheets[wb2025.SheetNames[0]];
  const data2025 = XLSX.utils.sheet_to_json(ws2025);

  const codes2025 = new Map();
  data2025.forEach(row => {
    const code = row['대학코드'];
    const univ = row['university'];
    if (code && !codes2025.has(code)) {
      codes2025.set(code, univ);
    }
  });

  console.log('2025 컷 엑셀 대학코드 수:', codes2025.size);
  console.log('2026 정시 엑셀 대학코드 수:', excelUnivCodes.size);

  // 2025에만 있는 코드
  const only2025 = [];
  for (const [code, name] of codes2025) {
    if (!excelUnivCodes.has(code)) {
      only2025.push({ code, name });
    }
  }

  // 2026에만 있는 코드
  const only2026 = [];
  for (const [code, name] of excelUnivCodes) {
    if (!codes2025.has(code)) {
      only2026.push({ code, name });
    }
  }

  console.log(`\n2025에만 있는 코드: ${only2025.length}개`);
  if (only2025.length > 0 && only2025.length <= 30) {
    only2025.forEach(u => console.log(`  ${u.code}: ${u.name}`));
  }

  console.log(`\n2026에만 있는 코드: ${only2026.length}개`);
  if (only2026.length > 0 && only2026.length <= 30) {
    only2026.forEach(u => console.log(`  ${u.code}: ${u.name}`));
  }

  // 같은 코드인데 대학명이 다른 경우
  console.log('\n=== 같은 코드, 다른 대학명 ===');
  let diffCount = 0;
  for (const [code, name2025] of codes2025) {
    if (excelUnivCodes.has(code)) {
      const name2026 = excelUnivCodes.get(code);
      // 대학교 → 대 변환 후 비교
      const norm2025 = name2025.replace(/대학교/g, '대').replace(/\s+/g, '');
      const norm2026 = name2026.replace(/대학교/g, '대').replace(/\s+/g, '');
      if (norm2025 !== norm2026) {
        console.log(`  ${code}: 2025="${name2025}" vs 2026="${name2026}"`);
        diffCount++;
      }
    }
  }
  if (diffCount === 0) {
    console.log('  모두 일치!');
  }

  await client.end();
}

run().catch(console.error);
