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

  // 1. 엑셀 로딩
  console.log('=== 2025 실제컷 엑셀 로딩 ===');
  const wb = XLSX.readFile('uploads/2025정시-실제컷-정리.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('총 행 수:', data.length);

  // 컬럼 인덱스
  const COL = {
    UNIV_CODE: 0,
    UNIV_NAME: 1,
    GROUP: 2,
    DEPT: 3,
    QUOTA: 4,
    COMPETITION: 5,
    ADD_RANK: 6,
    CUT_50: 7,
    CUT_70: 8,
    TOTAL_SCORE: 9,
    PERCENTILE_50_AVG: 16,  // 백분위평균 50%
    PERCENTILE_70_AVG: 23,  // 백분위평균 70%
  };

  // 값 파싱 헬퍼
  const parseVal = (val) => {
    if (val === null || val === undefined || val === '' || val === '-') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  const parseIntVal = (val) => {
    if (val === null || val === undefined || val === '' || val === '-') return null;
    const num = parseInt(val);
    return isNaN(num) ? null : num;
  };

  // 2. DB 정시 데이터 로딩
  console.log('\n=== DB 정시 데이터 로딩 ===');
  const dbResult = await client.query(`
    SELECT ra.id, ra.recruitment_name, ra.admission_type,
           u.code as univ_code, u.name as univ_name
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

  // 군 정규화
  function normalizeGroup(group) {
    if (!group) return '';
    const match = String(group).match(/[가나다]/);
    return match ? match[0] : '';
  }

  // DB 맵 생성
  const dbMapByCode = new Map();
  const dbMapByCodeNorm = new Map();

  dbResult.rows.forEach(r => {
    const codeKey = `${r.univ_code}|${r.recruitment_name}|${r.admission_type}`;
    dbMapByCode.set(codeKey, r.id);

    const codeNormKey = `${r.univ_code}|${normalize(r.recruitment_name)}|${r.admission_type}`;
    dbMapByCodeNorm.set(codeNormKey, r.id);
  });

  // 3. 매칭
  console.log('\n=== 매칭 ===');

  // 기존 2025년 데이터 삭제
  await client.query('DELETE FROM ts_regular_admission_previous_results WHERE year = 2025');
  console.log('기존 2025년 데이터 삭제 완료');

  const matched = [];
  const unmatched = [];

  // Row 3부터 데이터 (0-2는 헤더)
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[COL.UNIV_CODE]) continue;

    const univCode = String(row[COL.UNIV_CODE]).trim();
    const deptName = row[COL.DEPT];
    const admType = normalizeGroup(row[COL.GROUP]);

    if (!deptName) continue;

    let dbId = null;

    // 1차: 정확한 매칭
    const exactKey = `${univCode}|${deptName}|${admType}`;
    if (dbMapByCode.has(exactKey)) {
      dbId = dbMapByCode.get(exactKey);
    }

    // 2차: 정규화 매칭
    if (!dbId) {
      const normKey = `${univCode}|${normalize(deptName)}|${admType}`;
      if (dbMapByCodeNorm.has(normKey)) {
        dbId = dbMapByCodeNorm.get(normKey);
      }
    }

    // 3차: 군 무시 매칭
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
      for (const [key, id] of dbMapByCodeNorm) {
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
        recruitment_number: parseIntVal(row[COL.QUOTA]),
        competition_ratio: parseVal(row[COL.COMPETITION]),
        additional_pass_rank: parseIntVal(row[COL.ADD_RANK]),
        min_cut: parseVal(row[COL.CUT_50]),
        max_cut: parseVal(row[COL.CUT_70]),
        converted_score_total: parseVal(row[COL.TOTAL_SCORE]),
        percentile_50: parseVal(row[COL.PERCENTILE_50_AVG]),
        percentile_70: parseVal(row[COL.PERCENTILE_70_AVG]),
      });
    } else {
      unmatched.push({
        code: univCode,
        name: row[COL.UNIV_NAME],
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
  for (const r of matched) {
    try {
      await client.query(`
        INSERT INTO ts_regular_admission_previous_results
        (year, recruitment_number, competition_ratio, additional_pass_rank,
         min_cut, max_cut, converted_score_total, percentile_50, percentile_70,
         regular_admission_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        2025,
        r.recruitment_number,
        r.competition_ratio,
        r.additional_pass_rank,
        r.min_cut,
        r.max_cut,
        r.converted_score_total,
        r.percentile_50,
        r.percentile_70,
        r.regular_admission_id
      ]);
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
    SELECT pr.recruitment_number, pr.competition_ratio, pr.additional_pass_rank,
           pr.min_cut, pr.max_cut, pr.converted_score_total,
           pr.percentile_50, pr.percentile_70,
           ra.recruitment_name, u.name as univ_name
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.year = 2025
    ORDER BY u.name, ra.recruitment_name
    LIMIT 10
  `);
  console.log('\n샘플 데이터:');
  sample.rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.univ_name} | ${r.recruitment_name}`);
    console.log(`   정원:${r.recruitment_number} 경쟁률:${r.competition_ratio} 충원순위:${r.additional_pass_rank}`);
    console.log(`   환산50%:${r.min_cut} 환산70%:${r.max_cut} 총점:${r.converted_score_total}`);
    console.log(`   백분위50%:${r.percentile_50} 백분위70%:${r.percentile_70}`);
  });

  // 매칭 안된 항목 저장
  if (unmatched.length > 0) {
    const fs = require('fs');
    fs.writeFileSync(
      'uploads/2025-unmatched-v4.json',
      JSON.stringify(unmatched, null, 2),
      'utf8'
    );
    console.log('\n매칭 안된 항목 저장: uploads/2025-unmatched-v4.json');

    // 대학별 통계
    const unmatchedByCode = {};
    unmatched.forEach(r => {
      const key = `${r.code} (${r.name})`;
      unmatchedByCode[key] = (unmatchedByCode[key] || 0) + 1;
    });
    console.log('\n매칭 안된 대학별 개수 (상위 20개):');
    Object.entries(unmatchedByCode)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([name, count]) => console.log(`  ${name}: ${count}개`));
  }

  await client.end();
  console.log('\n완료!');
}

run().catch(console.error);
