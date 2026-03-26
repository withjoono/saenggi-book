#!/bin/bash
# 거북스쿨 백엔드 PostgreSQL 개발 환경 설정 스크립트

echo "🐘 PostgreSQL Docker 컨테이너 설정 중..."

# 기존 컨테이너 확인 및 제거
if docker ps -a | grep -q geobuk-postgres; then
    echo "기존 컨테이너 제거 중..."
    docker rm -f geobuk-postgres
fi

# PostgreSQL 컨테이너 실행
echo "PostgreSQL 컨테이너 시작 중..."
docker run --name geobuk-postgres \
  -e POSTGRES_PASSWORD=tsuser1234 \
  -e POSTGRES_USER=tsuser \
  -e POSTGRES_DB=geobukschool_dev \
  -p 5432:5432 \
  -d postgres:14

# 컨테이너 시작 대기
echo "데이터베이스 초기화 대기 중... (10초)"
sleep 10

# 연결 테스트
echo "데이터베이스 연결 테스트..."
docker exec geobuk-postgres pg_isready -U tsuser

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL 준비 완료!"
    echo ""
    echo "다음 명령어를 실행하세요:"
    echo "1. yarn start:dev  # 서버 시작 (스키마 자동 생성)"
    echo "2. Ctrl+C로 서버 종료"
    echo "3. .env.development에서 DB_SYNCHRONIZE=false로 변경"
    echo "4. yarn typeorm migration:generate -n InitialSchema"
    echo "5. yarn start:dev  # 서버 재시작"
else
    echo "❌ 데이터베이스 연결 실패"
    echo "Docker Desktop이 실행 중인지 확인하세요."
fi
