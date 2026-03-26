# 모의지원 분석 API 요청서

## 개요

정시 모의지원 페이지에서 사용되는 **도수분포표**와 **정규분포표(지원현황 차트)** 데이터를 제공하는 API입니다.

### 목적
- **웹앱**과 **하이브리드 앱** 모두에서 동일한 분석 데이터 사용
- 프론트엔드 계산 로직을 백엔드로 이전하여 일관성 보장
- 코드 중복 제거 및 유지보수 용이성 향상

### 사용 화면
- **웹앱**: 정시 모의지원 리포트 페이지 (`/explore/jungsi/mock-apply`)
- **하이브리드 앱**: 모의지원 앱 (동일 기능)

---

## API 1: 모의지원 분석 데이터 조회

### 엔드포인트
```
POST /jungsi/mock-application/analysis
```

### 요청 헤더
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### 요청 본문 (Request Body)
```json
{
  "universityCode": "101",
  "universityName": "강남대학교",
  "recruitmentUnit": "글로벌경영학부",
  "admissionType": "가",
  "myScore": 876.5
}
```

### 요청 필드 설명
| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| universityCode | string | O | 대학 코드 |
| universityName | string | O | 대학명 (매칭에 사용) |
| recruitmentUnit | string | O | 모집단위(학과명) |
| admissionType | string | X | 군 (가/나/다) - 참고용 |
| myScore | number | X | 내 환산점수 (위치 표시용) |

---

### 응답 (성공: 200 OK)
```json
{
  "success": true,
  "data": {
    "basicInfo": {
      "universityCode": "101",
      "universityName": "강남대학교",
      "admissionType": "가군",
      "recruitmentUnit": "글로벌경영학부",
      "recruitmentCount": 15,
      "competitionRate": 5.23,
      "additionalPassRank": 8,
      "totalPassCount": 23,
      "mockApplicantCount": 78
    },
    "statistics": {
      "mean": 854.32,
      "stdDev": 28.45,
      "min": 780.5,
      "max": 920.3,
      "safePassThreshold": 876.5,
      "passThreshold": 854.0
    },
    "frequencyDistribution": [
      {
        "scoreLower": 915.0,
        "scoreUpper": 920.0,
        "applicantCount": 2,
        "cumulativeCount": 2,
        "passStatus": "안정합격"
      },
      {
        "scoreLower": 910.0,
        "scoreUpper": 915.0,
        "applicantCount": 3,
        "cumulativeCount": 5,
        "passStatus": "안정합격"
      },
      {
        "scoreLower": 905.0,
        "scoreUpper": 910.0,
        "applicantCount": 5,
        "cumulativeCount": 10,
        "passStatus": "안정합격"
      }
    ],
    "normalDistributionCurve": {
      "xMin": 740.52,
      "xMax": 968.12,
      "points": [
        { "x": 740.52, "y": 0.0001 },
        { "x": 750.00, "y": 0.0005 },
        { "x": 760.00, "y": 0.0015 }
      ]
    },
    "myScoreAnalysis": {
      "score": 876.5,
      "rank": 15,
      "percentile": 80.77,
      "passStatus": "안정합격",
      "scoreRange": {
        "scoreLower": 875.0,
        "scoreUpper": 880.0
      },
      "comparedToMean": 22.18
    }
  }
}
```

---

### 응답 필드 설명

#### basicInfo (기본 정보)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| universityCode | string | 대학 코드 |
| universityName | string | 대학명 |
| admissionType | string | 군 (가군/나군/다군) |
| recruitmentUnit | string | 모집단위(학과명) |
| recruitmentCount | number | 모집인원 |
| competitionRate | number | 경쟁률 |
| additionalPassRank | number | 추가합격순위 |
| totalPassCount | number | 총 합격자 수 |
| mockApplicantCount | number | 모의지원자 수 |

