/**
 * 2025년 정시 입결 데이터 업데이트 스크립트 v3
 * 2차 작업: 대학만 맞으면 가장 유사한 학과로 매핑
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
    .replace(/[·\-\s()（）]/g, '')
    .toLowerCase();
}

// 문자열 유사도 계산 (Levenshtein Distance 기반)
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// 유사도 점수 (0~1, 1이 완전 일치)
function similarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

// 가장 유사한 학과 찾기
function findMostSimilar(targetName, candidates) {
  let bestMatch = null;
  let bestScore = 0;

  const normalizedTarget = normalizeRecruitName(targetName);

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeRecruitName(candidate.recruitment_name);
    const score = similarity(normalizedTarget, normalizedCandidate);

    // 포함 관계 보너스
    let bonus = 0;
    if (normalizedTarget.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedTarget)) {
      bonus = 0.2;
    }

    const finalScore = score + bonus;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMatch = candidate;
    }
  }

  return { match: bestMatch, score: bestScore };
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
      pr.percentile_50,
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
  const dbByUniv = new Map(); // 정규화된 대학명 -> 레코드 배열
  const exactMap = new Map(); // 정확한 매칭용

  for (const record of dbRecords) {
    const normalizedUnivName = normalizeUnivName(record.univ_name);
    const normalizedRecruitName = normalizeRecruitName(record.recruitment_name);

    // 정확한 매칭 맵
    const exactKey = `${normalizedUnivName}|${normalizedRecruitName}`;
    exactMap.set(exactKey, record);

    // 대학별 그룹화
    if (!dbByUniv.has(normalizedUnivName)) {
      dbByUniv.set(normalizedUnivName, []);
    }
    dbByUniv.get(normalizedUnivName).push(record);
  }

  console.log(`DB 대학 수: ${dbByUniv.size}개\n`);

  // 4. 엑셀 데이터 처리
  let exactMatchCount = 0;
  let fuzzyMatchCount = 0;
  let noUnivCount = 0;
  let alreadyUpdatedCount = 0;
  let updateCount = 0;

  const fuzzyMatchList = [];
  const noUnivList = [];

  for (const row of excelData) {
    const excelUnivName = row['대학명'] || '';
    const excelRecruitName = row['모집단위'] || '';
    const normalizedUnivName = normalizeUnivName(excelUnivName);
    const normalizedRecruitName = normalizeRecruitName(excelRecruitName);
    const exactKey = `${normalizedUnivName}|${normalizedRecruitName}`;

    // 1차: 정확한 매칭 시도
    const exactRecord = exactMap.get(exactKey);
    if (exactRecord) {
      exactMatchCount++;

      // 이미 업데이트된 레코드인지 확인
      if (exactRecord.percentile_50 !== null) {
        alreadyUpdatedCount++;
        continue;
      }

      // 업데이트 실행
      await updateRecord(exactRecord.prev_result_id, row);
      updateCount++;
      continue;
    }

    // 2차: 대학이 있으면 유사 학과 매칭
    const univRecords = dbByUniv.get(normalizedUnivName);
    if (!univRecords || univRecords.length === 0) {
      noUnivCount++;
      if (noUnivList.length < 20) {
        noUnivList.push({ univ: excelUnivName, recruit: excelRecruitName });
      }
      continue;
    }

    // 아직 업데이트 안된 레코드 중에서 가장 유사한 것 찾기
    const notUpdatedRecords = univRecords.filter(r => r.percentile_50 === null);
    if (notUpdatedRecords.length === 0) {
      // 이 대학의 모든 레코드가 이미 업데이트됨
      continue;
    }

    const { match, score } = findMostSimilar(excelRecruitName, notUpdatedRecords);

    // 유사도 임계값 (0.4 이상이면 매칭)
    if (match && score >= 0.4) {
      fuzzyMatchCount++;

      if (fuzzyMatchList.length < 50) {
        fuzzyMatchList.push({
          excelUniv: excelUnivName,
          excelRecruit: excelRecruitName,
          dbRecruit: match.recruitment_name,
          score: score.toFixed(3)
        });
      }

      await updateRecord(match.prev_result_id, row);
      updateCount++;

      // 해당 레코드를 업데이트된 것으로 표시
      match.percentile_50 = 'updated';
    }
  }

  console.log('=== 결과 ===');
  console.log(`총 엑셀 데이터: ${excelData.length}개`);
  console.log(`1차 정확한 매칭: ${exactMatchCount}개 (이미 업데이트: ${alreadyUpdatedCount}개)`);
  console.log(`2차 유사 매칭: ${fuzzyMatchCount}개`);
  console.log(`대학 없음: ${noUnivCount}개`);
  console.log(`실제 업데이트: ${updateCount}개`);

  if (fuzzyMatchList.length > 0) {
    console.log('\n=== 유사 매칭 샘플 (최대 50개) ===');
    fuzzyMatchList.forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.excelUniv}] "${item.excelRecruit}" → "${item.dbRecruit}" (유사도: ${item.score})`);
    });
  }

  if (noUnivList.length > 0) {
    console.log('\n=== DB에 없는 대학 샘플 (최대 20개) ===');
    noUnivList.forEach((item, i) => {
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
