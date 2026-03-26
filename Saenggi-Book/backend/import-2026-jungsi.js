/**
 * 2026 정시 디비 엑셀 직접 가져오기 스크립트
 * API 인증 우회하여 직접 DB에 삽입
 */
const XLSX = require('xlsx');
const { Client } = require('pg');

const YEAR = 2025; // 2026학년도 정시

async function importJungsiData() {
  // Cloud SQL 프로덕션 연결 (via proxy on port 5434)
  const client = new Client({
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  await client.connect();
  console.log('DB 연결 성공');

  try {
    // 엑셀 파일 읽기
    const workbook = XLSX.readFile('./uploads/2026 정시 디비 251205.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 'A' });

    console.log(`총 ${data.length}행 읽음`);

    // 트랜잭션 시작
    await client.query('BEGIN');

    // 기존 2025년 데이터 삭제 (프로덕션 테이블명: ts_regular_admissions)
    const deleteResult1 = await client.query(
      'DELETE FROM ts_regular_admissions WHERE year = $1',
      [YEAR]
    );
    console.log(`기존 정시 전형 ${deleteResult1.rowCount}개 삭제`);

    const deleteResult2 = await client.query(
      'DELETE FROM ts_regular_admission_previous_results WHERE year = $1',
      [YEAR]
    );
    console.log(`기존 이전 결과 ${deleteResult2.rowCount}개 삭제`);

    let successCount = 0;
    let errorCount = 0;

    // 각 행 처리 (row 0, 1은 헤더)
    for (let i = 2; i < data.length; i++) {
      const row = data[i];

      const universityCode = row['CG'];
      const universityRegion = row['A'];
      const universityName = row['B'];

      if (!universityCode || universityCode === 'N') {
        errorCount++;
        continue;
      }

      // 대학 조회 또는 생성 (프로덕션: ts_universities)
      let universityResult = await client.query(
        'SELECT id FROM ts_universities WHERE code = $1',
        [universityCode]
      );

      let universityId;
      if (universityResult.rows.length === 0) {
        const insertUniv = await client.query(
          `INSERT INTO ts_universities (code, name, region, establishment_type)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [universityCode, universityName, universityRegion, '']
        );
        universityId = insertUniv.rows[0].id;
        console.log(`대학 생성: ${universityName} (${universityCode})`);
      } else {
        universityId = universityResult.rows[0].id;
      }

      // 정시 전형 데이터 추출
      const admissionData = {
        university_id: universityId,
        year: YEAR,
        admission_name: (row['C'] || '').toString().trim(),
        admission_type: (row['D'] || '').toString().trim(),
        general_field_name: (row['E'] || '').toString().trim(),
        detailed_fields: (row['F'] || '').toString().trim(),
        recruitment_name: (row['G'] || '').toString().trim(),
        recruitment_number: parseInt(row['H']) || 0,
        selection_method: (row['I'] || '').toString().trim(),
        csat_ratio: (row['J'] + '' || '').trim(),
        school_record_ratio: (row['K'] + '' || '').trim(),
        interview_ratio: (row['L'] + '' || '').trim(),
        other_ratio: (row['M'] + '' || '').trim(),
        score_calculation: (row['CD'] || '').toString().trim(),
        csat_elements: (row['N'] + '' || '').trim(),
        csat_combination: (row['O'] + '' || '').trim(),
        csat_required: (row['P'] + '' || '').trim(),
        csat_optional: (row['Q'] + '' || '').trim(),
        total_score: row['CE'] !== 'N' ? parseInt(row['CE'] || '0') : 0,
        research_subject_count: row['R'] !== 'N' ? parseInt(row['R'] || '0') : 0,
        korean_reflection_score: parseFloat(row['S'] || '0') || 0,
        math_reflection_score: parseFloat(row['T'] || '0') || 0,
        english_reflection_score: parseFloat(row['U'] || '0') || 0,
        research_reflection_score: parseFloat(row['V'] || '0') || 0,
        korean_history_reflection_score: parseFloat(row['W'] || '0') || 0,
        second_foreign_language_reflection_score: parseFloat(row['X'] || '0') || 0,
        min_cut: parseFloat(row['BD'] || '0') || 0,
        min_cut_percent: parseFloat(row['BE'] || '0') || 0,
        max_cut: parseFloat(row['BF'] || '0') || 0,
        max_cut_percent: parseFloat(row['BG'] || '0') || 0,
        risk_plus_5: parseFloat(row['BH'] || '0') || 0,
        risk_plus_4: parseFloat(row['BI'] || '0') || 0,
        risk_plus_3: parseFloat(row['BJ'] || '0') || 0,
        risk_plus_2: parseFloat(row['BK'] || '0') || 0,
        risk_plus_1: parseFloat(row['BL'] || '0') || 0,
        risk_minus_1: parseFloat(row['BM'] || '0') || 0,
        risk_minus_2: parseFloat(row['BN'] || '0') || 0,
        risk_minus_3: parseFloat(row['BO'] || '0') || 0,
        risk_minus_4: parseFloat(row['BP'] || '0') || 0,
        risk_minus_5: parseFloat(row['BQ'] || '0') || 0,
        initial_cumulative_percentile: parseFloat(row['BE'] || '0') || 0,
        additional_cumulative_percentile: parseFloat(row['BG'] || '0') || 0,
        korean_elective_subject: row['Y'] || '',
        math_elective_subject: row['Z'] || '',
        math_probability_statistics_additional_points: row['AA'] || '',
        math_calculus_additional_points: row['AB'] || '',
        math_geometry_additional_points: row['AC'] || '',
        research_type: row['AD'] || '',
        research_social_additional_points: row['AE'] || '',
        research_science_additional_points: row['AF'] || '',
        math_research_selection: row['AG'] || '',
        english_application_criteria: row['AH'] || '',
        english_grade_1_score: row['AI'] || '',
        english_grade_2_score: row['AJ'] || '',
        english_grade_3_score: row['AK'] || '',
        english_grade_4_score: row['AL'] || '',
        english_grade_5_score: row['AM'] || '',
        english_grade_6_score: row['AN'] || '',
        english_grade_7_score: row['AO'] || '',
        english_grade_8_score: row['AP'] || '',
        english_grade_9_score: row['AQ'] || '',
        english_minimum_criteria: row['AR'] || '',
        korean_history_application_criteria: row['AS'] || '',
        korean_history_grade_1_score: row['AT'] || '',
        korean_history_grade_2_score: row['AU'] || '',
        korean_history_grade_3_score: row['AV'] || '',
        korean_history_grade_4_score: row['AW'] || '',
        korean_history_grade_5_score: row['AX'] || '',
        korean_history_grade_6_score: row['AY'] || '',
        korean_history_grade_7_score: row['AZ'] || '',
        korean_history_grade_8_score: row['BA'] || '',
        korean_history_grade_9_score: row['BB'] || '',
        korean_history_minimum_criteria: row['BC'] || '',
      };

      // INSERT 쿼리 생성
      const columns = Object.keys(admissionData);
      const values = Object.values(admissionData);
      const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');

      const insertQuery = `
        INSERT INTO ts_regular_admissions (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING id
      `;

      const insertResult = await client.query(insertQuery, values);
      const admissionId = insertResult.rows[0].id;

      // 이전 입결 데이터 (24년, 23년, 22년)
      const previousResults = [
        {
          year: 2024,
          regular_admission_id: admissionId,
          min_cut: parseFloat(row['BT'] || '0') || null,
          competition_ratio: parseFloat(row['BR'] || '0') || null,
          percent: parseFloat(row['BU'] || '0') || null,
          recruitment_number: parseInt(row['BS']) || null,
        },
        {
          year: 2023,
          regular_admission_id: admissionId,
          min_cut: parseFloat(row['BX'] || '0') || null,
          competition_ratio: parseFloat(row['BV'] || '0') || null,
          percent: parseFloat(row['BY'] || '0') || null,
          recruitment_number: parseInt(row['BW']) || null,
        },
        {
          year: 2022,
          regular_admission_id: admissionId,
          min_cut: parseFloat(row['CB'] || '0') || null,
          competition_ratio: parseFloat(row['BZ'] || '0') || null,
          percent: parseFloat(row['CC'] || '0') || null,
          recruitment_number: parseInt(row['CA']) || null,
        },
      ];

      for (const result of previousResults) {
        await client.query(
          `INSERT INTO ts_regular_admission_previous_results
           (year, regular_admission_id, min_cut, competition_ratio, percent, recruitment_number)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [result.year, result.regular_admission_id, result.min_cut,
           result.competition_ratio, result.percent, result.recruitment_number]
        );
      }

      successCount++;

      if (successCount % 500 === 0) {
        console.log(`${successCount}개 처리 완료...`);
      }
    }

    // 커밋
    await client.query('COMMIT');

    console.log('\n=== 완료 ===');
    console.log(`성공: ${successCount}개`);
    console.log(`스킵: ${errorCount}개`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('오류 발생:', error);
    throw error;
  } finally {
    await client.end();
  }
}

importJungsiData().catch(console.error);
