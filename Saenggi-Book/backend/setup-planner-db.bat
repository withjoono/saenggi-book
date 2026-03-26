@echo off
chcp 65001 > nul
echo =====================================================
echo 플래너 전용 개발 DB 설정
echo =====================================================

set PGHOST=127.0.0.1
set PGPORT=5432
set PGUSER=tsuser
set PGPASSWORD=tsuser1234

echo.
echo [1/2] planner_dev 데이터베이스 생성 중...
psql -c "CREATE DATABASE planner_dev WITH OWNER = tsuser ENCODING = 'UTF8' TEMPLATE = template0;" 2>nul
if %errorlevel% neq 0 (
    echo 데이터베이스가 이미 존재하거나 생성에 실패했습니다.
) else (
    echo 데이터베이스 생성 완료!
)

echo.
echo [2/2] 테이블 생성 및 초기화 중...
psql -d planner_dev -f scripts/setup-planner-db.sql

echo.
echo =====================================================
echo 설정 완료!
echo.
echo 플래너 서버 실행: npm run start:planner
echo 포트: 4002
echo DB: planner_dev
echo =====================================================
pause




