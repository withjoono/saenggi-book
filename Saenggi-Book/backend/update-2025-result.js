/**
 * 2025년 정시 입결 데이터 업데이트 스크립트
 * 엑셀 파일에서 읽어서 DB의 2025년 입결 레코드를 업데이트합니다.
 */

const XLSX = require('xlsx');
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
});

async function main() {
  console.log('DB 연결 중...');
  await dataSource.initialize();
  console.log('DB 연결 완료\n');

  // 1. 엑셀 파일 읽기
  console.log('엑셀 파일 읽는 중...');
  const workbook = XLSX.readFile('uploads/2025정시-실제컷-정리.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet);
  console.log(`엑셀 데이터: ${excelData.length}개 행\n`);

  // 2. DB에서 2025년 입결 데이터와 관련 정보 조회
  console.log('DB에서 2025년 입결 데이터 조회 중...');
  const dbRecords = await dataSource.query(`
    SELECT
      pr.id as prev_result_id,
      pr.year,
      ra.id as admission_id,
      ra.recruitment_name,
      u.id as univ_id,
      u.name as univ_name,
      u.code as univ_code
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.year = 2025
  `);
  console.log(`DB 2025년 입결 레코드: ${dbRecords.length}개\n`);

  // 3. 매칭을 위한 맵 생성 (대학명 + 모집단위명으로 매칭)
  const dbMap = new Map();
  for (const record of dbRecords) {
    // 대학명 정규화 (공백, 특수문자 제거)
    const normalizedUnivName = record.univ_name.replace(/\s+/g, '').toLowerCase();
    const normalizedRecruitName = record.recruitment_name.replace(/\s+/g, '').toLowerCase();
    const key = `${normalizedUnivName}|${normalizedRecruitName}`;
    dbMap.set(key, record);
  }

  // 4. 엑셀 데이터와 매칭하여 업데이트
  let matchCount = 0;
  let noMatchCount = 0;
  let updateCount = 0;
  const noMatchList = [];

  for (const row of excelData) {
    const univName = (row['대학명'] || '').replace(/\s+/g, '').toLowerCase();
    const recruitName = (row['모집단위'] || '').replace(/\s+/g, '').toLowerCase();
    const key = `${univName}|${recruitName}`;

    const dbRecord = dbMap.get(key);

    if (dbRecord) {
      matchCount++;

      // 업데이트 쿼리 실행
      const updateResult = await dataSource.query(`
        UPDATE ts_regular_admission_previous_results
        SET
          recruitment_number = $1,
          competition_ratio = $2,
          additional_pass_rank = $3,
          min_cut = $4,
          max_cut = $5,
          converted_score_total = $6,
          percentile_50 = $7,
          percentile_70 = $8
        WHERE id = $9
      `, [
        row['모집인원(최종)'] || null,
        row['경쟁률'] || null,
        row['충원합격순위'] || null,
        row['환산점수 50%컷'] || null,
        row['환산점수 70%컷'] || null,
        row['총점(수능)'] || null,
        row['백분위50%컷'] || null,
        row['백분위70%컷'] || null,
        dbRecord.prev_result_id
      ]);

      if (updateResult[1] > 0) {
        updateCount++;
      }
    } else {
      noMatchCount++;
      if (noMatchList.length < 20) {
        noMatchList.push({ univName: row['대학명'], recruitName: row['모집단위'] });
      }
    }
  }

  console.log('=== 결과 ===');
  console.log(`총 엑셀 데이터: ${excelData.length}개`);
  console.log(`매칭 성공: ${matchCount}개`);
  console.log(`매칭 실패: ${noMatchCount}개`);
  console.log(`업데이트 완료: ${updateCount}개`);

  if (noMatchList.length > 0) {
    console.log('\n매칭 실패 샘플 (최대 20개):');
    noMatchList.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.univName} - ${item.recruitName}`);
    });
  }

  // 5. 업데이트 확인
  const verifyResult = await dataSource.query(`
    SELECT COUNT(*) as count
    FROM ts_regular_admission_previous_results
    WHERE year = 2025 AND percentile_50 IS NOT NULL
  `);
  console.log(`\n검증: percentile_50이 있는 2025년 레코드: ${verifyResult[0].count}개`);

  await dataSource.destroy();
  console.log('\n완료!');
}

main().catch(console.error);
