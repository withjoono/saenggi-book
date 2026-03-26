/**
 * 2025년 정시 입결 데이터 업데이트 스크립트 (코드 기반 매칭)
 * 1차: 대학 코드로 매칭
 * 2차: 대학명 정규화로 매칭 (불일치 대학)
 * 3차: 모집단위명 매칭
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
  // 엑셀에는 있지만 DB 코드가 다른 경우 (검증된 매핑)
  'U504': 'U308',  // 강원대학교 -> 강원대(춘천) ✓ 경영회계학부, 토목공학과 등 일치
  'U535': 'U512',  // 동양대학교 -> 동양대
  'U120': 'U517',  // 세한대학교 -> 세한대
  'U143': 'U520',  // 영산대학교 -> 영산대
  'U183': 'U527',  // 청운대학교 -> 청운대
};

// 대학명 정규화 함수
function normalizeUnivName(name) {
  if (!name) return '';
  return name
    .replace(/대학교$/, '대')
    .replace(/\s+/g, '')
    .replace(/\(.*\)/, '') // 괄호 제거
    .toLowerCase();
}

// 모집단위명 정규화 함수
function normalizeRecruitName(name) {
  if (!name) return '';
  return name
    .replace(/[·\-\s()（）\[\]]/g, '')
    .toLowerCase();
}

// 모집단위 매칭 함수
function findBestRecruitMatch(excelRecruit, dbRecords) {
  const normalizedExcel = normalizeRecruitName(excelRecruit);

  // 1. 정확한 매칭
  for (const record of dbRecords) {
    if (normalizeRecruitName(record.recruitment_name) === normalizedExcel) {
      return { match: record, score: 1.0, reason: 'exact' };
    }
  }

  // 2. 학과/학부/전공 접미사 제거 후 매칭
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

  // 3. 포함 관계 매칭 (4글자 이상)
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

  // 1. 엑셀 파일 읽기
  console.log('엑셀 파일 읽는 중...');
  const workbook = XLSX.readFile('uploads/2025정시-실제컷-정리.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet);
  console.log(`엑셀 데이터: ${excelData.length}개 행\n`);

  // 2. DB에서 2025년 입결 데이터 조회
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

  // 3. DB 데이터를 대학 코드별로 그룹화
  const dbByCode = new Map();
  const dbByName = new Map();

  for (const record of dbRecords) {
    // 코드별 그룹화
    if (!dbByCode.has(record.univ_code)) {
      dbByCode.set(record.univ_code, []);
    }
    dbByCode.get(record.univ_code).push(record);

    // 정규화된 이름별 그룹화
    const normalizedName = normalizeUnivName(record.univ_name);
    if (!dbByName.has(normalizedName)) {
      dbByName.set(normalizedName, []);
    }
    dbByName.get(normalizedName).push(record);
  }

  console.log(`DB 대학 코드 수: ${dbByCode.size}개`);
  console.log(`DB 대학명(정규화) 수: ${dbByName.size}개\n`);

  // 4. 매칭 및 업데이트
  const usedRecords = new Set();
  let codeMatchCount = 0;
  let nameMatchCount = 0;
  let noUnivCount = 0;
  let noRecruitCount = 0;

  const matchLog = [];
  const noMatchLog = [];

  for (const row of excelData) {
    const excelCode = row['대학코드'] || '';
    const excelUnivName = row['대학명'] || '';
    const excelRecruitName = row['모집단위'] || '';

    // 코드 매핑 적용
    const mappedCode = CODE_MAPPING[excelCode] || excelCode;

    // 1차: 코드로 매칭
    let univRecords = dbByCode.get(mappedCode);
    let matchMethod = 'code';

    // 2차: 코드 매칭 실패 시 이름으로 매칭
    if (!univRecords || univRecords.length === 0) {
      const normalizedName = normalizeUnivName(excelUnivName);
      univRecords = dbByName.get(normalizedName);
      matchMethod = 'name';

      if (!univRecords || univRecords.length === 0) {
        noUnivCount++;
        if (noMatchLog.length < 30) {
          noMatchLog.push({ type: 'univ', code: excelCode, name: excelUnivName, recruit: excelRecruitName });
        }
        continue;
      }
    }

    // 사용되지 않은 레코드 필터링
    const availableRecords = univRecords.filter(r => !usedRecords.has(r.prev_result_id));
    if (availableRecords.length === 0) continue;

    // 3차: 모집단위 매칭
    const { match, score, reason } = findBestRecruitMatch(excelRecruitName, availableRecords);

    if (match) {
      await updateRecord(match.prev_result_id, row);
      usedRecords.add(match.prev_result_id);

      if (matchMethod === 'code') {
        codeMatchCount++;
      } else {
        nameMatchCount++;
      }

      if (score < 1.0 && matchLog.length < 50) {
        matchLog.push({
          excelUniv: excelUnivName,
          excelRecruit: excelRecruitName,
          dbRecruit: match.recruitment_name,
          method: matchMethod,
          score: score.toFixed(2),
          reason
        });
      }
    } else {
      noRecruitCount++;
      if (noMatchLog.length < 30) {
        noMatchLog.push({ type: 'recruit', code: excelCode, name: excelUnivName, recruit: excelRecruitName });
      }
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

  if (matchLog.length > 0) {
    console.log('\n=== 유사 매칭 목록 (점수 < 1.0) ===');
    matchLog.forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.excelUniv}] "${item.excelRecruit}" -> "${item.dbRecruit}" (${item.method}, ${item.reason})`);
    });
  }

  if (noMatchLog.length > 0) {
    console.log('\n=== 매칭 실패 목록 ===');
    noMatchLog.forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.type}] ${item.code} ${item.name} - ${item.recruit}`);
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
