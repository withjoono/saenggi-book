# 플래너 API 가이드

거북스쿨의 학습 플래너 기능입니다. 장기 학습계획, 일정 관리, 루틴 설정 기능을 제공합니다.

---

## API 엔드포인트

### 1. 장기 학습계획 (Plan) API

#### 1.1 계획 목록 조회
```
GET /planner/plan
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 123,
      "title": "수학 기초 완성",
      "subject": "수학",
      "step": "기초",
      "startDate": "2024-01-01",
      "endDate": "2024-03-31",
      "type": 1,
      "done": 15,
      "total": 30,
      "person": "김선생",
      "material": "수학의 정석"
    }
  ]
}
```

#### 1.2 계획 생성/수정
```
POST /planner/plan
```

**Request Body (생성):**
```json
{
  "title": "수학 기초 완성",
  "subject": "수학",
  "step": "기초",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "type": 1,
  "total": 30,
  "person": "김선생",
  "material": "수학의 정석"
}
```

**Request Body (수정):**
```json
{
  "id": 1,
  "title": "수학 심화 완성",
  "step": "심화"
}
```

#### 1.3 진행률 업데이트
```
GET /planner/plan/progress?id={planId}&itemId={itemId}&done={amount}
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | number | 상위 계획 ID (optional) |
| itemId | number | 토글할 아이템 ID |
| done | number | 증가/감소할 양 |

#### 1.4 계획 삭제
```
DELETE /planner/plan/:id
```

---

### 2. 일정 아이템 (PlannerItem) API

#### 2.1 일정 목록 조회
```
GET /planner/item
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 123,
      "primaryType": "학습",
      "subject": "영어",
      "teacher": "이선생",
      "title": "영문법 수업",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T11:00:00Z",
      "rRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
      "progress": 75,
      "description": "기초 영문법 수업"
    }
  ]
}
```

#### 2.2 일정 생성/수정
```
POST /planner/item
```

**Request Body:**
```json
{
  "primaryType": "학습",
  "subject": "영어",
  "teacher": "이선생",
  "title": "영문법 수업",
  "startDate": "2024-01-15T09:00:00Z",
  "endDate": "2024-01-15T11:00:00Z",
  "rRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
  "description": "기초 영문법 수업"
}
```

#### 2.3 일정 삭제
```
DELETE /planner/item/:id
```

---

### 3. 루틴 (Routine) API

#### 3.1 루틴 목록 조회
```
GET /planner/routine
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 123,
      "title": "아침 영어 단어 암기",
      "startTime": "07:00",
      "endTime": "08:00",
      "repeat": true,
      "sun": false,
      "mon": true,
      "tue": true,
      "wed": true,
      "thu": true,
      "fri": true,
      "sat": false
    }
  ]
}
```

#### 3.2 루틴 생성
```
POST /planner/routine
```

**Request Body:**
```json
{
  "title": "아침 영어 단어 암기",
  "startTime": "07:00",
  "endTime": "08:00",
  "repeat": true,
  "days": [false, true, true, true, true, true, false]
}
```

#### 3.3 루틴 수정
```
POST /planner/routine/update
```

**Request Body:**
```json
{
  "id": 1,
  "title": "아침 영어 문장 암기",
  "startTime": "07:30",
  "endTime": "08:30"
}
```

#### 3.4 루틴 삭제
```
DELETE /planner/routine/:id
```

---

### 4. 주간 성취도 API

#### 4.1 주간 성취도 조회
```
GET /planner/progress/weekly?primaryType={type}
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| primaryType | string | '학습' 또는 '수업' |

