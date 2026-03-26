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

  // 1. 엑셀에서 대학 코드와 대학명 추출
  console.log('=== 엑셀 대학 목록 ===');
  const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const excelUnivs = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
      excelUnivs.push({
        code: row[0],  // 0열의 대학코드
        name: row[1],  // 1열의 대학명
        row: i
      });
    }
  }
  console.log('엑셀 대학 수:', excelUnivs.length);
  console.log('\n샘플:');
  excelUnivs.slice(0, 10).forEach(u => console.log(`  코드:${u.code} | ${u.name}`));

  // 2. DB 대학 목록
  console.log('\n\n=== DB 대학 목록 ===');
  const dbUnivs = await client.query(`
    SELECT DISTINCT u.id, u.name, u.code
    FROM ts_universities u
    JOIN ts_regular_admissions ra ON ra.university_id = u.id
    ORDER BY u.name
  `);
  console.log('DB 정시 대학 수:', dbUnivs.rows.length);

  // DB 대학 맵 생성
  const dbUnivMap = new Map();
  const dbUnivById = new Map();
  dbUnivs.rows.forEach(u => {
    dbUnivMap.set(u.name, u);
    dbUnivById.set(u.id, u);
  });

  // 3. 대학명 정규화 함수
  function normalizeUnivName(name) {
    if (!name) return '';
    return name
      .replace(/\[본교\]/g, '')
      .replace(/\[제\d캠퍼스\]/g, '')
      .replace(/\[분교\]/g, '')
      .replace(/\(글로컬\)/g, '')
      .replace(/대학교/g, '대')
      .replace(/\s+/g, '')
      .trim();
  }

  // 4. 매칭 확인
  console.log('\n\n=== 매칭 분석 ===');
  let matched = 0;
  let unmatched = [];

  for (const excel of excelUnivs) {
    const normalized = normalizeUnivName(excel.name);

    // DB에서 찾기
    if (dbUnivMap.has(normalized)) {
      matched++;
    } else {
      unmatched.push({ code: excel.code, original: excel.name, normalized });
    }
  }

  console.log(`매칭 성공: ${matched}개`);
  console.log(`매칭 실패: ${unmatched.length}개`);

  if (unmatched.length > 0) {
    console.log('\n매칭 안된 대학:');
    unmatched.forEach(u => console.log(`  코드:${u.code} | ${u.original} → ${u.normalized}`));
  }

  // 5. 엑셀 코드와 DB id 매칭 확인 (혹시 코드=id인지)
  console.log('\n\n=== 엑셀 코드 = DB id 확인 ===');
  let codeIdMatch = 0;
  for (const excel of excelUnivs.slice(0, 20)) {
    const dbUniv = dbUnivById.get(excel.code);
    if (dbUniv) {
      const excelNorm = normalizeUnivName(excel.name);
      const match = dbUniv.name === excelNorm ? '✓' : '✗';
      console.log(`  코드:${excel.code} → DB id:${excel.code} ${dbUniv.name} ${match} (엑셀: ${excelNorm})`);
      if (dbUniv.name === excelNorm) codeIdMatch++;
    } else {
      console.log(`  코드:${excel.code} → DB에 id 없음`);
    }
  }

  await client.end();
}

run().catch(console.error);
