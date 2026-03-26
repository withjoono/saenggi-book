/**
 * 2025년 정시 입결 데이터 업데이트 스크립트 v5
 * 1차: 정확한 매칭
 * 2차: 포함 관계 매칭만 (유사도 매칭 제외 - 오류 방지)
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
    .replace(/대학교$/, '대')
    .replace(/\s+/g, '')
    .toLowerCase();
}

// 모집단위명 정규화 함수
function normalizeRecruitName(name) {
  if (!name) return '';
  return name
    .replace(/[·\-\s()（）\[\]]/g, '')  // 특수문자, 괄호 제거
    .toLowerCase();
}

// 포함 관계 확인 및 점수 계산
function checkContainedMatch(excelName, dbName) {
  const normalizedExcel = normalizeRecruitName(excelName);
  const normalizedDb = normalizeRecruitName(dbName);

  // 정확히 일치
  if (normalizedExcel === normalizedDb) {
    return { match: true, score: 1.0, reason: 'exact' };
  }

  // 학과/학부/전공 접미사만 다른 경우
  const suffixes = ['학과', '학부', '전공', '계열'];
  let baseExcel = normalizedExcel;
  let baseDb = normalizedDb;

  for (const suffix of suffixes) {
    if (baseExcel.endsWith(suffix)) {
      baseExcel = baseExcel.slice(0, -suffix.length);
    }
    if (baseDb.endsWith(suffix)) {
      baseDb = baseDb.slice(0, -suffix.length);
    }
  }

  // 접미사 제거 후 일치하고, 최소 길이가 2글자 이상
  if (baseExcel === baseDb && baseExcel.length >= 2) {
    return { match: true, score: 0.95, reason: 'suffix_diff' };
  }

  // 한쪽이 다른쪽을 완전히 포함하고, 포함되는 쪽이 충분히 긴 경우 (4글자 이상)
  if (normalizedExcel.length >= 4 && normalizedDb.length >= 4) {
    if (normalizedExcel.includes(normalizedDb) && normalizedDb.length >= 4) {
      return { match: true, score: 0.9, reason: 'db_in_excel' };
    }
    if (normalizedDb.includes(normalizedExcel) && normalizedExcel.length >= 4) {
      return { match: true, score: 0.9, reason: 'excel_in_db' };
    }
  }

  // 전공 표기 방식 차이 (괄호 안 전공명)
  // 예: "건축학부(건축공학전공)" vs "건축학부(건축공학)"
  const excelBase = normalizedExcel.replace(/전공$/, '');
  const dbBase = normalizedDb.replace(/전공$/, '');
  if (excelBase === dbBase && excelBase.length >= 4) {
    return { match: true, score: 0.95, reason: 'major_notation' };
  }

  return { match: false, score: 0, reason: 'no_match' };
}

// 가장 적합한 매칭 찾기
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

  // 0. 먼저 모든 2025년 레코드를 리셋
  console.log('2025년 입결 데이터 리셋 중...');
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
    WHERE year = 2025
  `);
  console.log('리셋 완료\n');

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

  const fuzzyMatchList = [];
  const noMatchList = [];

  for (const row of excelData) {
    const excelUnivName = row['대학명'] || '';
    const excelRecruitName = row['모집단위'] || '';
    const normalizedUnivName = normalizeUnivName(excelUnivName);

    // 대학이 DB에 있는지 확인
    const univRecords = dbByUniv.get(normalizedUnivName);
    if (!univRecords || univRecords.length === 0) {
      noUnivCount++;
      continue;
    }

    // 아직 사용되지 않은 레코드 중에서 찾기
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
        if (fuzzyMatchList.length < 100) {
          fuzzyMatchList.push({
            excelUniv: excelUnivName,
            excelRecruit: excelRecruitName,
            dbRecruit: match.recruitment_name,
            score: score.toFixed(3),
            reason: reason
          });
        }
      }
    } else {
      noMatchCount++;
      if (noMatchList.length < 50) {
        noMatchList.push({
          univ: excelUnivName,
          recruit: excelRecruitName
        });
      }
    }
  }

  // 결과 출력
  console.log('=== 최종 결과 ===');
  console.log(`총 엑셀 데이터: ${excelData.length}개`);
  console.log(`1차 정확한 매칭: ${exactMatchCount}개`);
  console.log(`2차 유사 매칭 (포함 관계): ${fuzzyMatchCount}개`);
  console.log(`총 업데이트: ${exactMatchCount + fuzzyMatchCount}개`);
  console.log(`대학 없음: ${noUnivCount}개`);
  console.log(`매칭 실패: ${noMatchCount}개`);

  if (fuzzyMatchList.length > 0) {
    console.log('\n=== 유사 매칭 목록 ===');
    fuzzyMatchList.forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.excelUniv}] "${item.excelRecruit}" → "${item.dbRecruit}" (${item.reason})`);
    });
  }

  if (noMatchList.length > 0) {
    console.log('\n=== 매칭 실패 샘플 (최대 50개) ===');
    noMatchList.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.univ} - ${item.recruit}`);
    });
  }

  // 검증
  const verifyResult = await dataSource.query(`
    SELECT COUNT(*) as count
    FROM ts_regular_admission_previous_results
    WHERE year = 2025 AND percentile_50 IS NOT NULL
  `);
  console.log(`\n검증: percentile_50이 있는 2025년 레코드: ${verifyResult[0].count}개`);

  await dataSource.destroy();
  console.log('\n완료!');
}

async function updateRecord(prevResultId, row) {
  const recruitmentNumber = row['모집인원(최종)'] ? parseInt(row['모집인원(최종)']) : null;
  const competitionRatio = row['경쟁률'] ? parseFloat(row['경쟁률']) : null;
  const additionalPassRank = row['충원합격순위'] ? parseInt(row['충원합격순위']) : null;
  const minCut = row['환산점수 50%컷'] ? parseFloat(row['환산점수 50%컷']) : null;
  const maxCut = row['환산점수 70%컷'] ? parseFloat(row['환산점수 70%컷']) : null;
  const convertedScoreTotal = row['총점(수능)'] ? parseFloat(row['총점(수능)']) : null;
  const percentile50 = row['백분위50%컷'] ? parseFloat(row['백분위50%컷']) : null;
  const percentile70 = row['백분위70%컷'] ? parseFloat(row['백분위70%컷']) : null;

  await dataSource.query(`
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
    prevResultId
  ]);
}

main().catch(console.error);
