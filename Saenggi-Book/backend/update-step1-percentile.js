/**
 * 가나다 백분위.xlsx 데이터로 ts_regular_admissions 테이블 업데이트
 *
 * 사용법:
 * 1. yarn start:dev 로 서버 실행 (DB 연결 확인)
 * 2. node update-step1-percentile.js
 */

const XLSX = require('xlsx');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function main() {
  // Excel 파일 읽기
  const workbook = XLSX.readFile('uploads/가나다 백분위.xlsx');
  const sheet = workbook.Sheets['Sheet1'];
  const excelData = XLSX.utils.sheet_to_json(sheet);

  console.log(`총 ${excelData.length}개 행 로드됨`);

  // PostgreSQL 연결
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  await client.connect();
  console.log('DB 연결 성공');

  // 대학명 매핑 (Excel → DB)
  const universityNameMap = {
    '강원대학교(원주)': '강원대학교(강릉)',  // 원주캠퍼스는 강릉캠퍼스로 매핑
  };

  // 통계
  const stats = {
    updated: 0,
    notFound: 0,
    errors: [],
    notFoundList: []
  };

  // 기존 데이터 조회 (대학명, 모집단위명, 모집군, 전형명으로 인덱싱)
  const existingQuery = `
    SELECT ra.id, u.name as university_name, ra.recruitment_name, ra.admission_type, ra.general_field_name, ra.admission_name
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE ra.year = 2026
  `;
  const existingResult = await client.query(existingQuery);
  console.log(`DB에서 ${existingResult.rows.length}개 정시 모집단위 조회됨`);

  // 인덱스 생성 (대학명 + 모집단위명 + 모집군 + 전형명)
  const dbIndex = new Map();
  existingResult.rows.forEach(row => {
    // 정확한 매칭용 키 (전형명 포함)
    const exactKeyWithAdmission = `${row.university_name}|${row.recruitment_name}|${row.admission_type}|${row.admission_name}`;
    dbIndex.set(exactKeyWithAdmission, row);

    // 정확한 매칭용 키 (전형명 없이)
    const exactKey = `${row.university_name}|${row.recruitment_name}|${row.admission_type}`;
    if (!dbIndex.has(exactKey)) {
      dbIndex.set(exactKey, row);
    }

    // 대학명 + 모집단위명 키 (모집군 없이)
    const partialKey = `${row.university_name}|${row.recruitment_name}`;
    if (!dbIndex.has(partialKey)) {
      dbIndex.set(partialKey, []);
    }
    const list = dbIndex.get(partialKey);
    if (Array.isArray(list)) {
      list.push(row);
    }
  });

  // 전공명 정규화 함수
  function normalizeRecruitmentName(name) {
    // <백분위>, <표준점수>, [교과], 숫자 등 제거
    return name
      .replace(/<백분위>/g, '')
      .replace(/<표준점수>/g, '')
      .replace(/\[교과\]/g, '')
      .replace(/\d+$/, '')  // 끝에 붙은 숫자 제거
      .trim();
  }

  // [교과] 포함 여부 확인
  function isGyoGwaType(name) {
    return name.includes('[교과]');
  }

  // Excel 데이터로 업데이트
  for (const row of excelData) {
    let universityName = row['대학교'];
    const recruitmentName = row['전공'];
    const percentile = row['누백'];
    const admissionType = row['모집군'];
    const field = row['계열'];

    if (!universityName || !recruitmentName || percentile === undefined || !admissionType) {
      continue;
    }

    // 대학명 매핑 적용
    if (universityNameMap[universityName]) {
      universityName = universityNameMap[universityName];
    }

    const isGyoGwa = isGyoGwaType(recruitmentName);
    const normalizedName = normalizeRecruitmentName(recruitmentName);
    let dbRow = null;

    // 교과전형인 경우 admission_name으로 필터
    if (isGyoGwa) {
      // 고려대 교과우수전형 매칭
      const keyWithAdmission = `${universityName}|${normalizedName}|${admissionType}|교과우수전형`;
      dbRow = dbIndex.get(keyWithAdmission);
    }

    // 일반 매칭 시도
    if (!dbRow) {
      const exactKey = `${universityName}|${recruitmentName}|${admissionType}`;
      dbRow = dbIndex.get(exactKey);
    }

    // 정규화된 이름으로 시도
    if (!dbRow) {
      const exactKey = `${universityName}|${normalizedName}|${admissionType}`;
      dbRow = dbIndex.get(exactKey);
    }

    // 대학명 + 모집단위명으로 검색 후 모집군 필터
    if (!dbRow) {
      const partialKey = `${universityName}|${normalizedName}`;
      const candidates = dbIndex.get(partialKey);
      if (Array.isArray(candidates)) {
        if (isGyoGwa) {
          // 교과전형 우선 매칭
          dbRow = candidates.find(c => c.admission_type === admissionType && c.admission_name === '교과우수전형');
        }
        if (!dbRow) {
          // 일반전형 매칭
          dbRow = candidates.find(c => c.admission_type === admissionType && c.admission_name === '일반전형');
        }
        if (!dbRow) {
          // 아무거나 매칭
          dbRow = candidates.find(c => c.admission_type === admissionType);
        }
      }
    }

    if (dbRow) {
      // 업데이트 쿼리 실행
      try {
        await client.query(`
          UPDATE ts_regular_admissions
          SET initial_cumulative_percentile = $1,
              min_cut_percent = $1
          WHERE id = $2
        `, [percentile, dbRow.id]);
        stats.updated++;
      } catch (error) {
        stats.errors.push({ row, error: error.message });
      }
    } else {
      stats.notFound++;
      stats.notFoundList.push({
        university: universityName,
        recruitment: recruitmentName,
        admissionType,
        field
      });
    }
  }

  await client.end();

  // 결과 출력
  console.log('\n=== 업데이트 완료 ===');
  console.log(`업데이트 성공: ${stats.updated}개`);
  console.log(`매칭 실패: ${stats.notFound}개`);
  console.log(`오류: ${stats.errors.length}개`);

  if (stats.notFoundList.length > 0) {
    console.log('\n=== 매칭 실패 목록 (처음 20개) ===');
    stats.notFoundList.slice(0, 20).forEach(item => {
      console.log(`  ${item.admissionType}군 | ${item.university} | ${item.recruitment} | ${item.field}`);
    });

    // 모집군별 매칭 실패 통계
    const notFoundByType = { 가: 0, 나: 0, 다: 0 };
    stats.notFoundList.forEach(item => {
      notFoundByType[item.admissionType]++;
    });
    console.log('\n=== 모집군별 매칭 실패 ===');
    console.log(`  가군: ${notFoundByType['가']}개`);
    console.log(`  나군: ${notFoundByType['나']}개`);
    console.log(`  다군: ${notFoundByType['다']}개`);
  }

  // 매칭 실패 목록을 파일로 저장
  const fs = require('fs');
  fs.writeFileSync('uploads/percentile-not-matched.json', JSON.stringify(stats.notFoundList, null, 2), 'utf8');
  console.log('\n매칭 실패 목록 저장: uploads/percentile-not-matched.json');
}

main().catch(console.error);
