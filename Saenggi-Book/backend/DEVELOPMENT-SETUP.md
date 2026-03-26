# 거북스쿨 백엔드 개발 환경 설정 가이드

## 📋 목차
1. [필수 요구사항](#필수-요구사항)
2. [데이터베이스 설정](#데이터베이스-설정)
3. [Cloud SQL 연결](#cloud-sql-연결)
4. [Redis 캐싱 설정](#redis-캐싱-설정)
5. [Google Cloud Storage (GCS) 설정](#google-cloud-storage-gcs-설정)
6. [Firebase Admin SDK 설정](#firebase-admin-sdk-설정)
7. [Sentry 에러 추적 설정](#sentry-에러-추적-설정)
8. [환경 변수 설정](#환경-변수-설정)
9. [서버 실행](#서버-실행)
10. [문제 해결](#문제-해결)

---

## 필수 요구사항

### 소프트웨어
- **Node.js**: v18.x 이상 (권장: v18.20.0)
- **Yarn**: 1.22.x
- **Docker Desktop**: 최신 버전 (PostgreSQL 실행용)
- **Git**: 최신 버전

### 버전 확인
```bash
node --version  # v18.x 이상
yarn --version  # 1.22.x
docker --version  # 최신 버전
```

---

## 데이터베이스 설정

### 방법 1: Docker를 사용한 PostgreSQL 설정 (권장)

#### Windows

```cmd
# setup-db.bat 스크립트 실행
setup-db.bat
```

#### Linux/Mac

```bash
# setup-db.sh 스크립트 실행
chmod +x setup-db.sh
./setup-db.sh
```

#### 수동 설정

```bash
# PostgreSQL 컨테이너 실행
docker run --name geobuk-postgres \
  -e POSTGRES_PASSWORD=tsuser1234 \
  -e POSTGRES_USER=tsuser \
  -e POSTGRES_DB=geobukschool_dev \
  -p 5432:5432 \
  -d postgres:14

# 데이터베이스 준비 확인
docker exec geobuk-postgres pg_isready -U tsuser
```

### 방법 2: 로컬 PostgreSQL 설치

1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/)에서 다운로드
2. 설치 시 비밀번호 설정
3. 데이터베이스 생성:
```bash
createdb -U postgres geobukschool_dev
```

---

## Cloud SQL 연결

Google Cloud SQL을 프로덕션 데이터베이스로 사용하는 경우의 연결 방법입니다.

### 방법 1: Cloud SQL Proxy 사용 (권장)

Cloud SQL Proxy는 보안 연결을 제공하며 자동으로 인증을 처리합니다.

#### 1. Cloud SQL Proxy 설치

**Windows**:
```powershell
# Cloud SQL Proxy 다운로드
curl -o cloud-sql-proxy.exe https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.x64.exe

# PATH에 추가 또는 프로젝트 디렉토리에 배치
```

**Linux/Mac**:
```bash
# Cloud SQL Proxy 다운로드
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64

# 실행 권한 추가
chmod +x cloud-sql-proxy
```

#### 2. Cloud SQL 인스턴스 연결 정보 확인

GCP Console > Cloud SQL > 인스턴스 선택 > 개요에서 **연결 이름** 확인
- 형식: `project-id:region:instance-name`
- 예: `geobukschool:asia-northeast3:geobuk-db-prod`

#### 3. Cloud SQL Proxy 실행

```bash
# 로컬 포트 5432로 프록시 시작
./cloud-sql-proxy --port 5432 project-id:region:instance-name

# 백그라운드 실행 (Linux/Mac)
nohup ./cloud-sql-proxy --port 5432 project-id:region:instance-name &

# Windows 백그라운드 실행 (별도 PowerShell 창)
Start-Process -NoNewWindow cloud-sql-proxy.exe -ArgumentList "--port 5432 project-id:region:instance-name"
```

#### 4. .env 설정

```ini
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=your_cloud_sql_user
DB_PASSWORD=your_cloud_sql_password
DB_NAME=geobukschool_prod
```

### 방법 2: 직접 연결 (Public IP)

**⚠️ 주의**: 보안상 Cloud SQL Proxy 사용 권장

#### 1. Cloud SQL에서 Public IP 활성화

GCP Console > Cloud SQL > 인스턴스 > 연결 > 공개 IP 활성화

#### 2. 승인된 네트워크 추가

현재 IP 주소를 승인된 네트워크에 추가:
```bash
# 현재 공개 IP 확인
curl ifconfig.me

# GCP Console > Cloud SQL > 연결 > 네트워킹 > 승인된 네트워크에 추가
```

#### 3. .env 설정

```ini
DB_HOST=<Cloud SQL Public IP>
DB_PORT=5432
DB_USER=your_cloud_sql_user
DB_PASSWORD=your_cloud_sql_password
DB_NAME=geobukschool_prod
```

### 방법 3: Private IP 연결 (VPC 내부)

App Engine, Cloud Run, GCE 등 GCP 서비스에서 실행할 때 사용

#### Unix Socket 연결 (App Engine/Cloud Run)

```ini
# .env.production
DB_HOST=/cloudsql/project-id:region:instance-name
DB_PORT=5432
DB_USER=your_cloud_sql_user
DB_PASSWORD=your_cloud_sql_password
DB_NAME=geobukschool_prod
```

### PostgreSQL vs MySQL 차이점

이 프로젝트는 **PostgreSQL**을 표준으로 사용합니다.

| 기능 | PostgreSQL | MySQL |
|------|------------|-------|
| 데이터 타입 | JSONB, ARRAY, TIMESTAMP | JSON, TEXT, DATETIME |
| 전체 텍스트 검색 | 내장 (tsvector) | FULLTEXT 인덱스 |
| 트랜잭션 격리 | MVCC 기반 우수 | 제한적 |
| 복잡한 쿼리 성능 | 우수 | 단순 쿼리에 최적화 |

**⚠️ 중요**: 일부 엔티티는 PostgreSQL 전용 타입을 사용하므로 MySQL 사용 시 마이그레이션 필요

---

## Redis 캐싱 설정

Redis는 사용자 구독 정보, 참조 데이터 등을 캐싱하는 데 사용됩니다.

### 방법 1: Docker Redis 사용 (개발)

#### Redis 컨테이너 실행

```bash
# Redis 6.x 실행
docker run --name geobuk-redis \
  -p 6379:6379 \
  -d redis:6-alpine

# Redis 상태 확인
docker exec geobuk-redis redis-cli ping
# 응답: PONG
```

#### .env 설정

```ini
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=5
```

### 방법 2: 로컬 Redis 설치

**Windows (WSL 사용 권장)**:
```bash
# WSL에서 Redis 설치
sudo apt update
sudo apt install redis-server

# Redis 시작
sudo service redis-server start
```

**Mac (Homebrew)**:
```bash
# Redis 설치
brew install redis

# Redis 시작
brew services start redis
```

**Linux**:
```bash
# Redis 설치
sudo apt update
sudo apt install redis-server

# Redis 시작 및 자동 시작 설정
sudo systemctl enable --now redis-server
```

### 방법 3: Google Cloud Memorystore (프로덕션)

GCP의 관리형 Redis 서비스 사용

#### 1. Memorystore 인스턴스 생성

```bash
# gcloud CLI로 생성
gcloud redis instances create geobuk-redis \
  --size=1 \
  --region=asia-northeast3 \
  --redis-version=redis_6_x
```

#### 2. IP 주소 확인

```bash
gcloud redis instances describe geobuk-redis \
  --region=asia-northeast3 \
  --format="value(host)"
```

#### 3. .env 설정

```ini
REDIS_HOST=<Memorystore IP>
REDIS_PORT=6379
# Memorystore는 기본적으로 비밀번호 없음 (VPC 내부 접근만 허용)
```

### Redis 연결 테스트

```bash
# Redis CLI로 연결 테스트
redis-cli -h localhost -p 6379 ping

# Node.js에서 테스트
node -e "const redis = require('redis'); const client = redis.createClient({host: 'localhost'}); client.on('connect', () => console.log('Connected!')); client.connect();"
```

---

## Google Cloud Storage (GCS) 설정

파일 업로드 기능을 위한 GCS 설정입니다.

### 1. GCS 버킷 생성

#### GCP Console 사용

1. GCP Console > Cloud Storage > 버킷 만들기
2. 버킷 설정:
   - **이름**: `geobukschool-files-dev` (또는 원하는 이름)
   - **위치 유형**: Region
   - **위치**: asia-northeast3 (서울)
   - **스토리지 클래스**: Standard
   - **액세스 제어**: 세밀한 액세스 제어 (권장)
   - **공개 액세스 방지**: 사용 안 함 (파일 공개 필요 시)

#### gcloud CLI 사용

```bash
# 버킷 생성
gsutil mb -l asia-northeast3 -c standard gs://geobukschool-files-dev

# 공개 읽기 권한 설정 (선택사항)
gsutil iam ch allUsers:objectViewer gs://geobukschool-files-dev
```

### 2. 서비스 계정 생성 및 키 발급

#### GCP Console 사용

1. GCP Console > IAM 및 관리자 > 서비스 계정
2. **서비스 계정 만들기** 클릭
3. 서비스 계정 세부정보:
   - **이름**: `geobuk-gcs-uploader`
   - **설명**: GCS 파일 업로드 서비스 계정
4. 역할 부여:
   - **Storage 개체 관리자** (roles/storage.objectAdmin)
5. **키 만들기** > JSON 선택 > 다운로드

#### gcloud CLI 사용

```bash
# 서비스 계정 생성
gcloud iam service-accounts create geobuk-gcs-uploader \
  --description="GCS file upload service account" \
  --display-name="GCS Uploader"

# Storage 개체 관리자 역할 부여
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:geobuk-gcs-uploader@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# 서비스 계정 키 생성
gcloud iam service-accounts keys create ./gcs-service-account-key.json \
  --iam-account=geobuk-gcs-uploader@PROJECT_ID.iam.gserviceaccount.com
```

### 3. 프로젝트 설정

#### 서비스 계정 키 파일 배치

```bash
# 프로젝트 루트에 config 디렉토리 생성
mkdir -p config

# 다운로드한 키 파일 이동
mv ~/Downloads/gcs-service-account-key.json ./config/

# 파일 권한 설정 (Linux/Mac)
chmod 600 ./config/gcs-service-account-key.json
```

#### .env 설정

```ini
# GCS 설정
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=geobukschool-files-dev
GCS_KEY_FILENAME=./config/gcs-service-account-key.json
GCS_PUBLIC_URL=https://storage.googleapis.com/geobukschool-files-dev
```

### 4. 업로드 테스트

서버 실행 후 Swagger UI에서 테스트:

```bash
# 서버 실행
yarn start:dev

# Swagger UI 접속
# http://localhost:4001/swagger

# file-upload 섹션에서:
# POST /file-upload/single 엔드포인트 테스트
```

### CORS 설정 (웹 앱에서 직접 업로드 시)

```bash
# cors.json 파일 생성
cat > cors.json << EOF
[
  {
    "origin": ["https://admin2.turtleskool.com", "https://turtleskool.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF

# CORS 설정 적용
gsutil cors set cors.json gs://geobukschool-files-dev
```

---

## Firebase Admin SDK 설정

Firebase는 푸시 알림 등 선택적 기능에 사용됩니다.

### 1. Firebase 프로젝트 생성 (선택사항)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름 입력: `geobukschool`
4. Google Analytics 설정 (선택사항)

### 2. 서비스 계정 키 생성

1. Firebase Console > 프로젝트 설정 (⚙️ 아이콘)
2. **서비스 계정** 탭 선택
3. **새 비공개 키 생성** 클릭
4. JSON 파일 다운로드

### 3. 프로젝트 설정

#### 서비스 계정 키 파일 배치

```bash
# 프로젝트 루트에 배치
mv ~/Downloads/geobukschool-firebase-adminsdk-xxxxx.json ./firebase-service-account-key.json

# 파일 권한 설정 (Linux/Mac)
chmod 600 ./firebase-service-account-key.json
```

#### .env 설정

```ini
# Firebase 설정 (선택사항)
FIREBASE_PROJECT_ID=geobukschool
FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json
```

**⚠️ 참고**: Firebase 서비스 계정 키 파일이 없으면 Firebase 기능이 자동으로 비활성화됩니다. 애플리케이션은 정상적으로 작동합니다.

### 4. Firebase Cloud Messaging (FCM) 설정

푸시 알림을 사용하는 경우:

1. Firebase Console > 프로젝트 설정 > Cloud Messaging
2. **Server Key** 확인 (FCM 토큰 발급용)
3. 클라이언트 앱에서 FCM 토큰 등록
4. 백엔드에서 FCM Admin SDK로 알림 전송

---

## Sentry 에러 추적 설정

프로덕션 환경에서 에러 모니터링을 위한 Sentry 설정입니다.

### 1. Sentry 프로젝트 생성

1. [Sentry.io](https://sentry.io/) 가입 및 로그인
2. **Create Project** 클릭
3. 플랫폼 선택: **Node.js**
4. 프로젝트 이름: `geobukschool-backend`
5. **Create Project** 클릭

### 2. DSN 확인

프로젝트 생성 후 표시되는 DSN 복사:
- 형식: `https://[key]@[organization].ingest.sentry.io/[project-id]`
- 예: `https://abc123def456@o12345.ingest.sentry.io/67890`

또는 Settings > Projects > [프로젝트명] > Client Keys (DSN)에서 확인

### 3. .env 설정

```ini
# Sentry 설정
SENTRY_DSN=https://abc123def456@o12345.ingest.sentry.io/67890
```

### 4. 샘플링 비율 설정 (선택사항)

트래픽이 많은 경우 샘플링 비율 조정:

```ini
# 개발 환경: 100% (모든 에러 추적)
NODE_ENV=development
# instrumentation.ts에서 자동으로 1.0 설정

# 프로덕션 환경: 10% (비용 절감)
NODE_ENV=production
# instrumentation.ts에서 자동으로 0.1 설정
```

### 5. 에러 추적 테스트

```bash
# 서버 실행
yarn start:dev

# 테스트 에러 발생 (존재하지 않는 엔드포인트 호출)
curl http://localhost:4001/test-error

# Sentry 대시보드에서 에러 확인
# Issues > All Issues에서 새 에러 확인
```

### 6. Sentry 대시보드 활용

**주요 기능**:
- **Issues**: 에러 목록 및 상세 정보
- **Performance**: 트랜잭션 성능 모니터링
- **Releases**: 배포 버전별 에러 추적
- **Alerts**: 에러 임계값 알림 설정

**유용한 필터**:
- Environment: development, production
- Release: 배포 버전별 필터링
- User: 사용자별 에러 추적

---

## 환경 변수 설정

### 1. `.env.development` 파일 생성

`.env.example` 파일을 복사:

```bash
cp .env.example .env.development
```

### 2. 데이터베이스 설정 (Docker 사용 시)

```ini
# App
NODE_ENV=development
PORT=4001

# Database (Docker PostgreSQL)
DB_TYPE=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_PASSWORD=tsuser1234
DB_NAME=geobukschool_dev
DB_USER=tsuser
DB_SYNCHRONIZE=false  # ⚠️ 항상 false로 유지

# Authentication (팀 공유 시크릿)
AUTH_JWT_SECRET=your_jwt_secret_here
AUTH_JWT_TOKEN_EXPIRES_IN=7200000
AUTH_REFRESH_SECRET=your_refresh_secret_here
AUTH_REFRESH_TOKEN_EXPIRES_IN=5184000000

# 외부 서비스 API 키
IMP_KEY=your_imp_key
IMP_SECRET=your_imp_secret
IMP_STORE_CODE=your_store_code

ALIGO_API_KEY=your_aligo_key
ALIGO_USER_ID=your_user_id
ALIGO_SENDER_PHONE=your_phone
ALIGO_TEST_MODE=true

SENTRY_DSN=your_sentry_dsn
SLACK_WEBHOOK=your_slack_webhook
```

### 3. 로컬 PostgreSQL 사용 시

```ini
DB_USER=postgres
DB_PASSWORD=<설치 시 설정한 비밀번호>
```

---

## 서버 실행

### 최초 실행 (데이터베이스 스키마 생성)

#### 옵션 A: TypeORM Synchronize 사용 (빠름, 주의 필요)

```bash
# 1. .env.development 임시 수정
DB_SYNCHRONIZE=true

# 2. 의존성 설치
yarn install

# 3. 서버 실행 (스키마 자동 생성)
yarn start:dev

# 4. 서버가 정상 시작되면 Ctrl+C로 종료

# 5. .env.development 원상복구
DB_SYNCHRONIZE=false

# 6. 마이그레이션 생성 (선택사항)
yarn typeorm migration:generate -n InitialSchema

# 7. 서버 재시작
yarn start:dev
```

#### 옵션 B: 마이그레이션 사용 (권장, 안전)

```bash
# 1. 의존성 설치
yarn install

# 2. 마이그레이션 실행
yarn typeorm:run

# 3. 서버 실행
yarn start:dev
```

### 일반 실행

```bash
# 개발 모드 (watch 모드)
yarn start:dev

# 디버그 모드
yarn start:debug

# 프로덕션 모드
yarn build
yarn start:prod
```

---

## 문제 해결

### PostgreSQL 연결 실패

**증상**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**해결 방법**:
1. Docker Desktop이 실행 중인지 확인
2. PostgreSQL 컨테이너 상태 확인:
```bash
docker ps | grep geobuk-postgres
```
3. 컨테이너가 없으면 재실행:
```bash
docker rm -f geobuk-postgres  # 기존 컨테이너 제거
setup-db.bat  # 또는 setup-db.sh
```

---

### "relation does not exist" 에러

**증상**:
```
QueryFailedError: relation "board_tb" does not exist
```

**원인**: 데이터베이스 스키마가 생성되지 않음

**해결 방법**:
1. DB_SYNCHRONIZE=true로 설정하고 서버 실행
2. 또는 마이그레이션 실행: `yarn typeorm:run`

---

### SQLite 호환성 에러

**증상**:
```
DataTypeNotSupportedError: Data type "timestamp" is not supported by "better-sqlite3"
```

**원인**: 엔티티가 PostgreSQL 전용 타입 사용

**해결 방법**: SQLite 대신 PostgreSQL 사용 (권장)

---

### Docker Desktop 미실행

**증상**:
```
error during connect: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

**해결 방법**:
1. Windows에서 Docker Desktop 실행
2. Docker가 완전히 시작될 때까지 대기 (1-2분)
3. `docker ps` 명령어로 확인

---

### GCS 업로드 실패

**증상**:
```
Error: Could not load the default credentials
```

**원인**: GCS 서비스 계정 키 파일 경로 오류

**해결 방법**:
1. `GCS_KEY_FILENAME` 경로 확인
2. 파일 존재 여부 확인: `ls -la ./config/gcs-service-account-key.json`
3. 파일 권한 확인: `chmod 600 ./config/gcs-service-account-key.json`

---

### Redis 연결 실패

**증상**:
```
Error: Redis connection to localhost:6379 failed
```

**해결 방법**:
1. Redis 실행 확인:
```bash
# Docker 사용 시
docker ps | grep geobuk-redis

# 로컬 설치 시
redis-cli ping
```
2. Redis 재시작:
```bash
# Docker
docker restart geobuk-redis

# Linux/Mac
sudo service redis-server restart
```

---

## 유용한 명령어

### 데이터베이스 관리

```bash
# 마이그레이션 생성
yarn typeorm migration:generate -n MigrationName

# 마이그레이션 실행
yarn typeorm:run

# 마이그레이션 되돌리기
yarn typeorm:revert

# PostgreSQL 컨테이너 중지
docker stop geobuk-postgres

# PostgreSQL 컨테이너 시작
docker start geobuk-postgres

# PostgreSQL 컨테이너 제거
docker rm -f geobuk-postgres
```

### 개발 도구

```bash
# 린팅
yarn lint

# 포맷팅
yarn format

# 테스트
yarn test

# 테스트 커버리지
yarn test:cov

# E2E 테스트
yarn test:e2e

# 빌드
yarn build
```

---

## 환경 변수 검증 스크립트

프로젝트에 환경 변수 검증 스크립트가 포함되어 있습니다:

```bash
# 환경 변수 검증 실행
node scripts/validate-env.js

# 또는 npm script 사용
yarn validate:env
```

**검증 항목**:
- 필수 환경 변수 존재 확인
- 데이터베이스 연결 테스트
- Redis 연결 테스트
- GCS 서비스 계정 키 파일 확인
- JWT 시크릿 강도 확인

---

## 팀 협업 규칙

### 1. 환경 변수 관리

- ✅ `.env.example` 파일 사용 (플레이스홀더)
- ❌ `.env.development` 파일은 Git에 커밋하지 않음
- ❌ 실제 API 키나 시크릿을 코드에 하드코딩하지 않음

### 2. DB_SYNCHRONIZE 규칙

- ⚠️ **절대 `DB_SYNCHRONIZE=true` 상태로 커밋하지 않음**
- ✅ 마이그레이션을 사용하여 스키마 변경 관리
- ✅ 마이그레이션 파일은 Git에 커밋

### 3. 데이터베이스 스키마 변경

```bash
# 1. 엔티티 수정
# 2. 마이그레이션 생성
yarn typeorm migration:generate -n DescriptiveChangeName

# 3. 마이그레이션 검토
# 4. Git 커밋
git add src/migrations/*
git commit -m "feat: Add new migration for XYZ"

# 5. 팀원에게 공유
git push
```

### 4. Node 버전 통일

- **권장**: Node.js v18.20.0
- `.nvmrc` 파일 사용 권장:
```bash
echo "18.20.0" > .nvmrc
nvm use
```

---

## 추가 리소스

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Docker 공식 문서](https://docs.docker.com/)
- [Google Cloud 문서](https://cloud.google.com/docs)
- [Sentry 문서](https://docs.sentry.io/)

---

## 문의 및 지원

문제가 발생하면 다음을 확인하세요:

1. 이 문서의 [문제 해결](#문제-해결) 섹션
2. `logs/error/*.log` 파일 확인
3. 팀 Slack 채널에 문의

---

**마지막 업데이트**: 2025-11-25
