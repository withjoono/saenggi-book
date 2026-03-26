const XLSX = require('xlsx');
const { Pool } = require('pg');

// PostgreSQL 연결 설정
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
});

async function uploadUniversityLevels() {
  console.log('\n📄 1. 대학 레벨 데이터 업로드 시작...');

  const workbook = XLSX.readFile('uploads/ss_univ_level.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // 첫 번째 시트만
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`총 ${data.length}개 대학 데이터 발견`);

  // 기존 데이터 삭제
  await pool.query('TRUNCATE TABLE university_level RESTART IDENTITY CASCADE');
  console.log('기존 데이터 삭제 완료');

  let successCount = 0;
  for (const row of data) {
    try {
      await pool.query(
        `INSERT INTO university_level (university_name, university_code, level)
         VALUES ($1, $2, $3)`,
        [row['대학명1'], row['코드명'], row['대학레벨']],
      );
      successCount++;
    } catch (error) {
      console.error(`❌ 업로드 실패: ${row['대학명1']}`, error.message);
    }
  }

  console.log(`✅ 대학 레벨 데이터 업로드 완료: ${successCount}/${data.length}`);
}

async function uploadHumanitiesCriteria() {
  console.log('\n📄 2. 문과 계열 평가 기준 업로드 시작...');

  const workbook = XLSX.readFile('uploads/ss_kyeyeol_evalue_mun.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet);

  // 첫 번째 행은 헤더이므로 제외
  const data = rawData.slice(1);

  console.log(`총 ${data.length}개 레벨 기준 발견`);

  // 기존 데이터 삭제
  await pool.query(
    'TRUNCATE TABLE series_evaluation_criteria_humanities RESTART IDENTITY CASCADE',
  );
  console.log('기존 데이터 삭제 완료');

  let successCount = 0;
  for (const row of data) {
    try {
      // Level 7 형식에서 숫자만 추출
      const levelText = row['__EMPTY'] || '';
      const levelMatch = levelText.match(/Level (\d+)/);
      if (!levelMatch) {
        console.log(`⚠️ 레벨 파싱 실패: ${levelText}`);
        continue;
      }
      const level = parseInt(levelMatch[1]);

      await pool.query(
        `INSERT INTO series_evaluation_criteria_humanities
         (level, university_category, korean, english, math, social, second_foreign_language, overall_grade_range)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          level,
          row['주요교과 권장 등급'] || '',
          row['__EMPTY_1'] || 0,
          row['__EMPTY_2'] || 0,
          row['__EMPTY_3'] || 0,
          row['__EMPTY_4'] || 0,
          row['__EMPTY_5'] || 0,
          row['__EMPTY_6'] || null,
        ],
      );
      successCount++;
    } catch (error) {
      console.error(`❌ 업로드 실패:`, error.message);
    }
  }

  console.log(`✅ 문과 계열 평가 기준 업로드 완료: ${successCount}/${data.length}`);
}

async function uploadScienceCriteria() {
  console.log('\n📄 3. 이과 계열 평가 기준 업로드 시작...');

  const workbook = XLSX.readFile('uploads/ss_kyeyeol_evalue_lee.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet);

  // 첫 번째 행은 헤더이므로 제외
  const data = rawData.slice(1);

  console.log(`총 ${data.length}개 레벨 기준 발견`);

  // 기존 데이터 삭제
  await pool.query(
    'TRUNCATE TABLE series_evaluation_criteria_science RESTART IDENTITY CASCADE',
  );
  console.log('기존 데이터 삭제 완료');

  // "6이하", "7이하" 같은 텍스트를 숫자로 변환하는 함수
  const parseGradeValue = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // "6이하" -> 6, "7이하" -> 7
      const match = value.match(/(\d+)이하/);
      if (match) return parseInt(match[1]);
    }
    return 0;
  };

  let successCount = 0;
  for (const row of data) {
    try {
      // Level 7 형식에서 숫자만 추출
      const levelText = row['__EMPTY'] || '';
      const levelMatch = levelText.match(/Level (\d+)/);
      if (!levelMatch) {
        console.log(`⚠️ 레벨 파싱 실패: ${levelText}`);
        continue;
      }
      const level = parseInt(levelMatch[1]);

      await pool.query(
        `INSERT INTO series_evaluation_criteria_science
         (level, university_category, statistics, calculus, geometry, ai_math,
          physics1, physics2, chemistry1, chemistry2,
          biology1, biology2, earth_science1, earth_science2)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          level,
          row['필수과목, 장려과목 권장 등급'] || '',
          parseGradeValue(row['__EMPTY_1']),
          parseGradeValue(row['__EMPTY_2']),
          parseGradeValue(row['__EMPTY_3']),
          parseGradeValue(row['__EMPTY_4']),
          parseGradeValue(row['__EMPTY_5']),
          parseGradeValue(row['__EMPTY_6']),
          parseGradeValue(row['__EMPTY_7']),
          parseGradeValue(row['__EMPTY_8']),
          parseGradeValue(row['__EMPTY_9']),
          parseGradeValue(row['__EMPTY_10']),
          parseGradeValue(row['__EMPTY_11']),
          parseGradeValue(row['__EMPTY_12']),
        ],
      );
      successCount++;
    } catch (error) {
      console.error(`❌ 업로드 실패:`, error.message);
    }
  }

  console.log(`✅ 이과 계열 평가 기준 업로드 완료: ${successCount}/${data.length}`);
}

async function main() {
  try {
    console.log('🚀 계열 적합성 평가 데이터 업로드 시작');
    console.log('='.repeat(80));

    await uploadUniversityLevels();
    await uploadHumanitiesCriteria();
    await uploadScienceCriteria();

    console.log('\n' + '='.repeat(80));
    console.log('✅ 모든 데이터 업로드 완료!');
  } catch (error) {
    console.error('❌ 업로드 중 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

main();
