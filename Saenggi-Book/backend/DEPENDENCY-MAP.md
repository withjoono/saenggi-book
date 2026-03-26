# DEPENDENCY-MAP.md

기능별 의존성 맵 문서입니다. 코드 수정 시 영향 범위를 파악하는 데 사용합니다.

> **마지막 업데이트**: 2025-12-17

---

## 기능 분류 개요

| 카테고리 | 모듈 | 설명 |
|---------|------|------|
| **입시-정시** | jungsi | 정시 환산점수, 입결분석, 지원시뮬레이션 |
| **입시-수시** | susi | 수시 교과, 학종, 논술 분석 |
| **입시-논술** | essay | 논술 전형 분석 |
| **학생부** | schoolrecord | 학생부 기록 관리 (성적, 출결, 봉사) |
| **모의고사** | mock-exam | 모의고사 점수 입력/관리 |
| **결제** | pay | 결제, 쿠폰, 계약 관리 |
| **플래너** | planner | 학습 플래너 |
| **회원** | members | 회원 정보, 인증 |
| **게시판** | board | 커뮤니티, Q&A |
| **멘토링** | mentoring | 멘토링 서비스 |
| **입학사정관** | officer | 입학사정관 평가 시스템 |
| **탐색** | exploration | 대학/학과 탐색 |
| **마이클래스** | myclass | 내 학습 현황 |
| **스토어** | store | 상품 관리 |
| **공용** | common, core, static-data | 공용 유틸, 기준 데이터 |

---

## 1. 정시 (Jungsi)

### 전용 파일
```
src/modules/jungsi/
├── calculation/           # 환산점수 계산
│   ├── calculations/      # 계산 로직
│   ├── data/              # JSON 데이터 (점수표, 유불리)
│   ├── dto/               # DTO
│   └── services/          # 서비스
├── mock-application/      # 지원 시뮬레이션 (개발중)
├── notification/          # 알림 (개발중)
└── prediction/            # 예측 (개발중)
```

### 전용 엔티티
```
src/database/entities/core/
├── regular-admission.entity.ts              # 정시 모집단위
├── regular-admission-previous-result.entity.ts  # 정시 과거 입결
```

```
src/database/entities/member/
├── member-calculated-score.entity.ts        # 회원별 환산점수
├── member-regular-interests.entity.ts       # 정시 관심대학
```

### 의존하는 공용 파일
- `src/database/entities/core/university.entity.ts` - 대학 정보
- `src/database/entities/member/member.entity.ts` - 회원 정보
- `src/common/jwt/*` - 인증
- `src/common/interceptors/*` - 응답 처리

### 의존하는 다른 모듈
- `mock-exam` - 모의고사 점수 조회
- `members` - 회원 정보 조회
- `pay` - 결제/계약 확인

---

## 2. 수시 (Susi)

### 전용 파일
```
src/modules/susi/
├── comprehensive/         # 학종
├── subject/               # 교과
└── services/
```

### 전용 엔티티
```
src/database/entities/susi/
├── pass-fail-case.entity.ts                 # 합불사례
├── susi-comprehensive-*.entity.ts           # 학종 관련
├── susi-subject-*.entity.ts                 # 교과 관련
└── susi-minimum-grade.entity.ts             # 최저등급
```

### 의존하는 공용 파일
- `src/database/entities/core/admission.entity.ts` - 전형 정보
- `src/database/entities/core/recruitment-unit.entity.ts` - 모집단위
- `src/database/entities/member/member.entity.ts` - 회원 정보

### 의존하는 다른 모듈
- `schoolrecord` - 학생부 성적
- `members` - 회원 정보

---

## 3. 논술 (Essay)

### 전용 파일
```
src/modules/essay/
└── services/
```

### 전용 엔티티
```
src/database/entities/essay/
├── essay-info.entity.ts
├── essay-previous-result.entity.ts
└── essay-test-info.entity.ts
```

### 의존하는 공용 파일
- `src/database/entities/core/university.entity.ts`
- `src/database/entities/core/recruitment-unit.entity.ts`

---

## 4. 학생부 (SchoolRecord)

### 전용 파일
```
src/modules/schoolrecord/
├── attendance/            # 출결
├── subject-learning/      # 교과 학습
├── select-subject/        # 선택과목
├── volunteer/             # 봉사활동
└── sports-art/            # 체육/예술
```

### 전용 엔티티
```
src/database/entities/schoolrecord/
├── school-record-attendance-detail.entity.ts
├── school-record-select-subject.entity.ts
├── school-record-subject-learning.entity.ts
├── school-record-volunteer.entity.ts
└── schoolrecord-sports-art.entity.ts
```

