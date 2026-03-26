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

  // 1. 2025 컷 엑셀 로딩 (대학코드 포함 버전)
  console.log('=== 2025 컷 엑셀 로딩 ===');
  const wb = XLSX.readFile('uploads/2025-jungsi-cut-for-db-1.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(ws);
  console.log('엑셀 레코드 수:', excelData.length);

  // 2. DB 정시 데이터 로딩
  console.log('\n=== DB 정시 데이터 로딩 ===');
  const dbResult = await client.query(`
    SELECT ra.id, ra.recruitment_name, ra.admission_type, u.code as univ_code, u.name as univ_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
  `);
  console.log('DB 정시 레코드:', dbResult.rows.length);

  // 정규화 함수
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

  // DB 맵 생성 (대학코드 + 학과명 + 군)
  const dbMapByCode = new Map();
  const dbMapNormalized = new Map();

  dbResult.rows.forEach(r => {
    // 정확한 키
    const exactKey = `${r.univ_code}|${r.recruitment_name}|${r.admission_type}`;
    dbMapByCode.set(exactKey, r.id);

    // 정규화 키
    const normKey = `${r.univ_code}|${normalize(r.recruitment_name)}|${r.admission_type}`;
    dbMapNormalized.set(normKey, r.id);
  });

  // 3. 매칭 및 Import
  console.log('\n=== 매칭 및 Import ===');

  // 기존 2025년 데이터 삭제
  await client.query('DELETE FROM ts_regular_admission_previous_results WHERE year = 2025');
  console.log('기존 2025년 데이터 삭제 완료');

  // 군 정규화 함수
  function normalizeGroup(group) {
    if (!group) return '';
    const match = group.match(/[가나다]/);
    return match ? match[0] : '';
  }

  const matched = [];
  const unmatched = [];

  for (const row of excelData) {
    const univCode = row['대학코드'];
    const deptName = row['recruitment_name'];
    const admType = normalizeGroup(row['admission_type']);
    const minCut = row['min_cut'];
    const maxCut = row['max_cut'];
    const competition = row['competition_ratio'];

    let dbId = null;

    // 1차: 정확한 매칭 (대학코드 + 학과명 + 군)
    const exactKey = `${univCode}|${deptName}|${admType}`;
    if (dbMapByCode.has(exactKey)) {
      dbId = dbMapByCode.get(exactKey);
    }

    // 2차: 정규화 매칭
    if (!dbId) {
      const normKey = `${univCode}|${normalize(deptName)}|${admType}`;
      if (dbMapNormalized.has(normKey)) {
        dbId = dbMapNormalized.get(normKey);
      }
    }

    // 3차: 군 무시하고 매칭
    if (!dbId) {
      for (const [key, id] of dbMapByCode) {
        const [code, name, type] = key.split('|');
        if (code === univCode && name === deptName) {
          dbId = id;
          break;
        }
      }
    }

    // 4차: 정규화 + 군 무시
    if (!dbId) {
      const normDept = normalize(deptName);
      for (const [key, id] of dbMapNormalized) {
        const [code, name, type] = key.split('|');
        if (code === univCode && name === normDept) {
          dbId = id;
          break;
        }
      }
    }

    if (dbId) {
      matched.push({
        regular_admission_id: dbId,
        min_cut: minCut,
        max_cut: maxCut,
        competition_ratio: competition
      });
    } else {
      unmatched.push({
        code: univCode,
        dept: deptName,
        type: admType
      });
    }
  }

  console.log(`\n매칭 성공: ${matched.length}개`);
  console.log(`매칭 실패: ${unmatched.length}개`);

  // 4. Insert
  console.log('\n=== Insert 실행 ===');
  let inserted = 0;
  for (const record of matched) {
    try {
      await client.query(`
        INSERT INTO ts_regular_admission_previous_results
        (year, min_cut, max_cut, competition_ratio, regular_admission_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [2025, record.min_cut, record.max_cut, record.competition_ratio, record.regular_admission_id]);
      inserted++;
    } catch (err) {
      console.log('Insert 오류:', err.message);
    }
  }
  console.log(`Insert 완료: ${inserted}개`);

  // 5. 결과 확인
  console.log('\n=== 결과 확인 ===');
  const result = await client.query(`
    SELECT COUNT(*) FROM ts_regular_admission_previous_results WHERE year = 2025
  `);
  console.log('2025년 레코드 수:', result.rows[0].count);

  // 샘플 출력
  const sample = await client.query(`
    SELECT pr.min_cut, pr.max_cut, pr.competition_ratio,
           ra.recruitment_name, u.name as univ_name
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.year = 2025
    ORDER BY u.name, ra.recruitment_name
    LIMIT 15
  `);
  console.log('\n샘플 데이터:');
  sample.rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.univ_name} | ${r.recruitment_name}`);
    console.log(`   50%컷: ${r.min_cut} | 70%컷: ${r.max_cut} | 경쟁률: ${r.competition_ratio}`);
  });

  // 매칭 안된 항목 저장
  if (unmatched.length > 0) {
    const fs = require('fs');
    fs.writeFileSync(
      'uploads/2025-unmatched-v2.json',
      JSON.stringify(unmatched, null, 2),
      'utf8'
    );
    console.log('\n매칭 안된 항목 저장: uploads/2025-unmatched-v2.json');

    // 대학별 통계
    const unmatchedByUniv = {};
    unmatched.forEach(r => {
      unmatchedByUniv[r.code] = (unmatchedByUniv[r.code] || 0) + 1;
    });
    console.log('\n매칭 안된 대학코드별 개수 (상위 20개):');
    Object.entries(unmatchedByUniv)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([code, count]) => console.log(`  ${code}: ${count}개`));
  }

  await client.end();
  console.log('\n완료!');
}

run().catch(console.error);