#### statistics (통계 정보)
| 필드명 | 타입 | 설명 | 사용처 |
|--------|------|------|--------|
| mean | number | 평균 점수 | 정규분포표 평균선 |
| stdDev | number | 표준편차 | 정규분포 곡선 계산 |
| min | number | 최저 점수 | 차트 X축 범위 |
| max | number | 최고 점수 | 차트 X축 범위 |
| safePassThreshold | number \| null | 안정합격 기준점 | 안정합격 영역 표시 |
| passThreshold | number \| null | 합격 기준점 | 합격가능 영역 표시 |

#### frequencyDistribution (도수분포표)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| scoreLower | number | 점수 구간 하한 |
| scoreUpper | number | 점수 구간 상한 |
| applicantCount | number | 해당 구간 지원자 수 |
| cumulativeCount | number | 누적 인원 (높은 점수부터) |
| passStatus | string | 합격 상태 (안정합격/추가합격/합격가능/불합격) |

#### normalDistributionCurve (정규분포 곡선) - 선택적
| 필드명 | 타입 | 설명 |
|--------|------|------|
| xMin | number | X축 최소값 |
| xMax | number | X축 최대값 |
| points | array | 곡선 좌표 배열 [{x, y}] |

#### myScoreAnalysis (내 점수 분석) - myScore 입력 시
| 필드명 | 타입 | 설명 |
|--------|------|------|
| score | number | 내 점수 |
| rank | number | 예상 등수 |
| percentile | number | 백분위 |
| passStatus | string | 합격 예측 (안정합격/합격가능/불합격 위험) |
| scoreRange | object | 내 점수가 속한 구간 |
| comparedToMean | number | 평균 대비 점수 차이 |

---

## API 2: 도수분포표 구간폭 재계산 (선택적)

프론트엔드에서 구간폭을 변경할 때 사용합니다.

### 엔드포인트
```
POST /jungsi/mock-application/analysis/aggregate
```

### 요청 본문
```json
{
  "universityCode": "101",
  "universityName": "강남대학교",
  "recruitmentUnit": "글로벌경영학부",
  "intervalSize": 10
}
```

### 요청 필드
| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| universityCode | string | O | 대학 코드 |
| universityName | string | O | 대학명 |
| recruitmentUnit | string | O | 모집단위 |
| intervalSize | number | O | 구간폭 (1, 2, 5, 10, 20 등) |

### 응답
```json
{
  "success": true,
  "data": {
    "intervalSize": 10,
    "frequencyDistribution": [
      {
        "scoreLower": 910.0,
        "scoreUpper": 920.0,
        "applicantCount": 5,
        "cumulativeCount": 5,
        "passStatus": "안정합격"
      },
      {
        "scoreLower": 900.0,
        "scoreUpper": 910.0,
        "applicantCount": 8,
        "cumulativeCount": 13,
        "passStatus": "안정합격"
      }
    ]
  }
}
```

---

## 데이터 흐름 및 계산 로직

### 1. 도수분포표 계산 로직
```typescript
// 백엔드에서 구현해야 할 로직

function calculateFrequencyDistribution(
  applicants: Applicant[],
  intervalSize: number = 5
): FrequencyDistributionItem[] {
  // 1. 점수 범위 계산
  const scores = applicants.map(a => a.score);
  const min = Math.floor(Math.min(...scores) / intervalSize) * intervalSize;
  const max = Math.ceil(Math.max(...scores) / intervalSize) * intervalSize;

  // 2. 구간별 집계
  const bins = new Map<number, { count: number; statuses: Map<string, number> }>();
  for (let start = min; start < max; start += intervalSize) {
    bins.set(start, { count: 0, statuses: new Map() });
  }

  applicants.forEach(a => {
    const binStart = Math.floor(a.score / intervalSize) * intervalSize;
    const bin = bins.get(binStart);
    if (bin) {
      bin.count++;
      const statusCount = bin.statuses.get(a.passStatus) || 0;
      bin.statuses.set(a.passStatus, statusCount + 1);
    }
  });

  // 3. 누적 계산 (높은 점수부터)
  const sortedBins = Array.from(bins.entries()).sort((a, b) => b[0] - a[0]);
  let cumulative = 0;

  return sortedBins
    .filter(([_, bin]) => bin.count > 0)
    .map(([binStart, bin]) => {
      cumulative += bin.count;

      // 가장 많은 합격상태 결정
      let dominantStatus = "불합격";
      let maxCount = 0;
      bin.statuses.forEach((count, status) => {
        if (count > maxCount) {
          maxCount = count;
          dominantStatus = status;
        }
      });

      return {
        scoreLower: binStart,
        scoreUpper: binStart + intervalSize,
        applicantCount: bin.count,
        cumulativeCount: cumulative,
        passStatus: dominantStatus
      };
    });
}
```