### 의존하는 공용 파일
- `src/database/entities/member/member.entity.ts`

---

## 5. 모의고사 (MockExam)

### 전용 파일
```
src/modules/mock-exam/
├── mock-exam.controller.ts
├── mock-exam.service.ts
└── dtos/
```

### 전용 엔티티
```
src/database/entities/mock-exam/
├── mockexam-score.entity.ts                 # 모의고사 점수
├── mockexam-standard-score-table.entity.ts  # 표준점수 변환표
└── mockexam-comparison.entity.ts            # 비교 데이터
```

### 의존하는 공용 파일
- `src/database/entities/member/member.entity.ts`

### 다른 모듈에서의 의존
- **jungsi** - 환산점수 계산에 사용
- **susi** - 수시 분석에 사용

---

## 6. 결제 (Pay)

### 전용 파일
```
src/modules/pay/
├── pay.controller.ts
├── pay.service.ts
└── services/
    ├── contract.service.ts      # 계약 관리
    ├── coupon.service.ts        # 쿠폰 관리
    └── iamport.service.ts       # 결제 연동
```

### 전용 엔티티
```
src/database/entities/pay/
├── pay-cancel-log.entity.ts
├── pay-contract.entity.ts       # 활성 계약
├── pay-coupon.entity.ts
├── pay-order.entity.ts
└── pay-service.entity.ts        # 서비스 상품
```

### 의존하는 공용 파일
- `src/database/entities/member/member.entity.ts`

### 다른 모듈에서의 의존
- **모든 유료 기능** - 결제 확인

---

## 7. 플래너 (Planner)

### 전용 파일
```
src/modules/planner/
└── (개발중)
```

### 전용 엔티티
```
src/database/entities/planner/
├── planner-goal.entity.ts
├── planner-schedule.entity.ts
└── planner-task.entity.ts
```

---

## 8. 회원 (Members)

### 전용 파일
```
src/modules/members/
├── members.controller.ts
├── members.service.ts
└── services/
```

### 전용 엔티티
```
src/database/entities/member/
├── member.entity.ts             # 핵심 회원 정보
├── member-interests.entity.ts   # 수시 관심목록
├── member-regular-interests.entity.ts  # 정시 관심목록
├── member-calculated-score.entity.ts   # 환산점수
└── member-recruitment-unit-combination.entity.ts  # 원서 조합
```

### 다른 모듈에서의 의존
- **거의 모든 모듈** - 회원 정보 필요

---

## 공용 파일 (수정 시 주의!)

### 최상위 공용 - 모든 기능에 영향

```
src/common/
├── jwt/                   # 인증 - 모든 인증 필요 API
├── bcrypt/                # 비밀번호 - 회원 관련
├── interceptors/          # 응답 처리 - 모든 API
├── filters/               # 에러 처리 - 모든 API
└── utils/                 # 유틸리티
```

```
src/database/entities/member/member.entity.ts  # 회원 - 거의 모든 기능
src/database/entities/core/university.entity.ts  # 대학 - 입시 관련 전체
```

### 입시 공용 - 수시/정시/논술에 영향

```
src/database/entities/core/
├── admission.entity.ts              # 전형
├── admission-method.entity.ts       # 전형방법
├── recruitment-unit.entity.ts       # 모집단위
├── major-field.entity.ts            # 계열
└── general-field.entity.ts          # 대분류
```

### 관리자 - 데이터 import/export

```
src/admin/
├── controllers/           # 관리자 API
├── services/              # 관리자 서비스
└── excel-mapper/          # Excel 변환
```

---

## 수정 체크리스트

### 공용 파일 수정 시
- [ ] 영향받는 모듈 목록 확인
- [ ] 각 모듈의 테스트 실행
- [ ] API 응답 형식 변경 시 프론트엔드 확인
- [ ] 커밋 메시지에 `[affects: 모듈1, 모듈2]` 표기

### 엔티티 수정 시
- [ ] 마이그레이션 SQL 생성
- [ ] 개발 DB에서 테스트
- [ ] 프로덕션 DB 백업 확인
- [ ] 롤백 SQL 준비

### API 응답 변경 시
- [ ] Swagger 문서 업데이트
- [ ] 프론트엔드 담당자에게 공유
- [ ] 하위 호환성 유지 (기존 필드 유지)

---

## 변경 이력

| 날짜 | 변경 내용 | 영향 범위 |
|------|----------|----------|
| 2025-12-17 | 정시 환산점수 코드화 (scoreCalculationCode 추가) | jungsi |
| 2025-12-16 | 정시 환산점수 API 추가 | jungsi |