**응답:**
```json
{
  "success": true,
  "data": [
    { "dayCode": 1, "dayName": "Monday", "avgProgress": 85.5 },
    { "dayCode": 2, "dayName": "Tuesday", "avgProgress": 72.0 },
    { "dayCode": 3, "dayName": "Wednesday", "avgProgress": 0 },
    { "dayCode": 4, "dayName": "Thursday", "avgProgress": 90.0 },
    { "dayCode": 5, "dayName": "Friday", "avgProgress": 65.0 },
    { "dayCode": 6, "dayName": "Saturday", "avgProgress": 0 },
    { "dayCode": 7, "dayName": "Sunday", "avgProgress": 0 }
  ]
}
```

---

### 5. 플래너 관리 API (관리자용)

#### 5.1 플래너(멘토) 목록 조회
```
GET /planner/class/list?dvsn={division}
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| dvsn | string | 'A' = 전체 조회 |

#### 5.2 플래너 클래스 설정
```
POST /planner/class
```

**Request Body:**
```json
{
  "plannerId": 123,
  "startDate": "20240101",
  "endDate": "20240630",
  "className": "수학 심화반",
  "classCode": "MATH_ADV"
}
```

#### 5.3 클래스 멤버 조회
```
GET /planner/class/members?plannerId={id}
```

---

## 데이터베이스 스키마

### 1. planner_plan_tb (장기 학습계획)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | 계획 ID |
| member_id | bigint (FK) | 회원 ID |
| title | varchar(255) | 제목 |
| subject | varchar(100) | 과목 |
| step | varchar(50) | 단계 |
| start_date | date | 시작일 |
| end_date | date | 종료일 |
| type | smallint | 0=강의, 1=교재 |
| done | integer | 완료량 |
| total | integer | 총 분량 |
| person | varchar(100) | 담당자 |
| material | varchar(255) | 교재명/강의명 |

### 2. planner_item_tb (일정 아이템)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | 일정 ID |
| member_id | bigint (FK) | 회원 ID |
| primary_type | varchar(10) | '학습' 또는 '수업' |
| subject | varchar(100) | 과목 |
| teacher | varchar(100) | 담당 선생님 |
| title | varchar(255) | 제목 |
| start_date | timestamp | 시작 시간 |
| end_date | timestamp | 종료 시간 |
| r_rule | varchar(255) | iCalendar 반복 규칙 |
| progress | smallint | 진행률 (0-100) |
| description | text | 설명 |

### 3. planner_routine_tb (루틴)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | 루틴 ID |
| member_id | bigint (FK) | 회원 ID |
| title | varchar(255) | 제목 |
| start_time | time | 시작 시간 |
| end_time | time | 종료 시간 |
| repeat | boolean | 반복 여부 |
| sun~sat | boolean | 요일별 활성화 |

### 4. planner_class_tb (플래너 클래스)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | 클래스 ID |
| planner_id | bigint (FK) | 플래너 회원 ID |
| class_code | varchar(50) | 클래스 코드 |
| class_name | varchar(100) | 클래스명 |
| start_date | date | 시작일 |
| end_date | date | 종료일 |

### 5. planner_management_tb (플래너 관리)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| planner_id | bigint (PK, FK) | 플래너 회원 ID |
| student_id | bigint (PK, FK) | 학생 회원 ID |
| class_id | bigint (FK) | 클래스 ID |

---

## iCalendar rRule 형식

플래너 일정의 반복 규칙은 iCalendar RFC 5545 형식을 따릅니다.

### 예시
| rRule | 설명 |
|-------|------|
| `FREQ=DAILY` | 매일 반복 |
| `FREQ=WEEKLY;BYDAY=MO,WE,FR` | 매주 월/수/금 |
| `FREQ=WEEKLY;BYDAY=TU,TH;INTERVAL=2` | 격주 화/목 |
| `FREQ=MONTHLY;BYMONTHDAY=1` | 매월 1일 |

### 요일 코드
| 코드 | 요일 |
|------|------|
| SU | 일요일 |
| MO | 월요일 |
| TU | 화요일 |
| WE | 수요일 |
| TH | 목요일 |
| FR | 금요일 |
| SA | 토요일 |
