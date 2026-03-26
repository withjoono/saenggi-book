/**
 * 로컬 vs 프로덕션 데이터베이스 동기화 검증 스크립트
 *
 * 사용법:
 *   1. Cloud SQL Proxy 실행 (프로덕션 DB 접근용)
 *      cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-db --port 5434
 *
 *   2. 스크립트 실행
 *      node verify-db-sync.js
 *
 * 검증 항목:
 *   - 테이블 존재 여부
 *   - 컬럼 스키마 일치 여부
 *   - 핵심 데이터 매핑 검증 (score_calculation_code 등)
 *   - 데이터 카운트 비교
 */

const { Client } = require('pg');

// 데이터베이스 설정
const LOCAL_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
};

const PROD_CONFIG = {
  host: 'localhost',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
};

// 검증할 핵심 테이블 목록
const CRITICAL_TABLES = [
  'ts_member_jungsi_calculated_scores',
  'ts_member_jungsi_recruitment_scores',
  'ts_member_jungsi_input_scores',
  'ts_regular_admissions',
  'member_tb',
];

// 콘솔 색상
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

function logResult(check, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${check}${details ? ': ' + details : ''}`, color);
}

async function connectDB(config, name) {
  const client = new Client(config);
  try {
    await client.connect();
    log(`${name} 연결 성공 (포트 ${config.port})`, 'green');
    return client;
  } catch (error) {
    log(`${name} 연결 실패: ${error.message}`, 'red');
    return null;
  }
}

async function getTableList(client) {
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return result.rows.map(r => r.table_name);
}

async function getTableColumns(client, tableName) {
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  return result.rows;
}

async function getRowCount(client, tableName) {
  try {
    const result = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return parseInt(result.rows[0].count);
  } catch (error) {
    return -1;
  }
}

async function checkScoreCalculationCodes(client, dbName) {
  // ts_regular_admissions에서 score_calculation_code가 채워진 비율 확인
  const result = await client.query(`
    SELECT
      COUNT(*) as total,
      COUNT(score_calculation_code) as with_code,
      COUNT(*) - COUNT(score_calculation_code) as without_code
    FROM ts_regular_admissions
    WHERE year = 2026
  `);
  return result.rows[0];
}

async function checkCalculatedScores(client, dbName) {
  // 환산점수 계산 현황
  const result = await client.query(`
    SELECT
      COUNT(DISTINCT member_id) as members_with_scores,
      COUNT(*) as total_scores,
      COUNT(DISTINCT score_calculation_code) as unique_codes
    FROM ts_member_jungsi_calculated_scores
  `);
  return result.rows[0];
}

async function verifyDatabases() {
  logSection('🔍 데이터베이스 동기화 검증 시작');

  const localClient = await connectDB(LOCAL_CONFIG, '로컬 DB');
  const prodClient = await connectDB(PROD_CONFIG, '프로덕션 DB');

  if (!localClient || !prodClient) {
    log('\n⚠️ 데이터베이스 연결 실패로 검증을 중단합니다.', 'red');
    log('Cloud SQL Proxy가 실행 중인지 확인하세요:', 'yellow');
    log('  cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-db --port 5434', 'cyan');
    process.exit(1);
  }

  const issues = [];

  // 1. 테이블 존재 여부 검증
  logSection('1️⃣ 테이블 존재 여부 검증');

  const localTables = await getTableList(localClient);
  const prodTables = await getTableList(prodClient);

  log(`로컬 테이블 수: ${localTables.length}`, 'cyan');
  log(`프로덕션 테이블 수: ${prodTables.length}`, 'cyan');

  // 로컬에만 있는 테이블
  const localOnly = localTables.filter(t => !prodTables.includes(t));
  if (localOnly.length > 0) {
    log(`\n⚠️ 로컬에만 존재하는 테이블:`, 'yellow');
    localOnly.forEach(t => log(`  - ${t}`, 'yellow'));
    issues.push({ type: 'missing_table', tables: localOnly, location: 'production' });
  }

  // 프로덕션에만 있는 테이블
  const prodOnly = prodTables.filter(t => !localTables.includes(t));
  if (prodOnly.length > 0) {
    log(`\n⚠️ 프로덕션에만 존재하는 테이블:`, 'yellow');
    prodOnly.forEach(t => log(`  - ${t}`, 'yellow'));
    issues.push({ type: 'missing_table', tables: prodOnly, location: 'local' });
  }

  // 핵심 테이블 존재 확인
  console.log('\n핵심 테이블 존재 확인:');
  for (const table of CRITICAL_TABLES) {
    const inLocal = localTables.includes(table);
    const inProd = prodTables.includes(table);

    if (inLocal && inProd) {
      logResult(table, true, '양쪽 모두 존재');
    } else if (inLocal && !inProd) {
      logResult(table, false, '프로덕션에 없음');
      issues.push({ type: 'critical_missing', table, location: 'production' });
    } else if (!inLocal && inProd) {
      logResult(table, false, '로컬에 없음');
      issues.push({ type: 'critical_missing', table, location: 'local' });
    } else {
      logResult(table, false, '양쪽 모두 없음');
      issues.push({ type: 'critical_missing', table, location: 'both' });
    }
  }

  // 2. 핵심 테이블 스키마 비교
  logSection('2️⃣ 핵심 테이블 스키마 비교');

  for (const table of CRITICAL_TABLES) {
    if (!localTables.includes(table) || !prodTables.includes(table)) {
      log(`⏭️ ${table}: 스키마 비교 스킵 (테이블 없음)`, 'yellow');
      continue;
    }

    const localCols = await getTableColumns(localClient, table);
    const prodCols = await getTableColumns(prodClient, table);

    const localColNames = localCols.map(c => c.column_name);
    const prodColNames = prodCols.map(c => c.column_name);

    const missingInProd = localColNames.filter(c => !prodColNames.includes(c));
    const missingInLocal = prodColNames.filter(c => !localColNames.includes(c));

    if (missingInProd.length === 0 && missingInLocal.length === 0) {
      logResult(table, true, `${localColNames.length}개 컬럼 일치`);
    } else {
      logResult(table, false);
      if (missingInProd.length > 0) {
        log(`  프로덕션에 없는 컬럼: ${missingInProd.join(', ')}`, 'yellow');
        issues.push({ type: 'missing_column', table, columns: missingInProd, location: 'production' });
      }
      if (missingInLocal.length > 0) {
        log(`  로컬에 없는 컬럼: ${missingInLocal.join(', ')}`, 'yellow');
        issues.push({ type: 'missing_column', table, columns: missingInLocal, location: 'local' });
      }
    }
  }

  // 3. 데이터 카운트 비교
  logSection('3️⃣ 데이터 카운트 비교');

  for (const table of CRITICAL_TABLES) {
    if (!localTables.includes(table) || !prodTables.includes(table)) {
      continue;
    }

    const localCount = await getRowCount(localClient, table);
    const prodCount = await getRowCount(prodClient, table);

    const diff = Math.abs(localCount - prodCount);
    const diffPercent = localCount > 0 ? ((diff / localCount) * 100).toFixed(1) : 0;

    if (diff === 0) {
      logResult(table, true, `${localCount.toLocaleString()}행 동일`);
    } else if (diffPercent < 5) {
      log(`⚠️ ${table}: 로컬 ${localCount.toLocaleString()}행, 프로덕션 ${prodCount.toLocaleString()}행 (${diffPercent}% 차이)`, 'yellow');
    } else {
      log(`❌ ${table}: 로컬 ${localCount.toLocaleString()}행, 프로덕션 ${prodCount.toLocaleString()}행 (${diffPercent}% 차이)`, 'red');
      issues.push({ type: 'data_mismatch', table, localCount, prodCount });
    }
  }

  // 4. score_calculation_code 매핑 검증
  logSection('4️⃣ Score Calculation Code 매핑 검증');

  try {
    const localCodes = await checkScoreCalculationCodes(localClient, '로컬');
    const prodCodes = await checkScoreCalculationCodes(prodClient, '프로덕션');

    console.log('\nts_regular_admissions (2026년):');
    console.log(`  로컬:     전체 ${localCodes.total}행, 코드있음 ${localCodes.with_code}행, 코드없음 ${localCodes.without_code}행`);
    console.log(`  프로덕션: 전체 ${prodCodes.total}행, 코드있음 ${prodCodes.with_code}행, 코드없음 ${prodCodes.without_code}행`);

    if (parseInt(prodCodes.without_code) > 0) {
      log(`\n⚠️ 프로덕션에 score_calculation_code가 없는 행이 ${prodCodes.without_code}개 있습니다.`, 'yellow');
      issues.push({ type: 'missing_data', detail: 'score_calculation_code empty in production' });
    } else {
      logResult('score_calculation_code 매핑', true, '모든 행에 코드 존재');
    }
  } catch (error) {
    log(`Score calculation code 검증 실패: ${error.message}`, 'red');
  }

  // 5. 환산점수 계산 현황
  logSection('5️⃣ 환산점수 계산 현황');

  try {
    const localScores = await checkCalculatedScores(localClient, '로컬');
    const prodScores = await checkCalculatedScores(prodClient, '프로덕션');

    console.log('\nts_member_jungsi_calculated_scores:');
    console.log(`  로컬:     회원 ${localScores.members_with_scores}명, 점수 ${parseInt(localScores.total_scores).toLocaleString()}개, 고유코드 ${localScores.unique_codes}개`);
    console.log(`  프로덕션: 회원 ${prodScores.members_with_scores}명, 점수 ${parseInt(prodScores.total_scores).toLocaleString()}개, 고유코드 ${prodScores.unique_codes}개`);
  } catch (error) {
    log(`환산점수 현황 조회 실패: ${error.message}`, 'red');
  }

  // 6. 최종 결과
  logSection('📊 검증 결과 요약');

  if (issues.length === 0) {
    log('\n✅ 모든 검증 통과! 로컬과 프로덕션이 동기화되어 있습니다.', 'green');
  } else {
    log(`\n⚠️ ${issues.length}개의 이슈가 발견되었습니다:`, 'yellow');

    issues.forEach((issue, idx) => {
      console.log(`\n${idx + 1}. ${issue.type}`);
      console.log(`   상세: ${JSON.stringify(issue, null, 2).replace(/\n/g, '\n   ')}`);
    });

    log('\n권장 조치:', 'cyan');

    const hasMissingTable = issues.some(i => i.type === 'critical_missing' || i.type === 'missing_table');
    const hasMissingColumn = issues.some(i => i.type === 'missing_column');
    const hasMissingData = issues.some(i => i.type === 'missing_data');

    if (hasMissingTable) {
      log('  1. 누락된 테이블에 대한 마이그레이션 실행: yarn typeorm:run', 'cyan');
    }
    if (hasMissingColumn) {
      log('  2. 스키마 차이를 위한 마이그레이션 생성: yarn typeorm migration:generate -n FixSchema', 'cyan');
    }
    if (hasMissingData) {
      log('  3. 데이터 동기화 스크립트 실행 필요', 'cyan');
    }
  }

  // 연결 종료
  await localClient.end();
  await prodClient.end();

  log('\n검증 완료!', 'bold');

  return issues;
}

// 메인 실행
verifyDatabases()
  .then(issues => {
    process.exit(issues.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('검증 실행 오류:', error);
    process.exit(1);
  });
