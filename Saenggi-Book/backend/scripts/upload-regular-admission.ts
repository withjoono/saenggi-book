import { Client } from 'pg';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment based on NODE_ENV (default: development)
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, '..', envFile) });
console.log();

const YEAR = 2025;

async function uploadRegularAdmission(excelFilePath: string) {
  if (!fs.existsSync(excelFilePath)) {
    console.error(`❌ Excel file not found: ${excelFilePath}`);
    console.log('\n사용법: npx ts-node scripts/upload-regular-admission.ts <excel-file-path>');
    console.log('예시: npx ts-node scripts/upload-regular-admission.ts ./data/정시데이터.xlsx');
    process.exit(1);
  }

  console.log('🚀 정시 전형 데이터 업로드 시작');
  console.log(`📄 Excel 파일: ${excelFilePath}`);
  console.log(`📅 Year: ${YEAR}`);
  console.log(`🔗 DB: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5434'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_prod',
  });

  try {
    await client.connect();
    console.log('✅ Cloud SQL 연결 성공');

    // Read Excel file
    console.log('📖 Excel 파일 읽는 중...');
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 'A' }) as Record<string, any>[];

    console.log(`📊 총 ${data.length - 1}개 행 발견 (헤더 제외)`);

    // Start transaction
    await client.query('BEGIN');

    // Delete existing data for this year
    console.log(`🗑️ ${YEAR}년 기존 데이터 삭제 중...`);
    await client.query('DELETE FROM ts_regular_admission_previous_results WHERE year = $1', [YEAR]);
    await client.query('DELETE FROM ts_regular_admissions WHERE year = $1', [YEAR]);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each row (skip header row)
    for (let i = 2; i < data.length; i++) {
      const row = data[i];

      try {
        const universityCode = row['CG'];
        const universityRegion = row['A'] || '';
        const universityName = row['B'] || '';

        if (universityCode === 'N' || !universityCode) {
          errorCount++;
          if (errors.length < 10) {
            errors.push(`Row ${i}: 대학코드 없음 - ${universityName}`);
          }
          continue;
        }

        // Check if university exists, create if not
        let universityResult = await client.query(
          'SELECT id FROM ts_universities WHERE code = $1',
          [universityCode]
        );

        let universityId: number;
        if (universityResult.rows.length === 0) {
          const insertResult = await client.query(
            `INSERT INTO ts_universities (code, name, region, establishment_type)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [universityCode, universityName, universityRegion, '']
          );
          universityId = insertResult.rows[0].id;
          console.log(`🏫 대학 생성: ${universityName} (${universityCode})`);
        } else {
          universityId = universityResult.rows[0].id;
        }

        // Parse admission data
        const admissionData = {
          university_id: universityId,
          year: YEAR,
          admission_name: (row['C'] || '').trim(),
          admission_type: (row['D'] || '').trim(),
          general_field_name: (row['E'] || '').trim(),
          detailed_fields: (row['F'] || '').trim(),
          recruitment_number: parseInt(row['H']) || 0,
          recruitment_name: (row['G'] || '').trim(),
          selection_method: (row['I'] || '').trim(),
          csat_ratio: (row['J'] + '' || '').trim(),
          school_record_ratio: (row['K'] + '' || '').trim(),
          interview_ratio: (row['L'] + '' || '').trim(),
          other_ratio: (row['M'] + '' || '').trim(),
          score_calculation: (row['CD'] || '').trim(),
          csat_elements: (row['N'] + '' || '').trim(),
          csat_combination: (row['O'] + '' || '').trim(),
          csat_required: (row['P'] + '' || '').trim(),
          csat_optional: (row['O'] + '' || '').trim(),
          total_score: row['CE'] !== 'N' ? parseInt(row['CE'] || '0') : 0,
          research_subject_count: row['R'] !== 'N' ? parseInt(row['R'] || '0') : 0,
          korean_reflection_score: parseFloat(parseFloat(row['S'] || '0').toFixed(5)) || 0,
          math_reflection_score: parseFloat(parseFloat(row['T'] || '0').toFixed(5)) || 0,
          research_reflection_score: parseFloat(parseFloat(row['V'] || '0').toFixed(5)) || 0,
          english_reflection_score: parseFloat(parseFloat(row['U'] || '0').toFixed(5)) || 0,
          korean_history_reflection_score: parseFloat(parseFloat(row['W'] || '0').toFixed(5)) || 0,
          second_foreign_language_reflection_score: parseFloat(parseFloat(row['X'] || '0').toFixed(5)) || 0,
          min_cut: parseFloat(parseFloat(row['BD'] || '0').toFixed(5)) || 0,
          min_cut_percent: parseFloat(parseFloat(row['BE'] || '0').toFixed(5)) || 0,
          max_cut: parseFloat(parseFloat(row['BF'] || '0').toFixed(5)) || 0,
          max_cut_percent: parseFloat(parseFloat(row['BG'] || '0').toFixed(5)) || 0,
          risk_plus_5: parseFloat(parseFloat(row['BH'] || '0').toFixed(5)) || 0,
          risk_plus_4: parseFloat(parseFloat(row['BI'] || '0').toFixed(5)) || 0,
          risk_plus_3: parseFloat(parseFloat(row['BJ'] || '0').toFixed(5)) || 0,
          risk_plus_2: parseFloat(parseFloat(row['BK'] || '0').toFixed(5)) || 0,
          risk_plus_1: parseFloat(parseFloat(row['BL'] || '0').toFixed(5)) || 0,
          risk_minus_1: parseFloat(parseFloat(row['BM'] || '0').toFixed(5)) || 0,
          risk_minus_2: parseFloat(parseFloat(row['BN'] || '0').toFixed(5)) || 0,
          risk_minus_3: parseFloat(parseFloat(row['BO'] || '0').toFixed(5)) || 0,
          risk_minus_4: parseFloat(parseFloat(row['BP'] || '0').toFixed(5)) || 0,
          risk_minus_5: parseFloat(parseFloat(row['BQ'] || '0').toFixed(5)) || 0,
          initial_cumulative_percentile: parseFloat(parseFloat(row['BE'] || '0').toFixed(5)) || 0,
          additional_cumulative_percentile: parseFloat(parseFloat(row['BG'] || '0').toFixed(5)) || 0,
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

        // Insert regular admission
        const insertAdmissionResult = await client.query(
          `INSERT INTO ts_regular_admissions (
            university_id, year, admission_name, admission_type, general_field_name, detailed_fields,
            recruitment_number, recruitment_name, selection_method, csat_ratio, school_record_ratio,
            interview_ratio, other_ratio, score_calculation, csat_elements, csat_combination,
            csat_required, csat_optional, total_score, research_subject_count,
            korean_reflection_score, math_reflection_score, research_reflection_score,
            english_reflection_score, korean_history_reflection_score, second_foreign_language_reflection_score,
            min_cut, min_cut_percent, max_cut, max_cut_percent,
            risk_plus_5, risk_plus_4, risk_plus_3, risk_plus_2, risk_plus_1,
            risk_minus_1, risk_minus_2, risk_minus_3, risk_minus_4, risk_minus_5,
            initial_cumulative_percentile, additional_cumulative_percentile,
            korean_elective_subject, math_elective_subject,
            math_probability_statistics_additional_points, math_calculus_additional_points, math_geometry_additional_points,
            research_type, research_social_additional_points, research_science_additional_points, math_research_selection,
            english_application_criteria, english_grade_1_score, english_grade_2_score, english_grade_3_score,
            english_grade_4_score, english_grade_5_score, english_grade_6_score, english_grade_7_score,
            english_grade_8_score, english_grade_9_score, english_minimum_criteria,
            korean_history_application_criteria, korean_history_grade_1_score, korean_history_grade_2_score,
            korean_history_grade_3_score, korean_history_grade_4_score, korean_history_grade_5_score,
            korean_history_grade_6_score, korean_history_grade_7_score, korean_history_grade_8_score,
            korean_history_grade_9_score, korean_history_minimum_criteria
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
            $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
            $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73
          ) RETURNING id`,
          [
            admissionData.university_id, admissionData.year, admissionData.admission_name, admissionData.admission_type,
            admissionData.general_field_name, admissionData.detailed_fields, admissionData.recruitment_number,
            admissionData.recruitment_name, admissionData.selection_method, admissionData.csat_ratio,
            admissionData.school_record_ratio, admissionData.interview_ratio, admissionData.other_ratio,
            admissionData.score_calculation, admissionData.csat_elements, admissionData.csat_combination,
            admissionData.csat_required, admissionData.csat_optional, admissionData.total_score,
            admissionData.research_subject_count, admissionData.korean_reflection_score, admissionData.math_reflection_score,
            admissionData.research_reflection_score, admissionData.english_reflection_score,
            admissionData.korean_history_reflection_score, admissionData.second_foreign_language_reflection_score,
            admissionData.min_cut, admissionData.min_cut_percent, admissionData.max_cut, admissionData.max_cut_percent,
            admissionData.risk_plus_5, admissionData.risk_plus_4, admissionData.risk_plus_3, admissionData.risk_plus_2,
            admissionData.risk_plus_1, admissionData.risk_minus_1, admissionData.risk_minus_2, admissionData.risk_minus_3,
            admissionData.risk_minus_4, admissionData.risk_minus_5, admissionData.initial_cumulative_percentile,
            admissionData.additional_cumulative_percentile, admissionData.korean_elective_subject,
            admissionData.math_elective_subject, admissionData.math_probability_statistics_additional_points,
            admissionData.math_calculus_additional_points, admissionData.math_geometry_additional_points,
            admissionData.research_type, admissionData.research_social_additional_points,
            admissionData.research_science_additional_points, admissionData.math_research_selection,
            admissionData.english_application_criteria, admissionData.english_grade_1_score, admissionData.english_grade_2_score,
            admissionData.english_grade_3_score, admissionData.english_grade_4_score, admissionData.english_grade_5_score,
            admissionData.english_grade_6_score, admissionData.english_grade_7_score, admissionData.english_grade_8_score,
            admissionData.english_grade_9_score, admissionData.english_minimum_criteria,
            admissionData.korean_history_application_criteria, admissionData.korean_history_grade_1_score,
            admissionData.korean_history_grade_2_score, admissionData.korean_history_grade_3_score,
            admissionData.korean_history_grade_4_score, admissionData.korean_history_grade_5_score,
            admissionData.korean_history_grade_6_score, admissionData.korean_history_grade_7_score,
            admissionData.korean_history_grade_8_score, admissionData.korean_history_grade_9_score,
            admissionData.korean_history_minimum_criteria
          ]
        );

        const admissionId = insertAdmissionResult.rows[0].id;

        // Insert previous results
        const previousResults = [
          { year: 2024, min_cut: parseFloat(row['BT'] || '0') || null, competition_ratio: parseFloat(row['BR'] || '0') || null, percent: parseFloat(row['BU'] || '0') || null, recruitment_number: parseInt(row['BS']) || null },
          { year: 2023, min_cut: parseFloat(row['BX'] || '0') || null, competition_ratio: parseFloat(row['BV'] || '0') || null, percent: parseFloat(row['BY'] || '0') || null, recruitment_number: parseInt(row['BW']) || null },
          { year: 2022, min_cut: parseFloat(row['CB'] || '0') || null, competition_ratio: parseFloat(row['BZ'] || '0') || null, percent: parseFloat(row['CC'] || '0') || null, recruitment_number: parseInt(row['CA']) || null },
        ];

        for (const result of previousResults) {
          await client.query(
            `INSERT INTO ts_regular_admission_previous_results
             (regular_admission_id, year, min_cut, max_cut, competition_ratio, percent, recruitment_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [admissionId, result.year, result.min_cut, null, result.competition_ratio, result.percent, result.recruitment_number]
          );
        }

        successCount++;
        if (successCount % 100 === 0) {
          console.log(`✅ ${successCount}개 처리 완료...`);
        }
      } catch (err: any) {
        errorCount++;
        if (errors.length < 10) {
          errors.push(`Row ${i}: ${err.message?.substring(0, 100)}`);
        }
      }
    }

    await client.query('COMMIT');

    console.log('\n📊 업로드 결과:');
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ⚠️ 실패: ${errorCount}개`);

    if (errors.length > 0) {
      console.log('\n❌ 에러 목록 (최대 10개):');
      errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    }

    // Verify data
    const countResult = await client.query(
      'SELECT COUNT(*) as cnt FROM ts_regular_admissions WHERE year = $1',
      [YEAR]
    );
    console.log(`\n📋 DB에 저장된 ${YEAR}년 정시 전형 수: ${countResult.rows[0].cnt}`);

    const universityCount = await client.query('SELECT COUNT(*) as cnt FROM ts_universities');
    console.log(`🏫 총 대학 수: ${universityCount.rows[0].cnt}`);

    await client.end();
    console.log('\n✅ 업로드 완료!');
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ 업로드 실패:', error.message);
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.log('🔧 정시 전형 데이터 업로드 스크립트');
  console.log('\n사용법: npx ts-node scripts/upload-regular-admission.ts <excel-file-path>');
  console.log('\n예시:');
  console.log('  npx ts-node scripts/upload-regular-admission.ts ./data/정시데이터.xlsx');
  console.log('  npx ts-node scripts/upload-regular-admission.ts "C:\\Users\\User\\Desktop\\정시전형.xlsx"');
  console.log('\nExcel 파일 형식:');
  console.log('  - A열: 지역');
  console.log('  - B열: 대학명');
  console.log('  - C열: 모집단위명');
  console.log('  - D열: 전형유형 (가/나/다)');
  console.log('  - CG열: 대학코드');
  console.log('  - ... (총 86개 열)');
  process.exit(0);
}

uploadRegularAdmission(path.resolve(filePath));
