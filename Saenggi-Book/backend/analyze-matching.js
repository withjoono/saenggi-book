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

  // 1. DB에서 정시 데이터 가져오기
  console.log('=== DB 데이터 로딩 ===');
  const dbResult = await client.query(`
    SELECT ra.id, ra.recruitment_name, ra.admission_type, u.name as university_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
  `);
  console.log('DB 정시 레코드:', dbResult.rows.length);

  // DB 데이터를 맵으로 변환 (대학+학과+군 → id)
  const dbMap = new Map();
  const dbUnivs = new Set();
  dbResult.rows.forEach(r => {
    const key = `${r.university_name}|${r.recruitment_name}|${r.admission_type}`;
    dbMap.set(key, r.id);
    dbUnivs.add(r.university_name);
  });

  // 2. 엑셀 데이터 로딩
  console.log('\n=== 엑셀 데이터 로딩 ===');
  const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // 대학명 정규화 함수 (엑셀 → DB 형식)
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

  // 군 정규화
  function normalizeGroup(group) {
    if (!group) return '';
    const match = group.match(/[가나다]/);
    return match ? match[0] : '';
  }

  // 엑셀 데이터 파싱
  const excelRecords = [];
  let currentUniv = '';
  let currentUnivNorm = '';
  let currentGroup = '';

  for (let i = 8; i < data.length; i++) {
    const row = data[i];

    // 대학명 감지
    if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
      currentUniv = row[1];
      currentUnivNorm = normalizeUnivName(row[1]);
      currentGroup = '';
      continue;
    }

    // 군 업데이트
    if (row[2] && typeof row[2] === 'string') {
      const normalized = normalizeGroup(row[2]);
      if (normalized) currentGroup = normalized;
    }

    // 모집단위 데이터
    if (row[3] && currentUniv && typeof row[3] === 'string' &&
        !['모집단위', '구분'].includes(row[3])) {

      const cut50 = parseFloat(row[9]);
      const cut70 = parseFloat(row[10]);
      const competition = parseFloat(row[7]);

      if (!isNaN(cut50) || !isNaN(cut70)) {
        excelRecords.push({
          university_original: currentUniv,
          university: currentUnivNorm,
          admission_type: currentGroup,
          recruitment_name: row[3].trim(),
          min_cut: isNaN(cut50) ? null : cut50,
          max_cut: isNaN(cut70) ? null : cut70,
          competition_ratio: isNaN(competition) ? null : competition,
        });
      }
    }
  }
  console.log('엑셀 레코드:', excelRecords.length);

  // 3. 매칭 분석
  console.log('\n=== 매칭 분석 ===');
  let matched = 0;
  let unmatched = [];
  let univNotFound = new Set();

  for (const excel of excelRecords) {
    const key = `${excel.university}|${excel.recruitment_name}|${excel.admission_type}`;
    if (dbMap.has(key)) {
      matched++;
    } else {
      // 대학만 찾아보기
      if (!dbUnivs.has(excel.university)) {
        univNotFound.add(excel.university);
      }
      unmatched.push(excel);
    }
  }

  console.log(`매칭 성공: ${matched}개`);
  console.log(`매칭 실패: ${unmatched.length}개`);

  // 4. 매칭 안된 대학 분석
  console.log('\n=== 매칭 안된 대학 (DB에 없음) ===');
  [...univNotFound].slice(0, 30).forEach(u => console.log(`  - ${u}`));

  // 5. 대학은 매칭되지만 학과가 안 맞는 경우
  console.log('\n=== 대학은 있지만 학과 매칭 안됨 (샘플 30개) ===');
  const deptMismatch = unmatched.filter(e => !univNotFound.has(e.university));
  deptMismatch.slice(0, 30).forEach(e => {
    console.log(`  ${e.university} | ${e.admission_type}군 | ${e.recruitment_name}`);
  });

  // 6. 특정 대학 비교 (가천대)
  console.log('\n=== 가천대 상세 비교 ===');
  const dbGachon = dbResult.rows.filter(r => r.university_name === '가천대');
  const excelGachon = excelRecords.filter(r => r.university === '가천대');

  console.log('DB 가천대 학과:', dbGachon.length);
  console.log('엑셀 가천대 학과:', excelGachon.length);

  console.log('\nDB 가천대 학과 목록:');
  dbGachon.slice(0, 15).forEach(r => console.log(`  - ${r.admission_type}군 | ${r.recruitment_name}`));

  console.log('\n엑셀 가천대 학과 목록:');
  excelGachon.slice(0, 15).forEach(r => console.log(`  - ${r.admission_type}군 | ${r.recruitment_name}`));

  // 가천대 학과 매칭 상세
  console.log('\n가천대 매칭 상세:');
  let gachonMatched = 0;
  for (const excel of excelGachon) {
    const key = `가천대|${excel.recruitment_name}|${excel.admission_type}`;
    if (dbMap.has(key)) {
      gachonMatched++;
    } else {
      console.log(`  ❌ ${excel.admission_type}군 | ${excel.recruitment_name}`);
    }
  }
  console.log(`\n가천대 매칭: ${gachonMatched}/${excelGachon.length}`);

  await client.end();
}

run().catch(console.error);
