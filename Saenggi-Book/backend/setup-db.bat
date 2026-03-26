@echo off
REM 거북스쿨 백엔드 PostgreSQL 개발 환경 설정 스크립트 (Windows)

echo 🐘 PostgreSQL Docker 컨테이너 설정 중...
echo.

REM 5432 포트 사용 중인 다른 컨테이너 체크
echo 포트 5432 충돌 확인 중...
for /f "tokens=*" %%i in ('docker ps --filter "publish=5432" -q 2^>nul') do (
    echo 경고: 포트 5432를 사용 중인 다른 컨테이너 발견
    docker ps --filter "publish=5432" --format "{{.Names}}"
    echo 해당 컨테이너를 먼저 중지해주세요: docker stop [컨테이너명]
    pause
    exit /b 1
)

REM 기존 컨테이너 확인 및 제거
docker ps -a | findstr geobuk-postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo 기존 컨테이너 제거 중...
    docker stop geobuk-postgres >nul 2>&1
    docker rm -f geobuk-postgres

    REM 볼륨도 함께 정리 (인증 정보 초기화를 위해 필수)
    echo 이전 데이터 볼륨 정리 중...
    docker volume prune -f >nul 2>&1
)

REM PostgreSQL 컨테이너 실행
echo PostgreSQL 컨테이너 시작 중...
docker run --name geobuk-postgres ^
  -e POSTGRES_PASSWORD=tsuser1234 ^
  -e POSTGRES_USER=tsuser ^
  -e POSTGRES_DB=geobukschool_dev ^
  -p 5432:5432 ^
  -d postgres:14

REM 컨테이너 시작 대기
echo 데이터베이스 초기화 대기 중... (10초)
timeout /t 10 /nobreak >nul

REM 연결 테스트
echo 데이터베이스 연결 테스트...
docker exec geobuk-postgres pg_isready -U tsuser

if %errorlevel% equ 0 (
    REM 실제 인증 테스트 (비밀번호 확인)
    echo 인증 테스트 중...
    docker exec geobuk-postgres psql -U tsuser -d geobukschool_dev -c "SELECT 1;" >nul 2>&1
    if %errorlevel% equ 0 (
        echo.
        echo ✅ PostgreSQL 준비 완료!
        echo    - Host: localhost:5432
        echo    - User: tsuser
        echo    - Database: geobukschool_dev
        echo.
        echo 서버 시작: yarn start:dev
    ) else (
        echo.
        echo ❌ 인증 실패 - 볼륨 정리 후 재시도 필요
        echo 다음 명령어를 실행하세요:
        echo   docker stop geobuk-postgres
        echo   docker rm geobuk-postgres
        echo   docker volume prune -f
        echo   setup-db.bat
    )
) else (
    echo.
    echo ❌ 데이터베이스 연결 실패
    echo Docker Desktop이 실행 중인지 확인하세요.
)

pause
