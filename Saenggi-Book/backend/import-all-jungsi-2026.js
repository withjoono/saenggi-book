/**
 * 2026 정시 전체 데이터 임포트 스크립트
 * 1. 대학 생성/업데이트
 * 2. 정시 입학 정보 삽입
 * 3. 과거 입결 데이터 (2024, 2025) 삽입
 */

const XLSX = require('xlsx');
const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
};

const excelPath = 'uploads/2026 정시 디비 1218 out.xlsx';

async function main() {
  const client = new Client(config);
  await client.connect();
  console.log('✅ DB 연결 성공\n');

  // 엑셀 파일 읽기
  const wb = XLSX.readFile(excelPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`📊 엑셀 행 수: ${data.length} (데이터 ${data.length - 2}개)\n`);

  // ==================== 1. 대학 생성 ====================
  console.log('🏫 1단계: 대학 생성...');

  // 고유 대학 목록 추출
  const univSet = new Map();
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row[1] || !row[84]) continue;
    const code = String(row[84]).trim();
    const name = String(row[1]).trim();
    const region = String(row[0] || '').trim();
    if (!univSet.has(code)) {
      univSet.set(code, { code, name, region });
    }
  }
  console.log(`   고유 대학: ${univSet.size}개`);

  // 대학 upsert
  let univInserted = 0;
  const uniMap = {};

  for (const [code, univ] of univSet) {
    // 기존 대학 확인
    const existing = await client.query('SELECT id FROM ts_universities WHERE code = $1', [code]);

    let univId;
    if (existing.rows.length > 0) {
      univId = existing.rows[0].id;
    } else {
      const result = await client.query(
        'INSERT INTO ts_universities (code, name, region, establishment_type) VALUES ($1, $2, $3, $4) RETURNING id',
        [code, univ.name, univ.region || '기타', '사립']
      );
      univId = result.rows[0].id;
      univInserted++;
    }
    uniMap[code] = univId;
  }
  console.log(`   신규 대학 삽입: ${univInserted}개`);
  console.log(`   총 대학 맵: ${Object.keys(uniMap).length}개\n`);

  // ==================== 2. 정시 입학 정보 삽입 ====================
  console.log('📝 2단계: 정시 입학 정보 삽입...');

  // 기존 데이터 삭제
  await client.query('DELETE FROM ts_regular_admission_previous_results');
  const delRes = await client.query('DELETE FROM ts_regular_admissions WHERE year = 2026');
  console.log(`   기존 2026 정시 데이터 삭제: ${delRes.rowCount}개`);

  let raInserted = 0;
  const raMap = new Map(); // university_id + recruitment_name -> ra_id
  const errors = [];

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row[1]) continue;

    const uCode = String(row[84] || '').trim();
    const univId = uniMap[uCode];

    if (!univId) {
      errors.push(`행 ${i + 1}: 대학코드 '${uCode}' 없음`);
      continue;
    }

    const recruitmentName = String(row[6] || '').trim();

    const values = [
      2026,
      univId,
      String(row[2] || '').trim(),
      String(row[3] || '').replace(/\s/g, ''),
      String(row[4] || '').trim(),
      String(row[5] || '').trim(),
      recruitmentName,
      parseInt(row[7]) || 0,
      String(row[8] || '').trim(),
      String(row[9] || '').trim(),
      String(row[10] || '').trim(),
      String(row[11] || '').trim(),
      String(row[12] || '').trim(),
      String(row[13] || '').trim(),
      String(row[14] || '').trim(),
      String(row[15] || '').trim(),
      String(row[16] || '').trim(),
      parseInt(row[17]) || null,
      parseFloat(row[18]) || null,
      parseFloat(row[19]) || null,
      parseFloat(row[20]) || null,
      parseFloat(row[21]) || null,
      parseFloat(row[22]) || null,
      parseFloat(row[23]) || null,
      String(row[24] || '').trim() || null,
      String(row[25] || '').trim() || null,
      String(row[26] || '').trim() || null,
      String(row[27] || '').trim() || null,
      String(row[28] || '').trim() || null,
      String(row[29] || '').trim() || null,
      String(row[30] || '').trim() || null,
      String(row[31] || '').trim() || null,
      String(row[32] || '').trim() || null,
      String(row[33] || '').trim() || null,
      String(row[34] || '').trim() || null,
      String(row[35] || '').trim() || null,
      String(row[36] || '').trim() || null,
      String(row[37] || '').trim() || null,
      String(row[38] || '').trim() || null,
      String(row[39] || '').trim() || null,
      String(row[40] || '').trim() || null,
      String(row[41] || '').trim() || null,
      String(row[42] || '').trim() || null,
      String(row[43] || '').trim() || null,
      String(row[44] || '').trim() || null,
      String(row[45] || '').trim() || null,
      String(row[46] || '').trim() || null,
      String(row[47] || '').trim() || null,
      String(row[48] || '').trim() || null,
      String(row[49] || '').trim() || null,
      String(row[50] || '').trim() || null,
      String(row[51] || '').trim() || null,
      String(row[52] || '').trim() || null,
      String(row[53] || '').trim() || null,
      String(row[54] || '').trim() || null,
      parseFloat(row[55]) || null,
      parseFloat(row[56]) || null,
      parseFloat(row[57]) || null,
      parseFloat(row[58]) || null,
      parseFloat(row[59]) || null,
      parseFloat(row[60]) || null,
      parseFloat(row[61]) || null,
      parseFloat(row[62]) || null,
      parseFloat(row[63]) || null,
      parseFloat(row[64]) || null,
      parseFloat(row[65]) || null,
      parseFloat(row[66]) || null,
      parseFloat(row[67]) || null,
      parseFloat(row[68]) || null,
      String(row[81] || '').trim() || null,
      parseInt(row[82]) || null,
    ];

    try {
      const result = await client.query(`
        INSERT INTO ts_regular_admissions (
          year, university_id, admission_name, admission_type, general_field_name,
          detailed_fields, recruitment_name, recruitment_number, selection_method,
          csat_ratio, school_record_ratio, interview_ratio, other_ratio,
          csat_elements, csat_combination, csat_required, csat_optional,
          research_subject_count, korean_reflection_score, math_reflection_score,
          english_reflection_score, research_reflection_score, korean_history_reflection_score,
          second_foreign_language_reflection_score, korean_elective_subject, math_elective_subject,
          math_probability_statistics_additional_points, math_calculus_additional_points,
          math_geometry_additional_points, research_type, research_social_additional_points,
          research_science_additional_points, math_research_selection,
          english_application_criteria, english_grade_1_score, english_grade_2_score,
          english_grade_3_score, english_grade_4_score, english_grade_5_score,
          english_grade_6_score, english_grade_7_score, english_grade_8_score,
          english_grade_9_score, english_minimum_criteria,
          korean_history_application_criteria, korean_history_grade_1_score, korean_history_grade_2_score,
          korean_history_grade_3_score, korean_history_grade_4_score, korean_history_grade_5_score,
          korean_history_grade_6_score, korean_history_grade_7_score, korean_history_grade_8_score,
          korean_history_grade_9_score, korean_history_minimum_criteria,
          min_cut, min_cut_percent, max_cut, max_cut_percent,
          risk_plus_5, risk_plus_4, risk_plus_3, risk_plus_2, risk_plus_1,
          risk_minus_1, risk_minus_2, risk_minus_3, risk_minus_4, risk_minus_5,
          score_calculation, total_score
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
          $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
          $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71
        ) RETURNING id
      `, values);

      const raId = result.rows[0].id;
      raMap.set(`${univId}|${recruitmentName}`, raId);
      raInserted++;

      if (raInserted % 1000 === 0) {
        console.log(`   진행: ${raInserted}개...`);
      }
    } catch (err) {
      errors.push(`행 ${i + 1}: ${err.message}`);
    }
  }
  console.log(`   정시 입학 정보 삽입: ${raInserted}개\n`);

  // ==================== 3. 과거 입결 데이터 삽입 ====================
  console.log('📊 3단계: 과거 입결 데이터 (2024, 2025) 삽입...');

  let pr2024 = 0, pr2025 = 0;

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row[1]) continue;

    const uCode = String(row[84] || '').trim();
    const univId = uniMap[uCode];
    const recruitmentName = String(row[6] || '').trim();
    const raId = raMap.get(`${univId}|${recruitmentName}`);

    if (!raId) continue;

    // 2025 입결 (columns 85-92)
    if (row[85] !== undefined && row[85] !== null && row[85] !== '') {
      try {
        await client.query(`
          INSERT INTO ts_regular_admission_previous_results
          (regular_admission_id, year, recruitment_number, competition_ratio, additional_pass_rank,
           min_cut, max_cut, converted_score_total, percentile_50, percentile_70)
          VALUES ($1, 2025, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          raId,
          parseFloat(row[85]) || null,
          parseFloat(row[86]) || null,
          parseFloat(row[87]) || null,
          parseFloat(row[88]) || null,
          parseFloat(row[89]) || null,
          parseFloat(row[90]) || null,
          parseFloat(row[91]) || null,
          parseFloat(row[92]) || null,
        ]);
        pr2025++;
      } catch (e) { /* skip */ }
    }

    // 2024 입결 (columns 93-100)
    if (row[93] !== undefined && row[93] !== null && row[93] !== '') {
      try {
        await client.query(`
          INSERT INTO ts_regular_admission_previous_results
          (regular_admission_id, year, recruitment_number, competition_ratio, additional_pass_rank,
           min_cut, max_cut, converted_score_total, percentile_50, percentile_70)
          VALUES ($1, 2024, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          raId,
          parseFloat(row[93]) || null,
          parseFloat(row[94]) || null,
          parseFloat(row[95]) || null,
          parseFloat(row[96]) || null,
          parseFloat(row[97]) || null,
          parseFloat(row[98]) || null,
          parseFloat(row[99]) || null,
          parseFloat(row[100]) || null,
        ]);
        pr2024++;
      } catch (e) { /* skip */ }
    }
  }
  console.log(`   2025 입결: ${pr2025}개`);
  console.log(`   2024 입결: ${pr2024}개\n`);

  // ==================== 결과 확인 ====================
  console.log('📈 최종 결과:');

  const univCount = await client.query('SELECT COUNT(*) FROM ts_universities');
  console.log(`   대학: ${univCount.rows[0].count}개`);

  const raCount = await client.query('SELECT COUNT(*) FROM ts_regular_admissions WHERE year = 2026');
  console.log(`   2026 정시: ${raCount.rows[0].count}개`);

  const prCount = await client.query(`
    SELECT year, COUNT(*) as cnt
    FROM ts_regular_admission_previous_results
    GROUP BY year ORDER BY year
  `);
  prCount.rows.forEach(r => console.log(`   ${r.year}년 입결: ${r.cnt}개`));

  if (errors.length > 0) {
    console.log(`\n⚠️  에러 ${errors.length}개 (처음 10개):`);
    errors.slice(0, 10).forEach(e => console.log(`   ${e}`));
  }

  await client.end();
  console.log('\n✅ 완료!');
}

main().catch(err => {
  console.error('❌ 에러:', err);
  process.exit(1);
});
