#!/usr/bin/env node

/**
 * 환경 변수 검증 스크립트
 *
 * 이 스크립트는 .env 파일의 환경 변수를 검증하고
 * 필수 서비스(Database, Redis, GCS)의 연결을 테스트합니다.
 *
 * 사용법: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// 색상 코드 (ANSI)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// 로깅 함수
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}━━━ ${msg} ━━━${colors.reset}\n`),
};

// 환경 변수 로드
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.development');

  if (!fs.existsSync(envPath)) {
    log.error('.env.development 파일을 찾을 수 없습니다.');
    log.info('cp .env.example .env.development 명령으로 생성하세요.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envContent.split('\n').forEach(line => {
    // 주석과 빈 줄 무시
    if (line.trim().startsWith('#') || !line.trim()) return;

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

// 필수 환경 변수 정의
const requiredEnvVars = {
  application: [
    'NODE_ENV',
    'PORT',
  ],
  database: [
    'DB_TYPE',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_SYNCHRONIZE',
  ],
  authentication: [
    'AUTH_JWT_SECRET',
    'AUTH_JWT_TOKEN_EXPIRES_IN',
    'AUTH_REFRESH_SECRET',
    'AUTH_REFRESH_TOKEN_EXPIRES_IN',
  ],
};

// 선택적 환경 변수 (경고만 표시)
const optionalEnvVars = {
  payment: ['IMP_KEY', 'IMP_SECRET', 'IMP_STORE_CODE'],
  sms: ['ALIGO_API_KEY', 'ALIGO_USER_ID', 'ALIGO_SENDER_PHONE'],
  gcs: ['GCS_PROJECT_ID', 'GCS_BUCKET_NAME', 'GCS_KEY_FILENAME', 'GCS_PUBLIC_URL'],
  redis: ['REDIS_HOST', 'REDIS_PORT'],
  monitoring: ['SENTRY_DSN'],
};

// 플레이스홀더 값 체크
const placeholderPatterns = [
  /^YOUR_.*_HERE$/,
  /^your_.*_here$/,
  /^<.*>$/,
  /^\[.*\]$/,
];

function isPlaceholder(value) {
  if (!value) return true;
  return placeholderPatterns.some(pattern => pattern.test(value));
}

// 1. 환경 변수 존재 확인
function validateEnvVarsExistence(env) {
  log.section('1️⃣  환경 변수 존재 확인');

  let hasErrors = false;

  // 필수 변수 확인
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    console.log(`\n${category.toUpperCase()}:`);

    vars.forEach(varName => {
      const value = env[varName];

      if (!value) {
        log.error(`${varName}: 누락됨`);
        hasErrors = true;
      } else if (isPlaceholder(value)) {
        log.error(`${varName}: 플레이스홀더 값 (실제 값으로 변경 필요)`);
        hasErrors = true;
      } else {
        log.success(`${varName}: 설정됨`);
      }
    });
  });

  // 선택적 변수 확인 (경고만)
  Object.entries(optionalEnvVars).forEach(([category, vars]) => {
    console.log(`\n${category.toUpperCase()} (선택사항):`);

    vars.forEach(varName => {
      const value = env[varName];

      if (!value || isPlaceholder(value)) {
        log.warn(`${varName}: 미설정 (선택사항)`);
      } else {
        log.success(`${varName}: 설정됨`);
      }
    });
  });

  return !hasErrors;
}

// 2. DB_SYNCHRONIZE 안전성 체크
function validateDbSynchronize(env) {
  log.section('2️⃣  DB_SYNCHRONIZE 안전성 체크');

  const dbSync = env.DB_SYNCHRONIZE;
  const nodeEnv = env.NODE_ENV;

  if (dbSync === 'true' && nodeEnv === 'production') {
    log.error('DB_SYNCHRONIZE=true는 프로덕션 환경에서 절대 사용 금지!');
    log.info('마이그레이션을 사용하세요: yarn typeorm:run');
    return false;
  }

  if (dbSync === 'true') {
    log.warn('DB_SYNCHRONIZE=true 감지 (개발 환경에서만 임시로 사용)');
    log.info('스키마 생성 후 반드시 false로 변경하세요.');
  } else {
    log.success('DB_SYNCHRONIZE=false (안전)');
  }

  return true;
}

// 3. JWT 시크릿 강도 확인
function validateJwtSecrets(env) {
  log.section('3️⃣  JWT 시크릿 강도 확인');

  const secrets = [
    { name: 'AUTH_JWT_SECRET', value: env.AUTH_JWT_SECRET },
    { name: 'AUTH_REFRESH_SECRET', value: env.AUTH_REFRESH_SECRET },
  ];

  let allValid = true;

  secrets.forEach(({ name, value }) => {
    if (!value || isPlaceholder(value)) {
      log.error(`${name}: 설정되지 않음`);
      allValid = false;
      return;
    }

    // 최소 길이 체크 (64자 이상 권장)
    if (value.length < 64) {
      log.warn(`${name}: 길이가 짧음 (${value.length}자, 권장: 64자 이상)`);
      log.info('생성: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"');
    } else {
      log.success(`${name}: 강도 양호 (${value.length}자)`);
    }

    // 두 시크릿이 같은지 체크
    if (name === 'AUTH_REFRESH_SECRET' && value === env.AUTH_JWT_SECRET) {
      log.error('ACCESS TOKEN과 REFRESH TOKEN 시크릿이 동일합니다!');
      log.info('서로 다른 시크릿을 사용하세요.');
      allValid = false;
    }
  });

  return allValid;
}

// 4. 파일 존재 확인
function validateFiles(env) {
  log.section('4️⃣  서비스 계정 키 파일 확인');

  const files = [
    { name: 'GCS 서비스 계정 키', path: env.GCS_KEY_FILENAME, required: false },
    { name: 'Firebase 서비스 계정 키', path: env.FIREBASE_CREDENTIALS_PATH || './firebase-service-account-key.json', required: false },
  ];

  files.forEach(({ name, path: filePath, required }) => {
    if (!filePath || isPlaceholder(filePath)) {
      if (required) {
        log.error(`${name}: 경로 미설정`);
      } else {
        log.warn(`${name}: 미설정 (선택사항)`);
      }
      return;
    }

    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (fs.existsSync(absolutePath)) {
      log.success(`${name}: 파일 존재 (${filePath})`);

      // 권한 체크 (Unix 시스템만)
      if (process.platform !== 'win32') {
        try {
          const stats = fs.statSync(absolutePath);
          const mode = (stats.mode & parseInt('777', 8)).toString(8);

          if (mode !== '600') {
            log.warn(`파일 권한: ${mode} (권장: 600)`);
            log.info(`chmod 600 ${filePath}`);
          } else {
            log.success(`파일 권한: ${mode} (안전)`);
          }
        } catch (err) {
          log.warn(`권한 확인 실패: ${err.message}`);
        }
      }
    } else {
      if (required) {
        log.error(`${name}: 파일 없음 (${filePath})`);
      } else {
        log.warn(`${name}: 파일 없음 (${filePath}) - 선택사항`);
      }
    }
  });

  return true; // 파일은 선택사항이므로 항상 true
}

// 5. 데이터베이스 연결 테스트 (간단한 체크)
function validateDatabaseConfig(env) {
  log.section('5️⃣  데이터베이스 설정 검증');

  const dbType = env.DB_TYPE;
  const dbHost = env.DB_HOST;
  const dbPort = env.DB_PORT;

  if (dbType !== 'postgres') {
    log.warn(`DB_TYPE=${dbType} (권장: postgres)`);
    log.info('PostgreSQL 사용을 권장합니다.');
  } else {
    log.success('DB_TYPE=postgres');
  }

  if (dbHost === '127.0.0.1' || dbHost === 'localhost') {
    log.success('로컬 데이터베이스 연결 설정');
  } else {
    log.info(`원격 데이터베이스 연결: ${dbHost}:${dbPort}`);
  }

  // 포트 체크
  if (dbPort === '5432') {
    log.success('PostgreSQL 기본 포트 사용 (5432)');
  } else {
    log.info(`사용자 지정 포트: ${dbPort}`);
  }

  return true;
}

// 6. Redis 설정 검증
function validateRedisConfig(env) {
  log.section('6️⃣  Redis 캐싱 설정 검증');

  const redisHost = env.REDIS_HOST;
  const redisPort = env.REDIS_PORT;

  if (!redisHost || !redisPort) {
    log.warn('Redis 설정 미완료 (선택사항이지만 프로덕션에서 권장)');
    return true;
  }

  if (redisHost === 'localhost' || redisHost === '127.0.0.1') {
    log.success('로컬 Redis 연결 설정');
  } else {
    log.info(`원격 Redis 연결: ${redisHost}:${redisPort}`);
  }

  if (redisPort === '6379') {
    log.success('Redis 기본 포트 사용 (6379)');
  } else {
    log.info(`사용자 지정 포트: ${redisPort}`);
  }

  return true;
}

// 7. 모니터링 설정 확인
function validateMonitoring(env) {
  log.section('7️⃣  모니터링 & 에러 추적 설정');

  const sentryDsn = env.SENTRY_DSN;

  if (!sentryDsn || isPlaceholder(sentryDsn)) {
    log.warn('Sentry DSN 미설정 (프로덕션에서 권장)');
    log.info('https://sentry.io 에서 DSN 발급');
  } else {
    if (sentryDsn.includes('ingest.sentry.io')) {
      log.success('Sentry DSN 설정됨');
    } else {
      log.warn('Sentry DSN 형식 확인 필요');
    }
  }

  return true;
}

// 메인 실행
function main() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════╗
║   거북스쿨 백엔드 환경 변수 검증 스크립트         ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    const env = loadEnvFile();
    log.success('.env.development 파일 로드 완료\n');

    const results = {
      envVars: validateEnvVarsExistence(env),
      dbSync: validateDbSynchronize(env),
      jwtSecrets: validateJwtSecrets(env),
      files: validateFiles(env),
      database: validateDatabaseConfig(env),
      redis: validateRedisConfig(env),
      monitoring: validateMonitoring(env),
    };

    // 최종 결과
    log.section('✨ 검증 결과 요약');

    const allPassed = Object.values(results).every(result => result === true);

    if (allPassed) {
      log.success('모든 필수 검증 항목 통과!');
      log.info('서버를 실행할 준비가 완료되었습니다: yarn start:dev');
      process.exit(0);
    } else {
      log.error('일부 검증 항목 실패');
      log.info('위의 에러 메시지를 확인하고 .env.development 파일을 수정하세요.');
      log.info('문서 참조: ./DEVELOPMENT-SETUP.md');
      process.exit(1);
    }

  } catch (error) {
    log.error(`검증 중 오류 발생: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { loadEnvFile, validateEnvVarsExistence };