### 2. 통계 계산 로직
```typescript
function calculateStatistics(scores: number[]): Statistics {
  const n = scores.length;
  if (n === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };

  const mean = scores.reduce((sum, s) => sum + s, 0) / n;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...scores);
  const max = Math.max(...scores);

  return { mean, stdDev, min, max };
}
```

### 3. 합격 기준선 계산
```typescript
function calculatePassThresholds(applicants: Applicant[]): {
  safePassThreshold: number | null;
  passThreshold: number | null;
} {
  const passApplicants = applicants.filter(
    a => ["안정합격", "추가합격", "합격가능"].includes(a.passStatus)
  );
  const safePassApplicants = applicants.filter(
    a => a.passStatus === "안정합격"
  );

  return {
    passThreshold: passApplicants.length > 0
      ? Math.min(...passApplicants.map(a => a.score))
      : null,
    safePassThreshold: safePassApplicants.length > 0
      ? Math.min(...safePassApplicants.map(a => a.score))
      : null
  };
}
```

### 4. 정규분포 확률밀도함수 (선택적 - 프론트엔드에서 계산 가능)
```typescript
function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return x === mean ? 1 : 0;
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
  return coefficient * Math.exp(exponent);
}
```

---

## 프론트엔드 사용 예시

### 1. API 호출
```typescript
// src/stores/server/features/jungsi/mock-application-api.ts

import { authClient } from '@/lib/api';

export interface MockApplicationAnalysisRequest {
  universityCode: string;
  universityName: string;
  recruitmentUnit: string;
  admissionType?: string;
  myScore?: number;
}

export interface MockApplicationAnalysisResponse {
  basicInfo: MockApplicationBasicInfo;
  statistics: Statistics;
  frequencyDistribution: FrequencyDistributionItem[];
  normalDistributionCurve?: NormalDistributionCurve;
  myScoreAnalysis?: MyScoreAnalysis;
}

export async function getMockApplicationAnalysis(
  params: MockApplicationAnalysisRequest
): Promise<MockApplicationAnalysisResponse> {
  const response = await authClient.post(
    '/jungsi/mock-application/analysis',
    params
  );
  return response.data.data;
}
```

### 2. React Query Hook
```typescript
// src/stores/server/features/jungsi/use-mock-application-analysis.ts

import { useQuery } from '@tanstack/react-query';
import { getMockApplicationAnalysis, MockApplicationAnalysisRequest } from './mock-application-api';

export function useMockApplicationAnalysis(params: MockApplicationAnalysisRequest) {
  return useQuery({
    queryKey: ['mockApplicationAnalysis', params],
    queryFn: () => getMockApplicationAnalysis(params),
    enabled: !!params.universityCode && !!params.recruitmentUnit,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
```

### 3. 컴포넌트 사용
```typescript
// 기존 useMockApplicationData 훅 대체

const { data, isLoading, error } = useMockApplicationAnalysis({
  universityCode,
  universityName,
  recruitmentUnit,
  admissionType,
  myScore,
});

if (data) {
  const { basicInfo, statistics, frequencyDistribution, myScoreAnalysis } = data;
  // 차트 및 테이블 렌더링
}
```

