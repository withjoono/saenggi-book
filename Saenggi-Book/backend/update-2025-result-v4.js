/**
 * 2025년 정시 입결 데이터 업데이트 스크립트 v4
 * 1차: 정확한 매칭
 * 2차: 유사 매칭 (엄격한 기준 - 유사도 0.7 이상 또는 포함 관계)
 *
 * 먼저 모든 2025년 레코드를 null로 리셋하고 다시 시작
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

// 포함 관계 확인 (학부/학과 차이 등)
function isContained(str1, str2) {
  // "컴퓨터공학과" ↔ "컴퓨터공학부" 같은 경우
  const base1 = str1.replace(/학과$|학부$|전공$/, '');
  const base2 = str2.replace(/학과$|학부$|전공$/, '');

  if (base1 === base2 && base1.length >= 2) {
    return true;
  }

  // 한쪽이 다른쪽을 포함하고, 길이 차이가 2 이하인 경우
  if ((str1.includes(str2) || str2.includes(str1)) &&
      Math.abs(str1.length - str2.length) <= 2) {
    return true;
  }

  return false;
}

// 가장 유사한 학과 찾기 (엄격한 기준)
function findMostSimilar(targetName, candidates) {
  let bestMatch = null;
  let bestScore = 0;
  let matchReason = '';

  const normalizedTarget = normalizeRecruitName(targetName);

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeRecruitName(candidate.recruitment_name);

    // 1. 정확히 일치하면 바로 반환
    if (normalizedTarget === normalizedCandidate) {
      return { match: candidate, score: 1.0, reason: 'exact' };
    }

    // 2. 포함 관계 확인
    if (isContained(normalizedTarget, normalizedCandidate)) {
      return { match: candidate, score: 0.95, reason: 'contained' };
    }

    // 3. 유사도 계산
    const score = similarity(normalizedTarget, normalizedCandidate);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
      matchReason = 'similarity';
    }
  }

  // 유사도 0.7 이상만 반환
  if (bestScore >= 0.7) {
    return { match: bestMatch, score: bestScore, reason: matchReason };
  }

  return { match: null, score: 0, reason: 'no_match' };
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
  const exactMap = new Map();
  const usedRecords = new Set(); // 이미 매칭된 레코드 추적

  for (const record of dbRecords) {
    const normalizedUnivName = normalizeUnivName(record.univ_name);
    const normalizedRecruitName = normalizeRecruitName(record.recruitment_name);

    const exactKey = `${normalizedUnivName}|${normalizedRecruitName}`;
    exactMap.set(exactKey, record);

    if (!dbByUniv.has(normalizedUnivName)) {
      dbByUniv.set(normalizedUnivName, []);
    }
    dbByUniv.get(normalizedUnivName).push(record);
  }

  console.log(`DB 대학 수: ${dbByUniv.size}개\n`);

  // 4. 1차: 정확한 매칭
  console.log('=== 1차: 정확한 매칭 ===');
  let exactMatchCount = 0;

  for (const row of excelData) {
    const normalizedUnivName = normalizeUnivName(row['대학명'] || '');
    const normalizedRecruitName = normalizeRecruitName(row['모집단위'] || '');
    const exactKey = `${normalizedUnivName}|${normalizedRecruitName}`;

    const exactRecord = exactMap.get(exactKey);
    if (exactRecord && !usedRecords.has(exactRecord.prev_result_id)) {
      await updateRecord(exactRecord.prev_result_id, row);
      usedRecords.add(exactRecord.prev_result_id);
      exactMatchCount++;
    }
  }
  console.log(`1차 정확한 매칭 완료: ${exactMatchCount}개\n`);

  // 5. 2차: 유사 매칭 (엄격한 기준)
  console.log('=== 2차: 유사 매칭 (유사도 0.7 이상 또는 포함 관계) ===');
  let fuzzyMatchCount = 0;
  let noUnivCount = 0;
  let noMatchCount = 0;

  const fuzzyMatchList = [];
  const noMatchList = [];

  for (const row of excelData) {
    const excelUnivName = row['대학명'] || '';
    const excelRecruitName = row['모집단위'] || '';
    const normalizedUnivName = normalizeUnivName(excelUnivName);
    const normalizedRecruitName = normalizeRecruitName(excelRecruitName);
    const exactKey = `${normalizedUnivName}|${normalizedRecruitName}`;

    // 이미 정확히 매칭된 것은 스킵
    const exactRecord = exactMap.get(exactKey);
    if (exactRecord && usedRecords.has(exactRecord.prev_result_id)) {
      continue;
    }

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

    const { match, score, reason } = findMostSimilar(excelRecruitName, availableRecords);

    if (match) {
      await updateRecord(match.prev_result_id, row);
      usedRecords.add(match.prev_result_id);
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
    } else {
      noMatchCount++;
      if (noMatchList.length < 30) {
        noMatchList.push({
          univ: excelUnivName,
          recruit: excelRecruitName
        });
      }
    }
  }

  console.log(`2차 유사 매칭 완료: ${fuzzyMatchCount}개`);
  console.log(`대학 없음: ${noUnivCount}개`);
  console.log(`매칭 실패: ${noMatchCount}개\n`);

  // 결과 출력
  console.log('=== 최종 결과 ===');
  console.log(`총 엑셀 데이터: ${excelData.length}개`);
  console.log(`1차 정확한 매칭: ${exactMatchCount}개`);
  console.log(`2차 유사 매칭: ${fuzzyMatchCount}개`);
  console.log(`총 업데이트: ${exactMatchCount + fuzzyMatchCount}개`);

  if (fuzzyMatchList.length > 0) {
    console.log('\n=== 유사 매칭 목록 ===');
    fuzzyMatchList.forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.excelUniv}] "${item.excelRecruit}" → "${item.dbRecruit}" (${item.reason}, ${item.score})`);
    });
  }

  if (noMatchList.length > 0) {
    console.log('\n=== 매칭 실패 샘플 (최대 30개) ===');
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
