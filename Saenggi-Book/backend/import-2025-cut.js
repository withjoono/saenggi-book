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

  // ==========================================
  // 1. DB 데이터 로딩
  // ==========================================
  console.log('=== 1. DB 데이터 로딩 ===');
  const dbResult = await client.query(`
    SELECT ra.id, ra.recruitment_name, ra.admission_type, u.name as university_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
  `);
  console.log('DB 정시 레코드:', dbResult.rows.length);

  // 정규화 함수 (특수문자, 공백 제거)
  function normalize(str) {
    if (!str) return '';
    return str
      .replace(/[·\-–—・･\s\(\)（）\[\]]/g, '')
      .replace(/학부$/g, '')
      .replace(/학과$/g, '')
      .replace(/전공$/g, '')
      .toLowerCase()
      .trim();
  }

  // DB 맵 생성 (여러 키로 매칭)
  const dbMapExact = new Map();      // 정확한 키
  const dbMapNormalized = new Map(); // 정규화된 키
  const dbUnivDepts = new Map();     // 대학별 학과 목록

  dbResult.rows.forEach(r => {
    const exactKey = `${r.university_name}|${r.recruitment_name}|${r.admission_type}`;
    const normKey = `${normalize(r.university_name)}|${normalize(r.recruitment_name)}|${r.admission_type}`;

    dbMapExact.set(exactKey, r.id);
    dbMapNormalized.set(normKey, r.id);

    // 대학별 학과 목록
    if (!dbUnivDepts.has(r.university_name)) {
      dbUnivDepts.set(r.university_name, []);
    }
    dbUnivDepts.get(r.university_name).push({
      id: r.id,
      name: r.recruitment_name,
      normalized: normalize(r.recruitment_name),
      type: r.admission_type
    });
  });

  // ==========================================
  // 2. 엑셀 데이터 로딩
  // ==========================================
  console.log('\n=== 2. 엑셀 데이터 로딩 ===');
  const wb = XLSX.readFile('uploads/수능-2025학년도 전형결과_240616.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // 대학명 정규화 (엑셀 → DB 형식)
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

    if (row[1] && typeof row[1] === 'string' && row[1].includes('대학')) {
      currentUniv = row[1];
      currentUnivNorm = normalizeUnivName(row[1]);
      currentGroup = '';
      continue;
    }

    if (row[2] && typeof row[2] === 'string') {
      const normalized = normalizeGroup(row[2]);
      if (normalized) currentGroup = normalized;
    }

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

  // ==========================================
  // 3. 매칭 및 Import
  // ==========================================
  console.log('\n=== 3. 매칭 및 Import ===');

  // 기존 2025년 데이터 확인
  const existing2025 = await client.query(`
    SELECT COUNT(*) FROM ts_regular_admission_previous_results WHERE year = 2025
  `);
  console.log('기존 2025년 레코드:', existing2025.rows[0].count);

  // 매칭 결과
  const matched = [];
  const unmatched = [];

  for (const excel of excelRecords) {
    let dbId = null;

    // 1차: 정확한 매칭
    const exactKey = `${excel.university}|${excel.recruitment_name}|${excel.admission_type}`;
    if (dbMapExact.has(exactKey)) {
      dbId = dbMapExact.get(exactKey);
    }

    // 2차: 정규화된 매칭
    if (!dbId) {
      const normKey = `${normalize(excel.university)}|${normalize(excel.recruitment_name)}|${excel.admission_type}`;
      if (dbMapNormalized.has(normKey)) {
        dbId = dbMapNormalized.get(normKey);
      }
    }

    // 3차: 같은 대학 내에서 유사 학과 찾기
    if (!dbId && dbUnivDepts.has(excel.university)) {
      const depts = dbUnivDepts.get(excel.university);
      const excelNorm = normalize(excel.recruitment_name);

      // 같은 군에서 정규화 이름이 포함되는 학과 찾기
      const found = depts.find(d =>
        d.type === excel.admission_type &&
        (d.normalized.includes(excelNorm) || excelNorm.includes(d.normalized))
      );
      if (found) {
        dbId = found.id;
      }
    }

    if (dbId) {
      matched.push({ ...excel, regular_admission_id: dbId });
    } else {
      unmatched.push(excel);
    }
  }

  console.log(`매칭 성공: ${matched.length}개`);
  console.log(`매칭 실패: ${unmatched.length}개`);

  // ==========================================
  // 4. Import 실행
  // ==========================================
  console.log('\n=== 4. Import 실행 ===');

  // 기존 2025년 데이터 삭제 (있으면)
  if (parseInt(existing2025.rows[0].count) > 0) {
    console.log('기존 2025년 데이터 삭제 중...');
    await client.query('DELETE FROM ts_regular_admission_previous_results WHERE year = 2025');
  }

  // 배치 Insert
  let inserted = 0;
  let skipped = 0;

  for (const record of matched) {
    try {
      await client.query(`
        INSERT INTO ts_regular_admission_previous_results
        (year, min_cut, max_cut, competition_ratio, regular_admission_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [2025, record.min_cut, record.max_cut, record.competition_ratio, record.regular_admission_id]);
      inserted++;
    } catch (err) {
      console.log(`Insert 오류: ${record.university} | ${record.recruitment_name}`, err.message);
      skipped++;
    }
  }

  console.log(`\nInsert 완료: ${inserted}개`);
  console.log(`Insert 실패: ${skipped}개`);

  // ==========================================
  // 5. 결과 확인
  // ==========================================
  console.log('\n=== 5. 결과 확인 ===');
  const result = await client.query(`
    SELECT COUNT(*) FROM ts_regular_admission_previous_results WHERE year = 2025
  `);
  console.log('2025년 레코드 수:', result.rows[0].count);

  // 샘플 확인
  console.log('\n=== 샘플 데이터 ===');
  const sample = await client.query(`
    SELECT pr.min_cut, pr.max_cut, pr.competition_ratio,
           ra.recruitment_name, u.name as university_name
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.year = 2025
    ORDER BY u.name, ra.recruitment_name
    LIMIT 20
  `);
  sample.rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.university_name} | ${r.recruitment_name}`);
    console.log(`   50%컷: ${r.min_cut} | 70%컷: ${r.max_cut} | 경쟁률: ${r.competition_ratio}`);
  });

  // ==========================================
  // 6. 매칭 안된 항목 저장
  // ==========================================
  console.log('\n=== 6. 매칭 안된 항목 저장 ===');
  const fs = require('fs');
  fs.writeFileSync(
    'uploads/2025-unmatched.json',
    JSON.stringify(unmatched, null, 2),
    'utf8'
  );
  console.log('매칭 안된 항목 저장: uploads/2025-unmatched.json');

  // 대학별 매칭 안된 개수
  const unmatchedByUniv = {};
  unmatched.forEach(r => {
    unmatchedByUniv[r.university] = (unmatchedByUniv[r.university] || 0) + 1;
  });
  console.log('\n매칭 안된 대학별 개수 (상위 20개):');
  Object.entries(unmatchedByUniv)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([univ, count]) => console.log(`  ${univ}: ${count}개`));

  await client.end();
  console.log('\n완료!');
}

run().catch(console.error);
