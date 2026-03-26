/**
 * 논술 전형 샘플 데이터 시드 스크립트
 * 테스트용으로 몇 개의 논술 전형 데이터를 추가합니다.
 */

const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
};

const sampleEssays = [
  {
    college_code: '1001',
    admission_series_code: '2026',
    recruitment_unit: '서울대학교 인문계열',
    essay_type: '인문논술',
    essay_subject: '통합논술',
    examination_tendency: '인문학, 사회과학 통합 논술',
    competition_rate: '15.2:1',
    integration_code: 'SNU_HUM_2026',
    rthree_etc_code: '',
    rthree_etc_flag: 0,
    rthree_region_flag: 0,
    rthree_region_info: '',
    su_nosul: '논술100%',
    susi: '수시',
    type_rate: '논술100%',
    type_time: '120분',
    admission_date: '2025-11-15',
    admission_time: '09:00',
    student_recruitment_num: 50,
    lowest_use: 1,
    lowest_korean: 2,
    lowest_math: 2,
    lowest_english: 2,
    lowest_sum: 6,
    content: '국어, 수학, 영어 중 3개 영역 합 6등급 이내',
  },
  {
    college_code: '1002',
    admission_series_code: '2026',
    recruitment_unit: '연세대학교 경영학과',
    essay_type: '상경논술',
    essay_subject: '수리논술',
    examination_tendency: '수리 및 경제 논술',
    competition_rate: '18.5:1',
    integration_code: 'YU_BUS_2026',
    rthree_etc_code: '',
    rthree_etc_flag: 0,
    rthree_region_flag: 0,
    rthree_region_info: '',
    su_nosul: '논술60%+학생부40%',
    susi: '수시',
    type_rate: '논술60%+학생부40%',
    type_time: '150분',
    admission_date: '2025-11-20',
    admission_time: '10:00',
    student_recruitment_num: 30,
    lowest_use: 1,
    lowest_korean: 2,
    lowest_math: 1,
    lowest_english: 2,
    lowest_sum: 5,
    content: '국어, 수학, 영어 중 3개 영역 합 5등급 이내',
  },
  {
    college_code: '1003',
    admission_series_code: '2026',
    recruitment_unit: '고려대학교 자연계열',
    essay_type: '자연논술',
    essay_subject: '수학+과학',
    examination_tendency: '수학 및 과학 통합 논술',
    competition_rate: '20.3:1',
    integration_code: 'KU_SCI_2026',
    rthree_etc_code: '',
    rthree_etc_flag: 0,
    rthree_region_flag: 0,
    rthree_region_info: '',
    su_nosul: '논술100%',
    susi: '수시',
    type_rate: '논술100%',
    type_time: '120분',
    admission_date: '2025-11-18',
    admission_time: '14:00',
    student_recruitment_num: 80,
    lowest_use: 1,
    lowest_math: 2,
    lowest_english: 2,
    lowest_science: 2,
    lowest_sum: 6,
    content: '수학, 영어, 과학탐구 중 3개 영역 합 6등급 이내',
  },
  {
    college_code: '1004',
    admission_series_code: '2026',
    recruitment_unit: '성균관대학교 공과대학',
    essay_type: '자연논술',
    essay_subject: '수학',
    examination_tendency: '수학 중심 논술',
    competition_rate: '12.8:1',
    integration_code: 'SKU_ENG_2026',
    rthree_etc_code: '',
    rthree_etc_flag: 0,
    rthree_region_flag: 0,
    rthree_region_info: '',
    su_nosul: '논술70%+학생부30%',
    susi: '수시',
    type_rate: '논술70%+학생부30%',
    type_time: '100분',
    admission_date: '2025-11-22',
    admission_time: '09:00',
    student_recruitment_num: 60,
    lowest_use: 0,
    content: '수능 최저등급 없음',
  },
  {
    college_code: '1005',
    admission_series_code: '2026',
    recruitment_unit: '한양대학교 의예과',
    essay_type: '의학논술',
    essay_subject: '통합논술',
    examination_tendency: '과학, 윤리 통합 논술',
    competition_rate: '35.6:1',
    integration_code: 'HYU_MED_2026',
    rthree_etc_code: '',
    rthree_etc_flag: 0,
    rthree_region_flag: 0,
    rthree_region_info: '',
    su_nosul: '논술100%',
    susi: '수시',
    type_rate: '논술100%',
    type_time: '150분',
    admission_date: '2025-11-25',
    admission_time: '09:00',
    student_recruitment_num: 20,
    lowest_use: 1,
    lowest_korean: 1,
    lowest_math: 1,
    lowest_english: 1,
    lowest_science: 1,
    lowest_sum: 4,
    content: '국어, 수학, 영어, 과학탐구 중 4개 영역 합 4등급 이내',
  },
];

