/**
 * 2025년 정시 입결 데이터 업데이트 스크립트 v2
 * 대학명과 모집단위명 정규화 개선
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

// 대학명 정규화 함수
function normalizeUnivName(name) {
  if (!name) return '';
  return name
    .replace(/대학교$/, '대')  // "가천대학교" -> "가천대"
    .replace(/\s+/g, '')       // 공백 제거
    .toLowerCase();
}

// 모집단위명 정규화 함수
function normalizeRecruitName(name) {
  if (!name) return '';
  return name
    .replace(/[·\-\s()（）]/g, '')  // 특수문자, 공백, 괄호 제거
    .toLowerCase();
}

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

  // 3. 매칭을 위한 맵 생성 (정규화된 대학명 + 모집단위명으로 매칭)
  const dbMap = new Map();
  for (const record of dbRecords) {
    const normalizedUnivName = normalizeUnivName(record.univ_name);
    const normalizedRecruitName = normalizeRecruitName(record.recruitment_name);
    const key = `${normalizedUnivName}|${normalizedRecruitName}`;
    dbMap.set(key, record);
  }

  // 디버그: 맵의 일부 키 출력
  console.log('DB 맵 키 샘플 (처음 10개):');
  let count = 0;
  for (const key of dbMap.keys()) {
    if (count++ >= 10) break;
    console.log(`  - ${key}`);
  }
  console.log('');

  // 엑셀 키 샘플 출력
  console.log('엑셀 키 샘플 (처음 10개):');
  for (let i = 0; i < 10 && i < excelData.length; i++) {
    const row = excelData[i];
    const univName = normalizeUnivName(row['대학명'] || '');
    const recruitName = normalizeRecruitName(row['모집단위'] || '');
    console.log(`  - ${univName}|${recruitName}`);
  }
  console.log('');

  // 4. 엑셀 데이터와 매칭하여 업데이트
  let matchCount = 0;
  let noMatchCount = 0;
  let updateCount = 0;
  const noMatchList = [];

  for (const row of excelData) {
    const univName = normalizeUnivName(row['대학명'] || '');
    const recruitName = normalizeRecruitName(row['모집단위'] || '');
    const key = `${univName}|${recruitName}`;

    const dbRecord = dbMap.get(key);

    if (dbRecord) {
      matchCount++;

      // 데이터 타입 변환
      const recruitmentNumber = row['모집인원(최종)'] ? parseInt(row['모집인원(최종)']) : null;
      const competitionRatio = row['경쟁률'] ? parseFloat(row['경쟁률']) : null;
      const additionalPassRank = row['충원합격순위'] ? parseInt(row['충원합격순위']) : null;
      const minCut = row['환산점수 50%컷'] ? parseFloat(row['환산점수 50%컷']) : null;
      const maxCut = row['환산점수 70%컷'] ? parseFloat(row['환산점수 70%컷']) : null;
      const convertedScoreTotal = row['총점(수능)'] ? parseFloat(row['총점(수능)']) : null;
      const percentile50 = row['백분위50%컷'] ? parseFloat(row['백분위50%컷']) : null;
      const percentile70 = row['백분위70%컷'] ? parseFloat(row['백분위70%컷']) : null;

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
        recruitmentNumber,
        competitionRatio,
        additionalPassRank,
        minCut,
        maxCut,
        convertedScoreTotal,
        percentile50,
        percentile70,
        dbRecord.prev_result_id
      ]);

      updateCount++;
    } else {
      noMatchCount++;
      if (noMatchList.length < 30) {
        noMatchList.push({
          univName: row['대학명'],
          recruitName: row['모집단위'],
          key: key
        });
      }
    }
  }

  console.log('=== 결과 ===');
  console.log(`총 엑셀 데이터: ${excelData.length}개`);
  console.log(`매칭 성공: ${matchCount}개`);
  console.log(`매칭 실패: ${noMatchCount}개`);
  console.log(`업데이트 완료: ${updateCount}개`);

  if (noMatchList.length > 0) {
    console.log('\n매칭 실패 샘플 (최대 30개):');
    noMatchList.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.univName} - ${item.recruitName} (key: ${item.key})`);
    });
  }

  // 5. 업데이트 확인
  const verifyResult = await dataSource.query(`
    SELECT COUNT(*) as count
    FROM ts_regular_admission_previous_results
    WHERE year = 2025 AND percentile_50 IS NOT NULL
  `);
  console.log(`\n검증: percentile_50이 있는 2025년 레코드: ${verifyResult[0].count}개`);

  // 가천대 샘플 확인
  const gachonCheck = await dataSource.query(`
    SELECT
      u.name as univ_name,
      ra.recruitment_name,
      pr.percentile_50,
      pr.percentile_70
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name = '가천대' AND pr.year = 2025
    LIMIT 5
  `);
  console.log('\n가천대 업데이트 확인:');
  gachonCheck.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.recruitment_name}: 백분위50=${r.percentile_50}, 백분위70=${r.percentile_70}`);
  });

  await dataSource.destroy();
  console.log('\n완료!');
}

main().catch(console.error);
