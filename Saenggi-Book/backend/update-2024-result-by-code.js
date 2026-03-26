/**
 * 2024년 정시 입결 데이터 업데이트 스크립트 (코드 기반 매칭)
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

// 대학 코드 매핑 (엑셀 코드 -> DB 코드)
const CODE_MAPPING = {
  'U504': 'U308',  // 강원대학교 -> 강원대(춘천)
  'U535': 'U512',  // 동양대학교 -> 동양대
  'U120': 'U517',  // 세한대학교 -> 세한대
  'U143': 'U520',  // 영산대학교 -> 영산대
  'U183': 'U527',  // 청운대학교 -> 청운대
};

function normalizeUnivName(name) {
  if (!name) return '';
  return name.replace(/대학교$/, '대').replace(/\s+/g, '').replace(/\(.*\)/, '').toLowerCase();
}

function normalizeRecruitName(name) {
  if (!name) return '';
  return name.replace(/[·\-\s()（）\[\]]/g, '').toLowerCase();
}

function findBestRecruitMatch(excelRecruit, dbRecords) {
  const normalizedExcel = normalizeRecruitName(excelRecruit);

  for (const record of dbRecords) {
    if (normalizeRecruitName(record.recruitment_name) === normalizedExcel) {
      return { match: record, score: 1.0, reason: 'exact' };
    }
  }

  const suffixes = ['학과', '학부', '전공', '계열'];
  let baseExcel = normalizedExcel;
  for (const suffix of suffixes) {
    if (baseExcel.endsWith(suffix)) {
      baseExcel = baseExcel.slice(0, -suffix.length);
      break;
    }
  }

  for (const record of dbRecords) {
    let baseDb = normalizeRecruitName(record.recruitment_name);
    for (const suffix of suffixes) {
      if (baseDb.endsWith(suffix)) {
        baseDb = baseDb.slice(0, -suffix.length);
        break;
      }
    }
    if (baseExcel === baseDb && baseExcel.length >= 2) {
      return { match: record, score: 0.95, reason: 'suffix_diff' };
    }
  }

  if (normalizedExcel.length >= 4) {
    for (const record of dbRecords) {
      const normalizedDb = normalizeRecruitName(record.recruitment_name);
      if (normalizedDb.length >= 4) {
        if (normalizedExcel.includes(normalizedDb) || normalizedDb.includes(normalizedExcel)) {
          return { match: record, score: 0.9, reason: 'contains' };
        }
      }
    }
  }

  return { match: null, score: 0, reason: 'no_match' };
}

async function main() {
  console.log('DB 연결 중...');
  await dataSource.initialize();
  console.log('DB 연결 완료\n');

  // 엑셀 파일 읽기
  console.log('엑셀 파일 읽는 중...');
  const workbook = XLSX.readFile('uploads/2024정시-실제컷-정리.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet);
  console.log(`엑셀 데이터: ${excelData.length}개 행\n`);

  // DB에서 2024년 입결 데이터 조회
  console.log('DB에서 2024년 입결 데이터 조회 중...');
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
    WHERE pr.year = 2024
  `);
  console.log(`DB 2024년 입결 레코드: ${dbRecords.length}개\n`);

  // DB 데이터를 대학 코드별로 그룹화
  const dbByCode = new Map();
  const dbByName = new Map();

  for (const record of dbRecords) {
    if (!dbByCode.has(record.univ_code)) {
      dbByCode.set(record.univ_code, []);
    }
    dbByCode.get(record.univ_code).push(record);

    const normalizedName = normalizeUnivName(record.univ_name);
    if (!dbByName.has(normalizedName)) {
      dbByName.set(normalizedName, []);
    }
    dbByName.get(normalizedName).push(record);
  }

  console.log(`DB 대학 코드 수: ${dbByCode.size}개\n`);

  // 매칭 및 업데이트
  const usedRecords = new Set();
  let codeMatchCount = 0;
  let nameMatchCount = 0;
  let noUnivCount = 0;
  let noRecruitCount = 0;

  for (const row of excelData) {
    const excelCode = row['대학코드'] || '';
    const excelUnivName = row['대학명'] || '';
    const excelRecruitName = row['모집단위'] || '';

    const mappedCode = CODE_MAPPING[excelCode] || excelCode;

    let univRecords = dbByCode.get(mappedCode);
    let matchMethod = 'code';

    if (!univRecords || univRecords.length === 0) {
      const normalizedName = normalizeUnivName(excelUnivName);
      univRecords = dbByName.get(normalizedName);
      matchMethod = 'name';

      if (!univRecords || univRecords.length === 0) {
        noUnivCount++;
        continue;
      }
    }

    const availableRecords = univRecords.filter(r => !usedRecords.has(r.prev_result_id));
    if (availableRecords.length === 0) continue;

    const { match } = findBestRecruitMatch(excelRecruitName, availableRecords);

    if (match) {
      await updateRecord(match.prev_result_id, row);
      usedRecords.add(match.prev_result_id);

      if (matchMethod === 'code') {
        codeMatchCount++;
      } else {
        nameMatchCount++;
      }
    } else {
      noRecruitCount++;
    }
  }

  // 결과 출력
  console.log('=== 최종 결과 ===');
  console.log(`총 엑셀 데이터: ${excelData.length}개`);
  console.log(`코드 매칭 성공: ${codeMatchCount}개`);
  console.log(`이름 매칭 성공: ${nameMatchCount}개`);
  console.log(`총 업데이트: ${codeMatchCount + nameMatchCount}개`);
  console.log(`대학 없음: ${noUnivCount}개`);
  console.log(`모집단위 매칭 실패: ${noRecruitCount}개`);

  // 검증
  const verifyResult = await dataSource.query(`
    SELECT COUNT(*) as count
    FROM ts_regular_admission_previous_results
    WHERE year = 2024 AND percentile_70 IS NOT NULL
  `);
  console.log(`\n검증: percentile_70이 있는 2024년 레코드: ${verifyResult[0].count}개`);

  await dataSource.destroy();
  console.log('\n완료!');
}

async function updateRecord(prevResultId, row) {
  const recruitmentNumber = row['모집인원(최종)'] ? parseInt(row['모집인원(최종)']) : null;
  const competitionRatio = row['경쟁률'] ? parseFloat(row['경쟁률']) : null;
  const additionalPassRank = row['충원합격순위'] ? parseInt(row['충원합격순위']) : null;
  const maxCut = row['환산점수 70%컷'] ? parseFloat(row['환산점수 70%컷']) : null;
  const convertedScoreTotal = row['총점(수능)'] ? parseFloat(row['총점(수능)']) : null;
  const percentile70 = row['백분위70%컷'] ? parseFloat(row['백분위70%컷']) : null;

  await dataSource.query(`
    UPDATE ts_regular_admission_previous_results
    SET
      recruitment_number = $1,
      competition_ratio = $2,
      additional_pass_rank = $3,
      max_cut = $4,
      converted_score_total = $5,
      percentile_70 = $6
    WHERE id = $7
  `, [
    recruitmentNumber,
    competitionRatio,
    additionalPassRank,
    maxCut,
    convertedScoreTotal,
    percentile70,
    prevResultId
  ]);
}

main().catch(console.error);