---

## 에러 응답

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "C400",
    "message": "필수 파라미터가 누락되었습니다."
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "C401",
    "message": "인증이 필요합니다."
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "C404",
    "message": "해당 대학/모집단위의 모의지원 데이터가 없습니다."
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "C500",
    "message": "서버 오류가 발생했습니다."
  }
}
```

---

## 데이터베이스 스키마 (참고)

### 모의지원 데이터 테이블
```sql
CREATE TABLE mock_applications (
  id SERIAL PRIMARY KEY,
  university_code VARCHAR(10) NOT NULL,
  university_name VARCHAR(100) NOT NULL,
  admission_type VARCHAR(10),  -- 가/나/다군
  recruitment_unit VARCHAR(200) NOT NULL,
  applicant_rank INT NOT NULL,
  score DECIMAL(10, 2) NOT NULL,
  pass_status VARCHAR(20) NOT NULL,  -- 안정합격/추가합격/합격가능/불합격
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_mock_app_university ON mock_applications(university_code, recruitment_unit);
```

### 모의지원 기본정보 테이블
```sql
CREATE TABLE mock_application_info (
  id SERIAL PRIMARY KEY,
  university_code VARCHAR(10) NOT NULL,
  university_name VARCHAR(100) NOT NULL,
  admission_type VARCHAR(10),
  recruitment_unit VARCHAR(200) NOT NULL,
  recruitment_count INT,
  competition_rate DECIMAL(5, 2),
  additional_pass_rank INT,
  total_pass_count INT,
  mock_applicant_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(university_code, recruitment_unit)
);
```

---

## 마이그레이션 계획

### Phase 1: 백엔드 API 구현
1. NestJS에서 `/jungsi/mock-application/analysis` API 구현
2. 기존 JSON 파일 데이터를 DB로 마이그레이션
3. 계산 로직 백엔드 이전

### Phase 2: 프론트엔드 연동
1. 새 API 호출 훅 생성 (`useMockApplicationAnalysis`)
2. 기존 `useMockApplicationData` 훅 deprecated 처리
3. 컴포넌트에서 새 훅 사용하도록 점진적 마이그레이션

### Phase 3: 정리
1. 기존 JSON 파일 데이터 삭제 (`/public/data/mock-application-data.json`)
2. 기존 `useMockApplicationData` 훅 삭제
3. 프론트엔드 계산 로직 함수 삭제

---

## TypeScript 인터페이스 정의

```typescript
// src/stores/server/features/jungsi/mock-application-types.ts

export interface MockApplicationBasicInfo {
  universityCode: string;
  universityName: string;
  admissionType: string;
  recruitmentUnit: string;
  recruitmentCount: number;
  competitionRate: number;
  additionalPassRank: number;
  totalPassCount: number;
  mockApplicantCount: number;
}

export interface Statistics {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  safePassThreshold: number | null;
  passThreshold: number | null;
}

export interface FrequencyDistributionItem {
  scoreLower: number;
  scoreUpper: number;
  applicantCount: number;
  cumulativeCount: number;
  passStatus: string;
}

export interface NormalDistributionPoint {
  x: number;
  y: number;
}

export interface NormalDistributionCurve {
  xMin: number;
  xMax: number;
  points: NormalDistributionPoint[];
}

export interface MyScoreAnalysis {
  score: number;
  rank: number;
  percentile: number;
  passStatus: string;
  scoreRange: {
    scoreLower: number;
    scoreUpper: number;
  };
  comparedToMean: number;
}

export interface MockApplicationAnalysisResponse {
  basicInfo: MockApplicationBasicInfo;
  statistics: Statistics;
  frequencyDistribution: FrequencyDistributionItem[];
  normalDistributionCurve?: NormalDistributionCurve;
  myScoreAnalysis?: MyScoreAnalysis;
}
```

---

## 작성일
- 2024-12-09

## 작성자
- Claude Code (프론트엔드 분석 기반)
