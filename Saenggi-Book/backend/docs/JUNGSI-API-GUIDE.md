# 정시 환산점수 API 가이드

## 개요

정시 환산점수 계산 로직이 백엔드로 이전되었습니다. 프론트엔드에서는 더 이상 로컬에서 계산하지 않고, API를 통해 환산점수를 요청합니다.

### 변경 사항

**기존 (프론트엔드)**
- 모든 환산식 코드가 프론트엔드에 포함됨
- F12 개발자 도구로 환산 공식 노출 가능
- 매 로그인시마다 모든 대학 환산점수 계산

**변경 후 (백엔드)**
- 환산식 코드는 서버에만 존재
- F12로 환산 공식 확인 불가
- 계산된 점수는 DB에 저장되어 재사용
- 모의고사 점수 변경 시에만 재계산

---

## API 엔드포인트

**Base URL**: `/jungsi`
**인증**: JWT Bearer Token 필수 (모든 엔드포인트)

---

### 1. 환산점수 계산 및 저장

`POST /jungsi/calculate`

모의고사 점수를 기반으로 모든 대학의 환산점수를 계산하고 DB에 저장합니다.

#### Request Body

```typescript
interface CalculateScoresRequest {
  mockExamScores: MockExamScoreInput[];
  universityIds?: number[]; // 선택적: 특정 대학만 계산
}

interface MockExamScoreInput {
  subjectCategory: 'kor' | 'math' | 'eng' | 'history' | 'society' | 'science' | 'lang';
  subjectName: string;       // "국어", "수학", "영어", "한국사", "물리1", "화학2" 등
  standardScore: string;     // 표준점수 (문자열)
  grade: number;             // 등급 (1-9)
  percentile: number;        // 백분위
}
```

#### Response

```typescript
interface CalculateScoresResponse {
  memberId: number;
  calculatedAt: Date;
  totalUniversities: number;
  successCount: number;
  failedCount: number;
  scores: UniversityCalculatedScore[];
}

interface UniversityCalculatedScore {
  universityId: number;
  universityName: string;
  scoreCalculation: string;  // 환산식 코드명 (ex: "서울대인문")
  major: string;             // 계열 (인문/자연)
  success: boolean;
  result?: string;           // 실패 시 사유 (ex: "미적기하필수", "확통필수")
  convertedScore?: number;   // 환산점수
  standardScoreSum?: number; // 표점합
  calculatedAt: Date;
}
```

#### Example

```typescript
// 요청
const response = await fetch('/jungsi/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    mockExamScores: [
      { subjectCategory: 'kor', subjectName: '국어', standardScore: '131', grade: 2, percentile: 93 },
      { subjectCategory: 'math', subjectName: '미적분', standardScore: '140', grade: 1, percentile: 98 },
      { subjectCategory: 'eng', subjectName: '영어', standardScore: '', grade: 1, percentile: 100 },
      { subjectCategory: 'history', subjectName: '한국사', standardScore: '', grade: 2, percentile: 0 },
      { subjectCategory: 'science', subjectName: '물리1', standardScore: '67', grade: 2, percentile: 90 },
      { subjectCategory: 'science', subjectName: '화학2', standardScore: '68', grade: 2, percentile: 88 },
    ]
  })
});

// 응답
{
  "memberId": 123,
  "calculatedAt": "2024-12-01T12:00:00Z",
  "totalUniversities": 488,
  "successCount": 450,
  "failedCount": 38,
  "scores": [
    {
      "universityId": 1,
      "universityName": "서울대인문",
      "scoreCalculation": "서울대인문",
      "major": "인문",
      "success": true,
      "convertedScore": 850.5,
      "standardScoreSum": 520,
      "calculatedAt": "2024-12-01T12:00:00Z"
    },
    {
      "universityId": 2,
      "universityName": "연세대자연",
      "scoreCalculation": "연세대자연",
      "major": "자연",
      "success": false,
      "result": "미적기하필수",
      "calculatedAt": "2024-12-01T12:00:00Z"
    }
  ]
}
```

---

### 2. 저장된 환산점수 조회

`GET /jungsi/scores`

사용자의 저장된 모든 대학 환산점수를 조회합니다.

#### Response

