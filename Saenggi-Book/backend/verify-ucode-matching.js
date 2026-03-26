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

  // 1. 엑셀에서 대학코드 추출
  console.log('=== 엑셀 데이터 로딩 ===');
  const wb = XLSX.readFile('uploads/2025-jungsi-cut-for-db-1.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log('엑셀 레코드 수:', data.length);

  // 엑셀 대학코드 목록
  const excelUnivCodes = new Map();
  data.forEach(row => {
    const code = row['대학코드'];
    const univ = row['university'];
    if (code && !excelUnivCodes.has(code)) {
      excelUnivCodes.set(code, univ);
    }
  });
  console.log('엑셀 대학코드 수:', excelUnivCodes.size);

  // 2. DB 대학코드 조회
  console.log('\n=== DB 대학 데이터 ===');
  const dbUnivs = await client.query(`
    SELECT DISTINCT u.id, u.name, u.code
    FROM ts_universities u
    JOIN ts_regular_admissions ra ON ra.university_id = u.id
    ORDER BY u.code
  `);
  console.log('DB 정시 대학 수:', dbUnivs.rows.length);

  // DB 대학코드 맵
  const dbCodeMap = new Map();
  dbUnivs.rows.forEach(u => {
    dbCodeMap.set(u.code, { id: u.id, name: u.name });
  });

  // 3. 매칭 분석
  console.log('\n=== 대학코드 매칭 분석 ===');
  let matched = 0;
  let unmatched = [];

  for (const [excelCode, excelUniv] of excelUnivCodes) {
    if (dbCodeMap.has(excelCode)) {
      matched++;
      const dbUniv = dbCodeMap.get(excelCode);
      // 대학명도 확인
      if (!excelUniv.includes(dbUniv.name.replace('대', '대학교'))) {
        console.log(`  ⚠️ 코드 매칭되지만 이름 다름: ${excelCode}`);
        console.log(`     엑셀: ${excelUniv} | DB: ${dbUniv.name}`);
      }
    } else {
      unmatched.push({ code: excelCode, univ: excelUniv });
    }
  }

  console.log(`\n✅ 매칭 성공: ${matched}개`);
  console.log(`❌ 매칭 실패: ${unmatched.length}개`);

  if (unmatched.length > 0) {
    console.log('\n매칭 안된 대학코드:');
    unmatched.forEach(u => console.log(`  ${u.code} | ${u.univ}`));
  }

  // 4. 매칭된 대학 상세
  console.log('\n=== 매칭된 대학 샘플 ===');
  let sampleCount = 0;
  for (const [excelCode, excelUniv] of excelUnivCodes) {
    if (dbCodeMap.has(excelCode) && sampleCount < 20) {
      const dbUniv = dbCodeMap.get(excelCode);
      console.log(`  ${excelCode} → ${excelUniv} = ${dbUniv.name} (id:${dbUniv.id})`);
      sampleCount++;
    }
  }

  // 5. 전체 레코드 매칭 확인
  console.log('\n=== 전체 레코드 매칭 ===');
  let recordMatched = 0;
  let recordUnmatched = 0;

  for (const row of data) {
    const code = row['대학코드'];
    if (dbCodeMap.has(code)) {
      recordMatched++;
    } else {
      recordUnmatched++;
    }
  }

  console.log(`레코드 매칭: ${recordMatched}개`);
  console.log(`레코드 미매칭: ${recordUnmatched}개`);

  await client.end();
}

run().catch(console.error);
