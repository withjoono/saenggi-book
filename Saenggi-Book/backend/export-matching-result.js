/**
 * 매칭 결과를 엑셀 파일로 내보내기
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
    .replace(/[·\-\s()（）\[\]]/g, '')
    .toLowerCase();
}

// 포함 관계 확인 및 점수 계산
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

  // 엑셀 파일 읽기
  console.log('엑셀 파일 읽는 중...');
  const workbook = XLSX.readFile('uploads/2025정시-실제컷-정리.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet);
  console.log(`엑셀 데이터: ${excelData.length}개 행\n`);

  // DB 데이터 조회
  console.log('DB에서 2025년 입결 데이터 조회 중...');
  const dbRecords = await dataSource.query(`
    SELECT
      pr.id as prev_result_id,
      ra.recruitment_name,
      u.name as univ_name
    FROM ts_regular_admission_previous_results pr
    JOIN ts_regular_admissions ra ON pr.regular_admission_id = ra.id
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE pr.year = 2025
  `);
  console.log(`DB 2025년 입결 레코드: ${dbRecords.length}개\n`);

  // 대학별로 그룹화
  const dbByUniv = new Map();
  const usedRecords = new Set();

  for (const record of dbRecords) {
    const normalizedUnivName = normalizeUnivName(record.univ_name);
    if (!dbByUniv.has(normalizedUnivName)) {
      dbByUniv.set(normalizedUnivName, []);
    }
    dbByUniv.get(normalizedUnivName).push(record);
  }

  // 결과 저장용 배열
  const matchedList = [];
  const unmatchedList = [];

  for (const row of excelData) {
    const excelUnivName = row['대학명'] || '';
    const excelRecruitName = row['모집단위'] || '';
    const normalizedUnivName = normalizeUnivName(excelUnivName);

    const univRecords = dbByUniv.get(normalizedUnivName);

    if (!univRecords || univRecords.length === 0) {
      unmatchedList.push({
        '엑셀_대학명': excelUnivName,
        '엑셀_모집단위': excelRecruitName,
        '실패_이유': 'DB에 대학 없음',
        'DB_대학명': '',
        'DB_모집단위': ''
      });
      continue;
    }

    const availableRecords = univRecords.filter(r => !usedRecords.has(r.prev_result_id));
    if (availableRecords.length === 0) {
      unmatchedList.push({
        '엑셀_대학명': excelUnivName,
        '엑셀_모집단위': excelRecruitName,
        '실패_이유': '해당 대학의 모든 학과가 이미 매칭됨',
        'DB_대학명': univRecords[0]?.univ_name || '',
        'DB_모집단위': ''
      });
      continue;
    }

    const { match, score, reason } = findBestMatch(excelRecruitName, availableRecords);

    if (match) {
      usedRecords.add(match.prev_result_id);
      matchedList.push({
        '엑셀_대학명': excelUnivName,
        '엑셀_모집단위': excelRecruitName,
        'DB_대학명': match.univ_name,
        'DB_모집단위': match.recruitment_name,
        '매칭_유형': reason,
        '유사도': score.toFixed(2)
      });
    } else {
      unmatchedList.push({
        '엑셀_대학명': excelUnivName,
        '엑셀_모집단위': excelRecruitName,
        '실패_이유': '유사한 학과 없음',
        'DB_대학명': availableRecords[0]?.univ_name || '',
        'DB_모집단위': availableRecords.map(r => r.recruitment_name).slice(0, 5).join(', ') + (availableRecords.length > 5 ? '...' : '')
      });
    }
  }

  console.log(`매칭 성공: ${matchedList.length}개`);
  console.log(`매칭 실패: ${unmatchedList.length}개\n`);

  // 엑셀 파일 생성
  const wb = XLSX.utils.book_new();

  // 매칭 성공 시트
  const matchedSheet = XLSX.utils.json_to_sheet(matchedList);
  XLSX.utils.book_append_sheet(wb, matchedSheet, '매칭성공');

  // 매칭 실패 시트
  const unmatchedSheet = XLSX.utils.json_to_sheet(unmatchedList);
  XLSX.utils.book_append_sheet(wb, unmatchedSheet, '매칭실패');

  // 파일 저장
  const filename = `matching-result-${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, filename);
  console.log(`엑셀 파일 저장 완료: ${filename}`);

  await dataSource.destroy();
  console.log('\n완료!');
}

main().catch(console.error);