async function main() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ DB 연결 성공\n');

    // 기존 데이터 확인
    const countResult = await client.query('SELECT COUNT(*) FROM essay_list_tb');
    const existingCount = parseInt(countResult.rows[0].count);
    console.log(`📊 기존 논술 데이터: ${existingCount}개\n`);

    if (existingCount > 0) {
      console.log('⚠️  이미 데이터가 존재합니다. 계속하시겠습니까?');
      console.log('   기존 데이터를 삭제하고 샘플 데이터를 추가하려면 다음 명령을 실행하세요:');
      console.log('   DELETE FROM essay_lowest_grade_list_tb;');
      console.log('   DELETE FROM essay_list_tb;');
      console.log('\n   샘플 데이터 추가를 계속합니다...\n');
    }

    let inserted = 0;
    let skipped = 0;

    for (const essay of sampleEssays) {
      // 중복 체크
      const existing = await client.query(
        `SELECT id FROM essay_list_tb 
         WHERE college_code = $1 AND recruitment_unit = $2`,
        [essay.college_code, essay.recruitment_unit]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  스킵: ${essay.recruitment_unit} (이미 존재)`);
        skipped++;
        continue;
      }

      // essay_list_tb 삽입
      const essayResult = await client.query(
        `INSERT INTO essay_list_tb (
          college_code, admission_series_code, recruitment_unit, essay_type,
          essay_subject, examination_tendency, competition_rate, integration_code,
          rthree_etc_code, rthree_etc_flag, rthree_region_flag, rthree_region_info,
          su_nosul, susi, type_rate, type_time, admission_date, admission_time,
          student_recruitment_num
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id`,
        [
          essay.college_code,
          essay.admission_series_code,
          essay.recruitment_unit,
          essay.essay_type,
          essay.essay_subject,
          essay.examination_tendency,
          essay.competition_rate,
          essay.integration_code,
          essay.rthree_etc_code,
          essay.rthree_etc_flag,
          essay.rthree_region_flag,
          essay.rthree_region_info,
          essay.su_nosul,
          essay.susi,
          essay.type_rate,
          essay.type_time,
          essay.admission_date,
          essay.admission_time,
          essay.student_recruitment_num,
        ]
      );

      const essayId = essayResult.rows[0].id;

      // essay_lowest_grade_list_tb 삽입 (최저등급이 있는 경우)
      if (essay.lowest_use === 1) {
        await client.query(
          `INSERT INTO essay_lowest_grade_list_tb (
            essay_id, college_code, lowest_use, lowest_korean, lowest_math, lowest_english,
            lowest_history, lowest_science, lowest_society, lowest_sum, lowest_cal,
            lowest_count, lowest_migi, content
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            essayId,
            essay.college_code,
            essay.lowest_use,
            essay.lowest_korean || 0,
            essay.lowest_math || 0,
            essay.lowest_english || 0,
            essay.lowest_history || 0,
            essay.lowest_science || 0,
            essay.lowest_society || 0,
            essay.lowest_sum || 0,
            0, // lowest_cal
            0, // lowest_count
            0, // lowest_migi
            essay.content || '',
          ]
        );
      }

      console.log(`✅ 추가: ${essay.recruitment_unit}`);
      inserted++;
    }

    console.log(`\n🎉 완료!`);
    console.log(`   추가됨: ${inserted}개`);
    console.log(`   스킵됨: ${skipped}개`);

    // 최종 카운트
    const finalCount = await client.query('SELECT COUNT(*) FROM essay_list_tb');
    console.log(`   총 논술 데이터: ${finalCount.rows[0].count}개\n`);

    await client.end();
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    await client.end();
    process.exit(1);
  }
}

main();

