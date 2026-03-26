# 로컬 개발 환경 빠른 시작 가이드

## 문제 발생 시 체크리스트

### 1. 서버가 DB에 연결 안 될 때

```bash
# Step 1: Docker 상태 확인
docker ps

# PostgreSQL 컨테이너가 없거나 중지됨?
docker ps -a | findstr geobuk-postgres

# Step 2: 컨테이너 시작
docker start geobuk-postgres

# Step 3: .env.development 확인
# 로컬 Docker 설정:
# DB_PORT=5432
# DB_USER=tsuser
# DB_PASSWORD=tsuser1234
```

### 2. 데이터가 없다고 느껴질 때

**대부분 DB가 사라진 게 아니라 연결 설정 문제입니다!**

```bash
# Docker 볼륨 확인 (데이터 저장소)
docker volume ls | findstr postgres

# 볼륨이 있으면 데이터도 있음!
```

---

## 개발 환경 설정

### 로컬 Docker (권장)
```env
# .env.development
DB_TYPE=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=tsuser
DB_PASSWORD=tsuser1234
DB_NAME=geobukschool_dev
```

### Cloud SQL (배포용)
```env
# .env.development (Cloud SQL Proxy 사용 시)
DB_TYPE=postgres
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=Junho@46852
DB_NAME=geobukschool_dev
```

---

## 매일 개발 시작할 때

```bash
# 1. Docker Desktop 실행 확인

# 2. 컨테이너 상태 확인
docker ps

# 3. 없으면 시작
docker start geobuk-postgres

# 4. 서버 실행
yarn start:dev
```

---

## 컨테이너 자동 시작 설정 (이미 적용됨)

```bash
# PostgreSQL 컨테이너 자동 재시작 설정
docker update --restart=always geobuk-postgres
```

---

## 데이터 백업

```bash
# 백업 생성
docker exec geobuk-postgres pg_dump -U tsuser geobukschool_dev > backup_$(date +%Y%m%d).sql

# 복원
docker exec -i geobuk-postgres psql -U tsuser geobukschool_dev < backup_20241202.sql
```

---

## 완전히 처음부터 시작해야 할 때만

```bash
# 1. docker-compose로 새 컨테이너 생성
docker-compose up -d db

# 2. 스키마 적용
docker exec -i geobuk-postgres psql -U postgres -d geobukschool_dev < schema_dump.sql

# 3. 마이그레이션 실행
yarn typeorm:run
```
