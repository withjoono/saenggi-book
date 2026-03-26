# 경쟁률 데이터 Import 가이드

경쟁률 데이터를 Excel 파일로 업데이트하는 방법을 설명합니다.

## 목차

1. [Excel 파일 준비](#excel-파일-준비)
2. [스크립트 실행](#스크립트-실행)
3. [결과 확인](#결과-확인)
4. [문제 해결](#문제-해결)

---

## Excel 파일 준비

### 필수 컬럼

Excel 파일에는 다음 컬럼이 반드시 포함되어야 합니다:

#### 식별 컬럼 (둘 중 하나 필수)

**방법 1: unified_id 사용 (권장)**
- `unified_id` 또는 `id`: 통합 아이디 (예: U0094121)

**방법 2: 대학명 + 모집단위명 조합**
- `대학명`: 대학교 이름 (예: 서울대학교)
- `모집단위명`: 모집단위 이름 (예: 컴퓨터공학과)
- `전형명` (선택): 전형 이름 (동일한 대학/모집단위에 여러 전형이 있는 경우)

#### 경쟁률 컬럼 (하나 이상 필수)

- `2024학년도경쟁률`: 2024년도 경쟁률
- `2023학년도경쟁률`: 2023년도 경쟁률
- `2022학년도경쟁률`: 2022년도 경쟁률
- `2021학년도경쟁률`: 2021년도 경쟁률
- `2020학년도경쟁률`: 2020년도 경쟁률

### Excel 파일 예시

#### 예시 1: unified_id 사용

| unified_id | 2024학년도경쟁률 | 2023학년도경쟁률 | 2022학년도경쟁률 |
|------------|------------------|------------------|------------------|
| U0094121   | 5.5:1            | 4.8:1            | 6.2:1            |
| U0094122   | 3.2              | 3.5              | 3.1              |
| U0094123   | 7.8:1            | 8.1:1            | 7.5:1            |

#### 예시 2: 대학명 + 모집단위명 사용

| 대학명     | 모집단위명     | 전형명      | 2024학년도경쟁률 | 2023학년도경쟁률 |
|------------|----------------|-------------|------------------|------------------|
| 서울대학교 | 컴퓨터공학과   | 일반전형    | 5.5:1            | 4.8:1            |
| 연세대학교 | 경영학과       | 학생부종합  | 3.2              | 3.5              |
| 고려대학교 | 전기전자공학부 | 일반전형    | 7.8:1            | 8.1:1            |

### 경쟁률 형식

경쟁률은 다음 형식을 지원합니다:
- `5.5:1` (비율 형태)
- `5.5` (숫자만)
- `3.2:1` (소수점 포함 비율)

스크립트가 자동으로 숫자 부분만 추출하여 저장합니다.

### 빈 값 처리

다음 값들은 무시됩니다:
- 빈 셀
- `-` (하이픈)
- `N`
- `#N/A`

---

## 스크립트 실행

### 1. 환경 준비

```bash
# 프로젝트 루트 디렉토리로 이동
cd E:\Dev\github\Susi\susi-back

# 의존성 설치 (처음 한 번만)
yarn install
```

### 2. 데이터베이스 실행

```bash
# Docker PostgreSQL 시작
setup-db.bat  # Windows
# 또는
./setup-db.sh  # Linux/Mac
```

### 3. 스크립트 실행

```bash
# 방법 1: ts-node로 직접 실행 (권장)
ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts <엑셀파일경로>

# 방법 2: yarn을 통한 실행
yarn ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts <엑셀파일경로>
```

### 실행 예시

```bash
# 예시 1: 절대 경로
ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts "C:\Users\Admin\Downloads\경쟁률데이터_2024.xlsx"

# 예시 2: 상대 경로
ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts "./data/competition-rates.xlsx"
```

---

## 결과 확인

### 정상 실행 시 출력 예시

```
📊 경쟁률 데이터 Import 시작
파일: C:\Users\Admin\Downloads\경쟁률데이터_2024.xlsx

1️⃣ Excel 파일 읽기...
   ✅ 1250개 레코드 읽기 완료

2️⃣ 데이터베이스 연결...
   ✅ 데이터베이스 연결 완료

3️⃣ 경쟁률 데이터 업데이트 중...
   [1/1250] U0094121... ✅
   [2/1250] U0094122... ✅
   [3/1250] 서울대학교 - 컴퓨터공학과... ✅
   [4/1250] U0094124... ❌ 미발견
   ...
   [1250/1250] U0095370... ✅

4️⃣ 완료!

📈 업데이트 통계:
   전체: 1250
   수시교과(SuSiSubject): 850
   수시종합(SusiComprehensive): 750
   모집단위(RecruitmentUnit): 900
   미발견: 50
   오류: 0
```

### 통계 항목 설명

- **전체**: Excel 파일에서 읽은 총 레코드 수
- **수시교과(SuSiSubject)**: 수시 교과 테이블 업데이트 건수
- **수시종합(SusiComprehensive)**: 수시 종합 테이블 업데이트 건수
- **모집단위(RecruitmentUnit)**: 모집단위 이전 결과 테이블 업데이트 건수
- **미발견**: 데이터베이스에서 매칭되는 레코드를 찾지 못한 건수
- **오류**: 처리 중 오류가 발생한 건수

> **참고**: 한 Excel 레코드가 여러 테이블에 동시에 업데이트될 수 있으므로,
> 각 테이블의 업데이트 건수 합이 전체 레코드 수보다 클 수 있습니다.

---

## 문제 해결

### 1. "파일을 찾을 수 없습니다" 오류

**원인**: Excel 파일 경로가 잘못되었습니다.

**해결방법**:
```bash
# 경로에 공백이 있는 경우 따옴표로 감싸기
ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts "C:\Users\Admin\My Documents\data.xlsx"

# 절대 경로 사용 권장
# 현재 디렉토리 확인
pwd
```

### 2. "데이터베이스 연결 실패" 오류

**원인**: PostgreSQL이 실행 중이지 않거나 환경 변수가 잘못되었습니다.

**해결방법**:
```bash
# 1. Docker 컨테이너 확인
docker ps | findstr postgres

# 2. PostgreSQL 시작
setup-db.bat

# 3. 환경 변수 확인
# .env.development 파일 확인
DB_HOST=localhost
DB_PORT=5432
DB_USER=tsuser
DB_PASSWORD=tsuser1234
DB_NAME=geobukschool_dev
```

### 3. "미발견" 레코드가 많은 경우

**원인**: Excel 데이터와 데이터베이스의 식별자가 일치하지 않습니다.

**해결방법**:
1. **unified_id 확인**
   - Excel의 `unified_id`가 데이터베이스의 값과 정확히 일치하는지 확인
   - 대소문자, 공백, 특수문자 확인

2. **대학명/모집단위명 확인**
   - 데이터베이스에 저장된 정확한 이름 확인:
   ```sql
   SELECT DISTINCT university_name FROM susi_subject_tb ORDER BY university_name;
   SELECT DISTINCT recruitment_unit_name FROM susi_subject_tb ORDER BY recruitment_unit_name;
   ```
   - Excel의 이름이 데이터베이스와 정확히 일치하도록 수정

3. **전형명 추가**
   - 동일한 대학/모집단위에 여러 전형이 있는 경우 `전형명` 컬럼 추가

### 4. 특정 레코드만 업데이트하고 싶은 경우

**방법 1**: Excel 파일에서 해당 레코드만 남기고 삭제

**방법 2**: 조건부 업데이트를 위한 스크립트 수정
```typescript
// scripts/import-competition-rates.ts 파일에서
// 특정 대학만 업데이트하도록 필터 추가
const competitionRates = readCompetitionRatesFromExcel(filePath)
  .filter(row => row.university_name === '서울대학교');
```

### 5. 백업 및 롤백

**백업 (실행 전 권장)**:
```bash
# PostgreSQL 백업
docker exec geobuk-postgres pg_dump -U tsuser geobukschool_dev > backup_$(date +%Y%m%d).sql
```

**롤백**:
```bash
# 백업 복원
docker exec -i geobuk-postgres psql -U tsuser geobukschool_dev < backup_20240101.sql
```

---

## 고급 사용법

### 1. 특정 테이블만 업데이트

스크립트를 수정하여 특정 테이블만 업데이트할 수 있습니다:

```typescript
// SuSiSubjectEntity만 업데이트
const susiSubjectUpdated = await updateSusiSubject(dataSource, row);

// SusiComprehensiveEntity 업데이트 주석 처리
// const susiComprehensiveUpdated = await updateSusiComprehensive(dataSource, row);

// RecruitmentUnitPreviousResultEntity 업데이트 주석 처리
// const recruitmentUnitUpdated = await updateRecruitmentUnitPreviousResults(dataSource, row);
```

### 2. 대용량 파일 처리

대용량 Excel 파일(10,000+ 레코드)을 처리할 때는 청크 단위로 처리:

```typescript
// 스크립트 수정 예시
const CHUNK_SIZE = 100;
for (let i = 0; i < competitionRates.length; i += CHUNK_SIZE) {
  const chunk = competitionRates.slice(i, i + CHUNK_SIZE);

  // 청크별 처리
  await Promise.all(chunk.map(row => updateAllTables(dataSource, row)));

  console.log(`   처리 완료: ${i + chunk.length}/${competitionRates.length}`);
}
```

### 3. 로그 파일 생성

처리 결과를 파일로 저장:

```bash
ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts data.xlsx > import_log_$(date +%Y%m%d_%H%M%S).txt 2>&1
```

---

## 참고 사항

### 업데이트되는 데이터베이스 테이블

1. **susi_subject_tb** (수시 교과)
   - competition_rate_2024
   - competition_rate_2023
   - competition_rate_2022
   - competition_rate_2021
   - competition_rate_2020

2. **susi_comprehensive_tb** (수시 종합)
   - competition_rate_2024
   - competition_rate_2023
   - competition_rate_2022
   - competition_rate_2021
   - competition_rate_2020

3. **ts_recruitment_unit_previous_results** (모집단위 이전 결과)
   - year (연도별 레코드 생성/업데이트)
   - competition_ratio (경쟁률)

### 성능 고려사항

- **소요 시간**: 1,000개 레코드 기준 약 1-2분
- **메모리 사용**: Excel 파일 크기의 약 3-5배
- **데이터베이스 부하**: 레코드당 평균 3-6개의 SELECT/UPDATE 쿼리 실행

### 주의사항

⚠️ **프로덕션 환경에서 실행 시 주의사항**:
1. 반드시 백업 생성
2. 사용량이 적은 시간대에 실행
3. 테스트 환경에서 먼저 검증
4. 롤백 계획 수립

---

## 문의 및 지원

문제가 지속되거나 추가 기능이 필요한 경우:
- GitHub Issues 생성
- 개발팀에 문의

---

**마지막 업데이트**: 2024-01-06
