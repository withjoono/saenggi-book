const { Client } = require('pg');
const XLSX = require('xlsx');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev'
  });

  await client.connect();
  console.log('DB 연결 완료');

  // Excel 로드
  const wb = XLSX.readFile('uploads/2026 정시 디비 1218 out.xlsx');
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header: 1});
  console.log('Excel 로드:', data.length, '행');

  // 대학명 정규화
  function normalizeUniv(str) {
    if (!str) return '';
    return str.toString()
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  function normalizeDept(str) {
    if (!str) return '';
    return str.toString()
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  // 기존 regular_admissions 조회
  const raResult = await client.query(`
    SELECT ra.id, u.name as univ_name, ra.recruitment_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.year = 2026
  `);
  console.log('기존 정시 데이터:', raResult.rows.length, '건');

  // 매핑 맵 생성
  const raMap = new Map();
  for (const row of raResult.rows) {
    const key = normalizeUniv(row.univ_name) + '|' + normalizeDept(row.recruitment_name);
    raMap.set(key, row.id);
  }

  // 기존 previous_results 삭제 (2024, 2025)
  const deleteResult = await client.query(`
    DELETE FROM ts_regular_admission_previous_results
    WHERE year IN (2024, 2025)
  `);
  console.log('기존 2024/2025 입결 삭제:', deleteResult.rowCount, '건');

  // 삽입 준비
  let inserted2024 = 0, inserted2025 = 0;
  let notFound = [];

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1] || !row[6]) continue;

    const univ = row[1];  // 대학명
    const dept = row[6];  // 모집단위명
    const key = normalizeUniv(univ) + '|' + normalizeDept(dept);
    const raId = raMap.get(key);

    if (!raId) {
      if (notFound.length < 10) notFound.push(univ + ' / ' + dept);
      continue;
    }

    // 2025 입결 (columns 85-92)
    if (row[85] !== undefined && row[85] !== null && row[85] !== '') {
      await client.query(`
        INSERT INTO ts_regular_admission_previous_results 
        (regular_admission_id, year, recruitment_number, competition_ratio, additional_pass_rank, 
         min_cut, max_cut, converted_score_total, percentile_50, percentile_70)
        VALUES ($1, 2025, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        raId,
        row[85] || null,  // 모집인원
        row[86] || null,  // 경쟁률
        row[87] || null,  // 충원합격순위
        row[88] || null,  // 환산점수 50%컷
        row[89] || null,  // 환산점수 70%컷
        row[90] || null,  // 환산점수총점
        row[91] || null,  // 백분위 50%컷
        row[92] || null   // 백분위 70%컷
      ]);
      inserted2025++;
    }

    // 2024 입결 (columns 93-100)
    if (row[93] !== undefined && row[93] !== null && row[93] !== '') {
      await client.query(`
        INSERT INTO ts_regular_admission_previous_results 
        (regular_admission_id, year, recruitment_number, competition_ratio, additional_pass_rank, 
         min_cut, max_cut, converted_score_total, percentile_50, percentile_70)
        VALUES ($1, 2024, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        raId,
        row[93] || null,
        row[94] || null,
        row[95] || null,
        row[96] || null,
        row[97] || null,
        row[98] || null,
        row[99] || null,
        row[100] || null
      ]);
      inserted2024++;
    }
  }

  console.log('\n=== 결과 ===');
  console.log('2025 입결 삽입:', inserted2025, '건');
  console.log('2024 입결 삽입:', inserted2024, '건');

  if (notFound.length > 0) {
    console.log('\nDB에서 찾지 못한 항목 (샘플):');
    notFound.forEach(n => console.log('  -', n));
  }

  // 확인 쿼리
  const checkResult = await client.query(`
    SELECT year, COUNT(*) as cnt
    FROM ts_regular_admission_previous_results
    GROUP BY year
    ORDER BY year DESC
  `);
  console.log('\n현재 DB 입결 현황:');
  checkResult.rows.forEach(r => console.log('  ' + r.year + '년:', r.cnt, '건'));

  await client.end();
  console.log('\n완료!');
}

main().catch(err => {
  console.error('에러:', err);
  process.exit(1);
});
