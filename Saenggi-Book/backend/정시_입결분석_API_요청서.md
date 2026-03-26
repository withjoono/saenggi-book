# 정시 입결분석 API 요청서

## 개요

입결확인 페이지의 "최근 입결 분석" 섹션에서 사용되는 데이터를 제공하는 API입니다.

### 사용 화면
- **페이지**: 입결확인 페이지 (`/explore/jungsi` → 입결확인)
- **섹션**: 최근 입결 분석
- **차트**: 환산점수 입결 그래프, 상위누백 입결 그래프

---

## API 1: 정시 전형 연도별 입결 데이터 조회

### 엔드포인트
```
GET /jungsi/admissions/{admissionId}/previous-results
```

### 요청 헤더
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Path Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| admissionId | number | O | 정시 전형 ID |

### 응답 (성공: 200 OK)
```json
{
  "success": true,
  "data": {
    "admissionId": 1234,
    "universityName": "강남대학교",
    "recruitmentName": "글로벌경영학부",
    "previousResults": [
      {
        "id": 1,
        "year": 2024,
        "recruitmentNumber": 15,
        "competitionRatio": "5.23",
        "additionalAcceptanceRank": 8,
        "convertedScoreTotal": "1000.00",
        "convertedScore50Cut": "876.50",
        "convertedScore70Cut": "854.30",
        "percentile50Cut": "85.20",
        "percentile70Cut": "78.50"
      },
      {
        "id": 2,
        "year": 2023,
        "recruitmentNumber": 18,
        "competitionRatio": "4.89",
        "additionalAcceptanceRank": 10,
        "convertedScoreTotal": "1000.00",
        "convertedScore50Cut": "865.20",
        "convertedScore70Cut": "843.10",
        "percentile50Cut": "83.50",
        "percentile70Cut": "76.20"
      },
      {
        "id": 3,
        "year": 2022,
        "recruitmentNumber": 20,
        "competitionRatio": "5.10",
        "additionalAcceptanceRank": 12,
        "convertedScoreTotal": "1000.00",
        "convertedScore50Cut": "858.80",
        "convertedScore70Cut": "838.50",
        "percentile50Cut": "82.10",
        "percentile70Cut": "74.80"
      }
    ]
  }
}
```

### 응답 필드 설명

#### previousResults 배열
| 필드명 | 타입 | 설명 | 사용처 |
|-------|------|------|--------|
| id | number | 고유 식별자 | - |
| year | number | 입시 년도 | 테이블, 차트 X축 |
| recruitmentNumber | number \| null | 모집인원(최종) | 테이블 |
| competitionRatio | string \| null | 경쟁률 (소수점 2자리) | 테이블 |
| additionalAcceptanceRank | number \| null | 충원합격순위 | 테이블 |
| convertedScoreTotal | string \| null | 환산점수 총점 | 테이블 |
| **convertedScore50Cut** | string \| null | 환산점수 50%컷 | 테이블, **환산점수 입결 그래프** |
| **convertedScore70Cut** | string \| null | 환산점수 70%컷 | 테이블, **환산점수 입결 그래프** |
| **percentile50Cut** | string \| null | 백분위 50%컷 | 테이블, **상위누백 입결 그래프** |
| **percentile70Cut** | string \| null | 백분위 70%컷 | 테이블, **상위누백 입결 그래프** |

---

## 프론트엔드 사용 예시

### 1. 테이블 데이터
```typescript
// 최근 입결 분석 테이블
admission.previousResults.map((item) => ({
  year: item.year,                           // 년도
  recruitmentNumber: item.recruitmentNumber, // 모집인원(최종)
  competitionRatio: item.competitionRatio,   // 경쟁률
  additionalAcceptanceRank: item.additionalAcceptanceRank, // 충원합격순위
  convertedScoreTotal: item.convertedScoreTotal,           // 환산점수총점
  convertedScore50Cut: item.convertedScore50Cut,           // 환산점수 50%컷
  convertedScore70Cut: item.convertedScore70Cut,           // 환산점수 70%컷
  percentile50Cut: item.percentile50Cut,                   // 백분위 50%컷
  percentile70Cut: item.percentile70Cut,                   // 백분위 70%컷
}));
```

