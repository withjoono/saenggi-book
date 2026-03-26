# 경쟁률 데이터 Import 스크립트

Excel 파일을 사용하여 경쟁률 데이터를 데이터베이스에 업데이트하는 스크립트입니다.

## 빠른 시작

### 1. 샘플 Excel 파일 생성

```bash
cd E:\Dev\github\Susi\susi-back

# 샘플 파일 생성
ts-node scripts/generate-sample-competition-excel.ts

# 또는 파일명 지정
ts-node scripts/generate-sample-competition-excel.ts my-competition-data.xlsx
```

생성된 Excel 파일을 열어 실제 데이터로 편집합니다.

### 2. 데이터베이스에 Import

```bash
# 데이터베이스가 실행 중인지 확인
docker ps | findstr postgres

# Import 실행
ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts competition-rate-sample_2024-01-06.xlsx
```

## 파일 구조

```
scripts/
├── import-competition-rates.ts           # 경쟁률 import 메인 스크립트
├── generate-sample-competition-excel.ts   # 샘플 Excel 생성 스크립트
└── README_COMPETITION_IMPORT.md          # 이 파일

docs/
└── competition-rate-import-guide.md      # 상세 가이드
```

## Excel 파일 형식

### 필수 컬럼

#### 방법 1: unified_id 사용 (권장)
- `unified_id` 또는 `id`

#### 방법 2: 대학명 + 모집단위명
- `대학명`
- `모집단위명`
- `전형명` (선택)

### 경쟁률 컬럼 (하나 이상 필수)
- `2024학년도경쟁률`
- `2023학년도경쟁률`
- `2022학년도경쟁률`
- `2021학년도경쟁률`
- `2020학년도경쟁률`

### Excel 예시

| unified_id | 대학명 | 모집단위명 | 2024학년도경쟁률 | 2023학년도경쟁률 |
|------------|--------|------------|------------------|------------------|
| U0094121   | 서울대학교 | 컴퓨터공학과 | 5.5:1 | 4.8:1 |

## 주요 기능

✅ 여러 테이블 동시 업데이트
- SuSiSubjectEntity (수시 교과)
- SusiComprehensiveEntity (수시 종합)
- RecruitmentUnitPreviousResultEntity (모집단위 이전 결과)

✅ 유연한 식별자 매칭
- unified_id로 정확한 매칭
- 대학명 + 모집단위명으로 유연한 매칭

✅ 다양한 경쟁률 형식 지원
- "5.5:1" (비율)
- "5.5" (숫자)
- 자동 파싱 및 정규화

✅ 상세한 진행 상황 표시
- 실시간 처리 현황
- 업데이트 통계
- 오류 및 미발견 레코드 추적

## 업데이트 통계 예시

```
📈 업데이트 통계:
   전체: 1250
   수시교과(SuSiSubject): 850
   수시종합(SusiComprehensive): 750
   모집단위(RecruitmentUnit): 900
   미발견: 50
   오류: 0
```

## 문제 해결

### 파일을 찾을 수 없음
```bash
# 절대 경로 사용
ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts "C:\Users\Admin\Downloads\data.xlsx"
```

### 데이터베이스 연결 실패
```bash
# PostgreSQL 시작
setup-db.bat

# 환경 변수 확인
cat .env.development
```

### 미발견 레코드가 많음
- Excel의 `unified_id` 또는 `대학명`, `모집단위명`이 정확한지 확인
- 공백, 특수문자, 대소문자 확인

## 백업 및 롤백

### 백업 생성 (권장)
```bash
docker exec geobuk-postgres pg_dump -U tsuser geobukschool_dev > backup_$(date +%Y%m%d).sql
```

### 롤백
```bash
docker exec -i geobuk-postgres psql -U tsuser geobukschool_dev < backup_20240106.sql
```

## 상세 가이드

전체 가이드는 [docs/competition-rate-import-guide.md](../docs/competition-rate-import-guide.md)를 참조하세요.

## 지원

문제가 발생하거나 기능 요청이 있으면 GitHub Issues에 등록해주세요.
