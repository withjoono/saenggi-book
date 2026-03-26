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

  // 1. DB 정시 데이터 조회
  const dbResult = await client.query(`
    SELECT
      ra.id,
      ra.year,
      ra.recruitment_name,
      ra.admission_type,
      u.name as university_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    ORDER BY u.name, ra.recruitment_name
  `);

  console.log('=== DB 정시 데이터 ===');
  console.log('총 레코드 수:', dbResult.rows.length);
  console.log('\n샘플 (처음 20개):');
  dbResult.rows.slice(0, 20).forEach((r, i) => {
    console.log(`${i + 1}. ${r.university_name} | ${r.admission_type} | ${r.recruitment_name}`);
  });

  // 2. 엑셀 데이터 읽기
  const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const excelRecords = [];
  let currentUniv = '';
  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
      currentUniv = row[1];
    }
    if (row[3] && currentUniv && typeof row[3] === 'string') {
      excelRecords.push({
        university: currentUniv,
        group: row[2],
        department: row[3],
      });
    }
  }

  console.log('\n=== 엑셀 데이터 ===');
  console.log('총 레코드 수:', excelRecords.length);

  // 3. 대학명 비교
  const dbUnivs = [...new Set(dbResult.rows.map(r => r.university_name))];
  const excelUnivs = [...new Set(excelRecords.map(r => r.university))];

  console.log('\n=== 대학명 비교 ===');
  console.log('DB 대학 수:', dbUnivs.length);
  console.log('엑셀 대학 수:', excelUnivs.length);

  // 엑셀 대학명을 정규화 (캠퍼스 표기 제거)
  const normalizeUniv = (name) => {
    return name
      .replace(/\[본교\]/g, '')
      .replace(/\[제\d캠퍼스\]/g, '')
      .replace(/\[분교\]/g, '')
      .replace(/\(글로컬\)/g, '')
      .trim();
  };

  // 매칭 분석
  let matched = 0;
  let unmatched = [];

  for (const excelUniv of excelUnivs) {
    const normalized = normalizeUniv(excelUniv);
    const found = dbUnivs.find(dbUniv =>
      dbUniv === normalized ||
      dbUniv.includes(normalized) ||
      normalized.includes(dbUniv)
    );
    if (found) {
      matched++;
    } else {
      unmatched.push({ excel: excelUniv, normalized });
    }
  }

  console.log('\n매칭된 대학:', matched);
  console.log('매칭 안된 대학:', unmatched.length);

  if (unmatched.length > 0) {
    console.log('\n매칭 안된 대학 목록 (처음 30개):');
    unmatched.slice(0, 30).forEach(u => console.log(` - ${u.excel} → ${u.normalized}`));
  }

  // 4. 특정 대학으로 모집단위 매칭 테스트
  const testUniv = '서울대학교';
  const dbDepts = dbResult.rows
    .filter(r => r.university_name === testUniv)
    .map(r => r.recruitment_name);

  const excelDepts = excelRecords
    .filter(r => normalizeUniv(r.university) === testUniv)
    .map(r => r.department);

  console.log(`\n=== ${testUniv} 모집단위 비교 ===`);
  console.log('DB 모집단위 수:', dbDepts.length);
  console.log('엑셀 모집단위 수:', excelDepts.length);

  if (dbDepts.length > 0) {
    console.log('\nDB 모집단위 샘플:');
    dbDepts.slice(0, 10).forEach(d => console.log(` - ${d}`));
  }

  if (excelDepts.length > 0) {
    console.log('\n엑셀 모집단위 샘플:');
    excelDepts.slice(0, 10).forEach(d => console.log(` - ${d}`));
  }

  await client.end();
}

run().catch(console.error);