```typescript
interface SavedScoreResponse {
  id: number;
  universityId: number;
  universityName: string;
  scoreCalculation: string;
  major: string;
  convertedScore: number;
  standardScoreSum: number;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Example

```typescript
const response = await fetch('/jungsi/scores', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 응답: SavedScoreResponse[]
```

---

### 3. 특정 대학 환산점수 조회

`GET /jungsi/scores/:universityId`

특정 대학의 저장된 환산점수를 조회합니다.

#### Example

```typescript
const response = await fetch(`/jungsi/scores/${universityId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 응답: SavedScoreResponse | null
```

---

### 4. 환산점수 재계산

`POST /jungsi/recalculate`

기존 저장된 점수를 삭제하고 새로운 모의고사 점수로 다시 계산합니다.

**사용 시점**: 사용자가 모의고사 점수를 수정했을 때

#### Request/Response

`POST /jungsi/calculate`와 동일

---

### 5. 저장된 환산점수 삭제

`DELETE /jungsi/scores`

사용자의 모든 저장된 환산점수를 삭제합니다.

#### Response

```typescript
{ deleted: boolean }
```

---

## 프론트엔드 마이그레이션 가이드

### Step 1: 기존 계산 로직 제거

기존 프론트엔드의 정시 환산점수 계산 함수들을 제거합니다:

```typescript
// 삭제할 파일/함수들
- src/lib/utils/calculations/calc.ts
- src/lib/utils/calculations/lazy-load.ts
- src/lib/data/점수표-*.json
- src/lib/data/조건-*.json
- src/lib/data/유불리*.json
```

### Step 2: API 서비스 생성

```typescript
// src/services/jungsi-api.ts
import { apiClient } from './api-client';

export interface MockExamScoreInput {
  subjectCategory: 'kor' | 'math' | 'eng' | 'history' | 'society' | 'science' | 'lang';
  subjectName: string;
  standardScore: string;
  grade: number;
  percentile: number;
}

export interface CalculateScoresResponse {
  memberId: number;
  calculatedAt: Date;
  totalUniversities: number;
  successCount: number;
  failedCount: number;
  scores: UniversityCalculatedScore[];
}

export interface UniversityCalculatedScore {
  universityId: number;
  universityName: string;
  scoreCalculation: string;
  major: string;
  success: boolean;
  result?: string;
  convertedScore?: number;
  standardScoreSum?: number;
  calculatedAt: Date;
}

export interface SavedScore {
  id: number;
  universityId: number;
  universityName: string;
  scoreCalculation: string;
  major: string;
  convertedScore: number;
  standardScoreSum: number;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const jungsiApi = {
  // 환산점수 계산 및 저장
  calculate: async (mockExamScores: MockExamScoreInput[], universityIds?: number[]): Promise<CalculateScoresResponse> => {
    const response = await apiClient.post('/jungsi/calculate', {
      mockExamScores,
      universityIds,
    });
    return response.data;
  },

  // 저장된 점수 조회
  getScores: async (): Promise<SavedScore[]> => {
    const response = await apiClient.get('/jungsi/scores');
    return response.data;
  },

  // 특정 대학 점수 조회
  getScoreByUniversity: async (universityId: number): Promise<SavedScore | null> => {
    const response = await apiClient.get(`/jungsi/scores/${universityId}`);
    return response.data;
  },

  // 재계산 (점수 변경 시)
  recalculate: async (mockExamScores: MockExamScoreInput[], universityIds?: number[]): Promise<CalculateScoresResponse> => {
    const response = await apiClient.post('/jungsi/recalculate', {
      mockExamScores,
      universityIds,
    });
    return response.data;
  },

  // 저장된 점수 삭제
  deleteScores: async (): Promise<{ deleted: boolean }> => {
    const response = await apiClient.delete('/jungsi/scores');
    return response.data;
  },
};
```

### Step 3: 호출 흐름 변경

**로그인 후 첫 점수 계산**

```typescript
// 로그인 성공 후
async function onLoginSuccess() {
  // 1. 먼저 저장된 점수가 있는지 확인
  const savedScores = await jungsiApi.getScores();

  if (savedScores.length > 0) {
    // 저장된 점수 사용
    setJungsiScores(savedScores);
  } else {
    // 처음 계산하는 경우
    const mockExamScores = await getMemberMockExamScores(); // 모의고사 점수 조회
    const result = await jungsiApi.calculate(mockExamScores);
    setJungsiScores(result.scores.filter(s => s.success));
  }
}
```

**모의고사 점수 수정 시**

```typescript
async function onMockExamScoreChanged(newScores: MockExamScoreInput[]) {
  // 재계산 요청
  const result = await jungsiApi.recalculate(newScores);
  setJungsiScores(result.scores.filter(s => s.success));
}
```

### Step 4: 과목 카테고리 매핑

프론트엔드에서 사용하는 과목 형식을 API 형식으로 변환합니다:

```typescript
function mapSubjectCategory(subject: string): MockExamScoreInput['subjectCategory'] {
  if (subject === '국어') return 'kor';
  if (subject === '수학' || subject === '미적분' || subject === '확통' || subject === '기하') return 'math';
  if (subject === '영어') return 'eng';
  if (subject === '한국사') return 'history';
  if (['생윤', '윤사', '한지', '세지', '동아시아사', '세계사', '정치와법', '경제', '사문'].includes(subject)) return 'society';
  if (['물리1', '물리2', '화학1', '화학2', '생명1', '생명2', '지학1', '지학2'].includes(subject)) return 'science';
  if (['중국어', '일본어', '독일어', '프랑스어', '스페인어', '러시아어', '아랍어', '베트남어', '한문'].includes(subject)) return 'lang';
  return 'society'; // 기본값
}
```

---

## 참고 사항

### 실패 사유 (result)

- `미적기하필수`: 해당 대학이 미적분/기하 필수인데 확통을 선택한 경우
- `확통필수`: 해당 대학이 확통 필수인데 미적분/기하를 선택한 경우
- `과탐필수`: 해당 대학이 과탐 필수인데 사탐을 선택한 경우
- `사탐필수`: 해당 대학이 사탐 필수인데 과탐을 선택한 경우

### 계열 (major)

- `인문`: 문과 계열
- `자연`: 이과 계열
- `예체능`: 예체능 계열

### 환산식 코드 예시

- `서울대인문`, `서울대자연`
- `연세대인문`, `연세대자연`
- `고려대인문`, `고려대자연`
- ... (488개 학교)

---

## Swagger 문서

서버 실행 후 아래 주소에서 API 문서를 확인할 수 있습니다:

**http://localhost:4001/swagger#/정시%20환산점수**
