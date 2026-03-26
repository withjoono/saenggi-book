/**
 * 2024년 정시 입결 데이터 업데이트 스크립트
 * 1차: 정확한 매칭
 * 2차: 포함 관계 매칭
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
    .replace(/^국립/, '')  // "국립강릉원주대학교" -> "강릉원주대학교"
    .replace(/대학교$/, '대')
    .replace(/\s+/g, '')
    .toLowerCase();
}

// 모집단위명 정규화 함수
function normalizeRecruitName(name) {
  if (!name) return '';
  return name
    .replace(/[·\-\s()（）\[\]]/g, '')
    .toLowerCase();
}

// 포함 관계 확인
function checkContainedMatch(excelName, dbName) {
  const normalizedExcel = normalizeRecruitName(excelName);
  const normalizedDb = normalizeRecruitName(dbName);

  if (normalizedExcel === normalizedDb) {
    return { match: true, score: 1.0, reason: '정확히 일치' };
  }

  const suffixes = ['학과', '학부', '전공', '계열'];
  let baseExcel = normalizedExcel;
  let baseDb = normalizedDb;

  for (const suffix of suffixes) {
    if (baseExcel.endsWith(suffix)) baseExcel = baseExcel.slice(0, -suffix.length);
    if (baseDb.endsWith(suffix)) baseDb = baseDb.slice(0, -suffix.length);
  }

  if (baseExcel === baseDb && baseExcel.length >= 2) {
    return { match: true, score: 0.95, reason: '학과/학부/전공 차이' };
  }

  if (normalizedExcel.length >= 4 && normalizedDb.length >= 4) {
    if (normalizedExcel.includes(normalizedDb) && normalizedDb.length >= 4) {
      return { match: true, score: 0.9, reason: 'DB가 엑셀에 포함' };
    }
    if (normalizedDb.includes(normalizedExcel) && normalizedExcel.length >= 4) {
      return { match: true, score: 0.9, reason: '엑셀이 DB에 포함' };
    }
  }

  const excelBase = normalizedExcel.replace(/전공$/, '');
  const dbBase = normalizedDb.replace(/전공$/, '');
  if (excelBase === dbBase && excelBase.length >= 4) {
    return { match: true, score: 0.95, reason: '전공 표기 차이' };
  }

  return { match: false, score: 0, reason: '' };
}

function findBestMatch(targetName, candidates) {
  let bestMatch = null;
  let bestScore = 0;
  let bestReason = '';

  for (const candidate of candidates) {
    const { match, score, reason } = checkContainedMatch(targetName, candidate.recruitment_name);
    if (match && score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
      bestReason = reason;
    }
  }

  return { match: bestMatch, score: bestScore, reason: bestReason };
}

async function main() {
  console.log('DB 연결 중...');
  await dataSource.initialize();
  console.log('DB 연결 완료\n');

  // 0. 2024년 레코드 리셋
  console.log('2024년 입결 데이터 리셋 중...');
  await dataSource.query(`
    UPDATE ts_regular_admission_previous_results
    SET
      recruitment_number = NULL,
      competition_ratio = NULL,
      additional_pass_rank = NULL,
      min_cut = NULL,
      max_cut = NULL,
      converted_score_total = NULL,
      percentile_50 = NULL,
      percentile_70 = NULL
    WHERE year = 2024
  `);
  console.log('리셋 완료\n');

  // 1. 엑셀 파일 읽기
  console.log('엑셀 파일 읽는 중...');
  const workbook = XLSX.readFile('uploads/2024정시-실제컷-정리.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet);
  console.log(`엑셀 데이터: ${excelData.length}개 행\n`);

  // 2. DB에서 2024년 입결 데이터 조회
  console.log('DB에서 2024년 입결 데이터 조회 중...');
  const dbRecords = await dataSource.query(`
    SELECT
      pr.id as prev_result_id,
      ra.recruitment_name,
      u.name as univ_name
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.year = 2024
  `);
  console.log(`DB 2024년 입결 레코드: ${dbRecords.length}개\n`);

  // 3. 대학별로 그룹화
  const dbByUniv = new Map();
  const usedRecords = new Set();

  for (const record of dbRecords) {
    const normalizedUnivName = normalizeUnivName(record.univ_name);
    if (!dbByUniv.has(normalizedUnivName)) {
      dbByUniv.set(normalizedUnivName, []);
    }
    dbByUniv.get(normalizedUnivName).push(record);
  }

  console.log(`DB 대학 수: ${dbByUniv.size}개\n`);

  // 4. 매칭 및 업데이트
  let exactMatchCount = 0;
  let fuzzyMatchCount = 0;
  let noUnivCount = 0;
  let noMatchCount = 0;

  for (const row of excelData) {
    const excelUnivName = row['대학명'] || '';
    const excelRecruitName = row['모집단위'] || '';
    const normalizedUnivName = normalizeUnivName(excelUnivName);

    const univRecords = dbByUniv.get(normalizedUnivName);
    if (!univRecords || univRecords.length === 0) {
      noUnivCount++;
      continue;
    }

    const availableRecords = univRecords.filter(r => !usedRecords.has(r.prev_result_id));
    if (availableRecords.length === 0) {
      continue;
    }

    const { match, score, reason } = findBestMatch(excelRecruitName, availableRecords);

    if (match) {
      await updateRecord(match.prev_result_id, row);
      usedRecords.add(match.prev_result_id);

      if (score === 1.0) {
        exactMatchCount++;
      } else {
        fuzzyMatchCount++;
      }
    } else {
      noMatchCount++;
    }
  }

  // 결과 출력
  console.log('=== 최종 결과 ===');
  console.log(`총 엑셀 데이터: ${excelData.length}개`);
  console.log(`1차 정확한 매칭: ${exactMatchCount}개`);
  console.log(`2차 유사 매칭: ${fuzzyMatchCount}개`);
  console.log(`총 업데이트: ${exactMatchCount + fuzzyMatchCount}개`);
  console.log(`대학 없음: ${noUnivCount}개`);
  console.log(`매칭 실패: ${noMatchCount}개`);

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
  // 2024년 엑셀은 50%컷이 없고 70%컷만 있음
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
