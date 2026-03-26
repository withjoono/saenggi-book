/**
 * 정시 입학 정보 엑셀 -> DB 가져오기 스크립트
 * ts_regular_admissions 테이블의 기존 데이터 삭제 후 새 데이터 삽입
 */

const XLSX = require('xlsx');
const { Client } = require('pg');

// DB 설정
const DB_CONFIGS = {
  dev: {
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'Junho@46852',
    database: 'geobukschool_dev',
  },
  prod: {
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  },
};

// 명령줄 인자로 환경 선택 (dev 또는 prod)
const env = process.argv[2] || 'dev';
const excelPath = process.argv[3] || 'e:/Dev/github/GB-Back-Nest/uploads/2026 정시 디비 1218 out.xlsx';

if (!DB_CONFIGS[env]) {
  console.error('사용법: node import-regular-admissions.js [dev|prod] [excel파일경로]');
  process.exit(1);
}

const config = DB_CONFIGS[env];
console.log(`\n🔧 환경: ${env.toUpperCase()}`);
console.log(`📁 엑셀 파일: ${excelPath}`);
console.log(`🗄️  DB: ${config.database} (${config.host}:${config.port})\n`);

async function main() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ DB 연결 성공\n');

    // 엑셀 파일 읽기
    const wb = XLSX.readFile(excelPath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`📊 총 행 수: ${data.length} (헤더 2행 제외하면 ${data.length - 2}개 데이터)`);

    // 대학 목록 조회 (code -> id 매핑)
    const uniResult = await client.query('SELECT id, code, name FROM ts_universities');
    const uniMap = {};
    uniResult.rows.forEach((row) => {
      uniMap[row.code] = { id: row.id, name: row.name };
    });
    console.log(`🏫 대학 수: ${Object.keys(uniMap).length}개`);

    // 기존 데이터 삭제 (previous_results 먼저)
    console.log('\n🗑️  기존 데이터 삭제 중...');

    const deleteResultsRes = await client.query('DELETE FROM ts_regular_admission_previous_results');
    console.log(`   - ts_regular_admission_previous_results: ${deleteResultsRes.rowCount}개 삭제`);

    const deleteRes = await client.query('DELETE FROM ts_regular_admissions');
    console.log(`   - ts_regular_admissions: ${deleteRes.rowCount}개 삭제`);

    // 데이터 삽입
    console.log('\n📝 새 데이터 삽입 중...');

    let insertCount = 0;
    let skipCount = 0;
    const errors = [];

    // 3행부터 데이터 시작 (인덱스 2)
    for (let i = 2; i < data.length; i++) {
      const row = data[i];

      // 빈 행 스킵
      if (!row[1]) {
        skipCount++;
        continue;
      }

      const uCode = String(row[84] || '').trim();
      const university = uniMap[uCode];

      if (!university) {
        errors.push(`행 ${i + 1}: 대학코드 '${uCode}' 없음 (${row[1]} - ${row[6]})`);
        skipCount++;
        continue;
      }

      const values = [
        2026, // year
        university.id, // university_id
        String(row[2] || '').trim(), // admission_name (전형유형)
        String(row[3] || '').replace(/\s/g, ''), // admission_type (모집군)
        String(row[4] || '').trim(), // general_field_name (계열)
        String(row[5] || '').trim(), // detailed_fields (상세계열)
        String(row[6] || '').trim(), // recruitment_name (모집단위명)
        parseInt(row[7]) || 0, // recruitment_number (모집인원)
        String(row[8] || '').trim(), // selection_method (선발방식)
        String(row[9] || '').trim(), // csat_ratio (수능비율)
        String(row[10] || '').trim(), // school_record_ratio (학생부비율)
        String(row[11] || '').trim(), // interview_ratio (면접비율)
        String(row[12] || '').trim(), // other_ratio (기타비율)
        String(row[13] || '').trim(), // csat_elements (수능요소)
        String(row[14] || '').trim(), // csat_combination (수능조합)
        String(row[15] || '').trim(), // csat_required (필수)
        String(row[16] || '').trim(), // csat_optional (선택)
        parseInt(row[17]) || null, // research_subject_count (탐구과목수)
        parseFloat(row[18]) || null, // korean_reflection_score (국)
        parseFloat(row[19]) || null, // math_reflection_score (수)
        parseFloat(row[20]) || null, // english_reflection_score (영)
        parseFloat(row[21]) || null, // research_reflection_score (탐)
        parseFloat(row[22]) || null, // korean_history_reflection_score (한국사)
        parseFloat(row[23]) || null, // second_foreign_language_reflection_score (제2외)
        String(row[24] || '').trim() || null, // korean_elective_subject (국어선택과목)
        String(row[25] || '').trim() || null, // math_elective_subject (수학선택과목)
        String(row[26] || '').trim() || null, // math_probability_statistics_additional_points
        String(row[27] || '').trim() || null, // math_calculus_additional_points
        String(row[28] || '').trim() || null, // math_geometry_additional_points
        String(row[29] || '').trim() || null, // research_type (유형)
        String(row[30] || '').trim() || null, // research_social_additional_points
        String(row[31] || '').trim() || null, // research_science_additional_points
        String(row[32] || '').trim() || null, // math_research_selection (수탐선택)
        String(row[33] || '').trim() || null, // english_application_criteria
        String(row[34] || '').trim() || null, // english_grade_1_score
        String(row[35] || '').trim() || null, // english_grade_2_score
        String(row[36] || '').trim() || null, // english_grade_3_score
        String(row[37] || '').trim() || null, // english_grade_4_score
        String(row[38] || '').trim() || null, // english_grade_5_score
        String(row[39] || '').trim() || null, // english_grade_6_score
        String(row[40] || '').trim() || null, // english_grade_7_score
        String(row[41] || '').trim() || null, // english_grade_8_score
        String(row[42] || '').trim() || null, // english_grade_9_score
        String(row[43] || '').trim() || null, // english_minimum_criteria
        String(row[44] || '').trim() || null, // korean_history_application_criteria
        String(row[45] || '').trim() || null, // korean_history_grade_1_score
        String(row[46] || '').trim() || null, // korean_history_grade_2_score
        String(row[47] || '').trim() || null, // korean_history_grade_3_score
        String(row[48] || '').trim() || null, // korean_history_grade_4_score
        String(row[49] || '').trim() || null, // korean_history_grade_5_score
        String(row[50] || '').trim() || null, // korean_history_grade_6_score
        String(row[51] || '').trim() || null, // korean_history_grade_7_score
        String(row[52] || '').trim() || null, // korean_history_grade_8_score
        String(row[53] || '').trim() || null, // korean_history_grade_9_score
        String(row[54] || '').trim() || null, // korean_history_minimum_criteria
        parseFloat(row[55]) || null, // min_cut (최초컷 점수)
        parseFloat(row[56]) || null, // min_cut_percent (최초컷 누백)
        parseFloat(row[57]) || null, // max_cut (추합컷 점수)
        parseFloat(row[58]) || null, // max_cut_percent (추합컷 누백)
        parseFloat(row[59]) || null, // risk_plus_5
        parseFloat(row[60]) || null, // risk_plus_4
        parseFloat(row[61]) || null, // risk_plus_3
        parseFloat(row[62]) || null, // risk_plus_2
        parseFloat(row[63]) || null, // risk_plus_1
        parseFloat(row[64]) || null, // risk_minus_1
        parseFloat(row[65]) || null, // risk_minus_2
        parseFloat(row[66]) || null, // risk_minus_3
        parseFloat(row[67]) || null, // risk_minus_4
        parseFloat(row[68]) || null, // risk_minus_5
        String(row[81] || '').trim() || null, // score_calculation (점수환산식)
        parseInt(row[82]) || null, // total_score (환산점수총점)
      ];

      const query = `
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
          $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,
          $71
        )
      `;

      try {
        await client.query(query, values);
        insertCount++;

        if (insertCount % 500 === 0) {
          console.log(`   진행: ${insertCount}개 삽입 완료...`);
        }
      } catch (err) {
        errors.push(`행 ${i + 1}: ${err.message} (${row[1]} - ${row[6]})`);
        skipCount++;
      }
    }

    console.log(`\n✅ 완료!`);
    console.log(`   - 삽입: ${insertCount}개`);
    console.log(`   - 스킵: ${skipCount}개`);

    if (errors.length > 0) {
      console.log(`\n⚠️  에러 (총 ${errors.length}개):`);
      errors.slice(0, 20).forEach((e) => console.log(`   ${e}`));
      if (errors.length > 20) {
        console.log(`   ... 외 ${errors.length - 20}개`);
      }
    }

    // 삽입 결과 확인
    const countRes = await client.query('SELECT COUNT(*) FROM ts_regular_admissions');
    console.log(`\n📊 최종 ts_regular_admissions 레코드 수: ${countRes.rows[0].count}개`);

  } catch (err) {
    console.error('❌ 에러 발생:', err.message);
    throw err;
  } finally {
    await client.end();
    console.log('\n🔌 DB 연결 종료');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