### 2. 환산점수 입결 그래프 데이터
```typescript
// Bar Chart with ReferenceLine (내 점수)
const chartData = admission.previousResults.map((item) => ({
  year: item.year,
  cut50: parseFloat(item.convertedScore50Cut),  // 50%컷 막대 (초록)
  cut70: parseFloat(item.convertedScore70Cut),  // 70%컷 막대 (주황)
  myScore: myConvertedScore,                     // 내 환산점수 (가로선)
}));
```

### 3. 상위누백 입결 그래프 데이터
```typescript
// Bar Chart with ReferenceLine (내 백분위)
const chartData = admission.previousResults.map((item) => ({
  year: item.year,
  cut50: parseFloat(item.percentile50Cut),  // 50%컷 막대 (초록)
  cut70: parseFloat(item.percentile70Cut),  // 70%컷 막대 (주황)
  myPercent: myPercentile,                   // 내 상위누백 (가로선)
}));
```

---

## 그래프 시각화 상세

### 환산점수 입결 그래프
```
┌──────────────────────────────────────────┐
│  Legend: ■ 70%컷  ■ 50%컷  ─ 내 점수     │
│                                          │
│  900 ┤                                   │
│      │    ┌─┐ ┌─┐                        │
│  875 ┤────│ │─│ │─────── (내점수 909.50) │ ← ReferenceLine
│      │ ┌─┐│ │ │ │ ┌─┐                    │
│  850 ┤ │ ││ │ │ │ │ │                    │
│      │ │ ││ │ │ │ │ │                    │
│  825 ┤ │ ││ │ │ │ │ │                    │
│      └─┴─┴┴─┴─┴─┴─┴─┴────────────────────│
│       2022  2023  2024                   │
└──────────────────────────────────────────┘
```

### 상위누백 입결 그래프
```
┌──────────────────────────────────────────┐
│  Legend: ■ 70%컷  ■ 50%컷  ─ 내 백분위   │
│                                          │
│  90% ┤                                   │
│      │    ┌─┐ ┌─┐                        │
│  85% ┤────│ │─│ │─────── (내 백분위 87%) │ ← ReferenceLine
│      │ ┌─┐│ │ │ │ ┌─┐                    │
│  80% ┤ │ ││ │ │ │ │ │                    │
│      │ │ ││ │ │ │ │ │                    │
│  75% ┤ │ ││ │ │ │ │ │                    │
│      └─┴─┴┴─┴─┴─┴─┴─┴────────────────────│
│       2022  2023  2024                   │
└──────────────────────────────────────────┘
```

---

## 현재 상태 및 요청사항

### 현재 상태
- `previousResults` 데이터는 정시 전형 상세 조회 API (`GET /explore/regular/{id}`)에 포함되어 있음
- `IRegularAdmissionDetail.previousResults`로 타입 정의됨

### 요청사항
1. **데이터 정확성 확인**: 각 년도별 입결 데이터가 정확하게 저장되어 있는지 확인
2. **누락 데이터**: 일부 전형에 `previousResults`가 비어있는 경우가 있음 → 데이터 보완 필요
3. **환산점수 총점**: `convertedScoreTotal` 필드가 각 전형별 총점과 일치하는지 확인

---

## TypeScript 인터페이스 (현재)

```typescript
// src/stores/server/features/jungsi/interfaces.ts

export interface IRegularAdmissionDetail extends IRegularAdmission {
  previousResults: {
    id: number;
    year: number;
    minCut: string | null;              // 최초합컷
    maxCut: string | null;              // 추합컷
    competitionRatio: string | null;    // 경쟁률
    percent: string | null;             // 최초누백
    recruitmentNumber: number | null;   // 모집인원(최종)
    additionalAcceptanceRank: number | null;  // 충원합격순위
    convertedScoreTotal: string | null;       // 환산점수총점
    convertedScore50Cut: string | null;       // 환산점수 50%컷
    convertedScore70Cut: string | null;       // 환산점수 70%컷
    percentile50Cut: string | null;           // 백분위 50%컷
    percentile70Cut: string | null;           // 백분위 70%컷
  }[];
}
```

---

## 에러 응답

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
    "message": "해당 전형을 찾을 수 없습니다."
  }
}
```
