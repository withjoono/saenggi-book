/**
 * Cloud SQL 데이터 확인 스크립트
 *
 * 사용법:
 * 1. .env.production 파일에서 DB 연결 정보 확인
 * 2. node check-cloud-sql-data.js
 */

require('dotenv').config({ path: '.env.production' });
const { Client } = require('pg');

async function checkCloudSqlData() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Cloud SQL 연결 중...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);

    await client.connect();
    console.log('연결 성공!\n');

    // 1. ts_regular_admissions 테이블 샘플 데이터 확인
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    ts_regular_admissions 샘플 데이터                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const sampleQuery = `
      SELECT
        ra.id,
        u.code as university_code,
        u.name as university_name,
        ra.admission_name,
        ra.admission_type,
        ra.recruitment_name,
        ra.score_calculation,
        ra.total_score,
        ra.min_cut,
        ra.max_cut
      FROM ts_regular_admissions ra
      LEFT JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.year = 2026
      ORDER BY u.name
      LIMIT 10
    `;

    const sampleResult = await client.query(sampleQuery);
    console.log('처음 10개 레코드:');
    console.table(sampleResult.rows);

    // 2. 대학코드 형태 분석
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    대학코드 형태 분석                                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const codeAnalysisQuery = `
      SELECT
        code,
        name,
        COUNT(*) OVER() as total_universities
      FROM ts_universities
      ORDER BY code
      LIMIT 20
    `;

    const codeResult = await client.query(codeAnalysisQuery);
    console.log('대학 코드 샘플 (처음 20개):');
    console.table(codeResult.rows);

    // 3. 가천대학교 데이터 상세 확인
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    가천대학교 데이터 상세 확인                               ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const gachonQuery = `
      SELECT
        u.code as univ_code,
        u.name as univ_name,
        ra.admission_name,
        ra.recruitment_name,
        ra.score_calculation,
        ra.total_score,
        ra.min_cut,
        ra.max_cut,
        ra.korean_reflection_score,
        ra.math_reflection_score
      FROM ts_regular_admissions ra
      LEFT JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%가천%' AND ra.year = 2026
      LIMIT 5
    `;

    const gachonResult = await client.query(gachonQuery);
    console.log('가천대학교 데이터:');
    console.table(gachonResult.rows);

    // 4. 코드 형태가 숫자인 대학들 확인
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    코드가 숫자 형태인 대학들 (잘못된 매핑 의심)              ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const numericCodeQuery = `
      SELECT code, name, region
      FROM ts_universities
      WHERE code ~ '^[0-9]+$'
      ORDER BY code
      LIMIT 20
    `;

    const numericResult = await client.query(numericCodeQuery);
    if (numericResult.rows.length > 0) {
      console.log('숫자 형태 코드를 가진 대학들 (잘못된 매핑!):');
      console.table(numericResult.rows);
    } else {
      console.log('숫자 형태의 코드가 없습니다. (정상)');
    }

    // 5. 정상 코드 형태 (U로 시작) 확인
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    정상 코드 형태 (U로 시작하는 대학들)                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const normalCodeQuery = `
      SELECT code, name
      FROM ts_universities
      WHERE code LIKE 'U%'
      ORDER BY code
      LIMIT 10
    `;

    const normalResult = await client.query(normalCodeQuery);
    console.log('U로 시작하는 정상 코드 대학들:');
    console.table(normalResult.rows);

    // 6. 통계 요약
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                              통계 요약                                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM ts_universities) as total_universities,
        (SELECT COUNT(*) FROM ts_universities WHERE code ~ '^[0-9]+$') as numeric_codes,
        (SELECT COUNT(*) FROM ts_universities WHERE code LIKE 'U%') as u_codes,
        (SELECT COUNT(*) FROM ts_regular_admissions WHERE year = 2026) as total_admissions_2026
    `;

    const statsResult = await client.query(statsQuery);
    console.log('통계:');
    console.table(statsResult.rows);

  } catch (error) {
    console.error('에러 발생:', error.message);

    if (error.message.includes('connect')) {
      console.log('\n연결 실패. 아래 사항을 확인하세요:');
      console.log('1. Cloud SQL Proxy가 실행 중인지 확인');
      console.log('2. .env.production의 DB 설정이 올바른지 확인');
      console.log('3. VPN/네트워크 연결 상태 확인');
    }
  } finally {
    await client.end();
  }
}

checkCloudSqlData();
