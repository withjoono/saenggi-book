# 프론트엔드 의존성 맵 (Frontend Dependency Map)

> **목적**: 기능별 파일 분류 및 수정 시 영향 범위 파악
> **최종 업데이트**: 2025-12-17

---

## 기능 분류 개요 (Feature Overview)

| 카테고리 | 기능명 | 상태 | 전용 라우트 | 전용 컴포넌트 | 전용 스토어 |
|---------|-------|------|------------|--------------|------------|
| 입시분석 | 정시 (jungsi) | 서비스 중 | 12개 | 20+ | 4개 |
| 입시분석 | 수시 (susi) | 개발 예정 | - | - | 15개 |
| 입시분석 | 탐색 (explore) | 서비스 중 | 5개 | 30+ | 9개 |
| 입시분석 | 성적분석 (grade-analysis) | 서비스 중 | 7개 | 10+ | - |
| 입시분석 | 조합 (combination) | 서비스 중 | 1개 | - | 4개 |
| 학습관리 | 플래너 (planner) | 개발 중 | 6개 | 10+ | 5개 |
| 학습관리 | 모의고사 (mock-exam) | 서비스 중 | 6개 | 5+ | 4개 |
| 학습관리 | 모의지원 (mock-apply) | 서비스 중 | 1개 | - | - |
| 커뮤니티 | 멘토링 (mentoring) | 서비스 중 | 2개 | 5+ | 4개 |
| 커뮤니티 | 멤버십 (members) | 개발 예정 | 6개 | - | - |
| 평가 | 입학사정관 (officer) | 서비스 중 | 3개 | - | - |
| 평가 | 평가 (evaluation) | 서비스 중 | 5개 | 5+ | - |
| 결제 | 상품 (products) | 서비스 중 | 1개 | - | 2개 |
| 결제 | 결제 (payments) | 서비스 중 | 1개 | - | 4개 |
| 시스템 | 인증 (auth) | 서비스 중 | 3개 | 5+ | 4개 |
| 시스템 | 게시판 (boards) | 서비스 중 | 2개 | - | 2개 |

---

## 기능별 상세 의존성

### 1. 정시 (jungsi) - 정시 입시 분석

**상태**: 🟢 서비스 중 (메인 개발 대상)

#### 전용 파일

**라우트** (`src/routes/jungsi/`)
```
├── index.lazy.tsx          # 정시 메인 페이지
├── route.tsx               # 라우트 설정
├── _layout.tsx             # 레이아웃
├── _layout.score-input.lazy.tsx    # 성적 입력
├── _layout.score-analysis.lazy.tsx # 성적 분석
├── _layout.combination.lazy.tsx    # 지원 조합
├── _layout.interest.lazy.tsx       # 관심 대학
├── _layout.strategy.lazy.tsx       # 전략
├── competition.lazy.tsx    # 경쟁률
├── dashboard.lazy.tsx      # 대시보드
├── demo.lazy.tsx           # 데모
├── guide.lazy.tsx          # 가이드
├── gunoe.lazy.tsx          # 군외
├── heatmap.lazy.tsx        # 히트맵
├── notifications.lazy.tsx  # 알림
├── realtime-dashboard.lazy.tsx # 실시간 대시보드
└── report.lazy.tsx         # 리포트
```

**컴포넌트** (`src/components/services/explore/jungsi/`)
```
├── components/
│   ├── step-1/         # 1단계 성적 입력
│   ├── step-1-v2/      # 1단계 v2
│   ├── step-1-v3/      # 1단계 v3
│   ├── step-2/         # 2단계 대학 탐색
│   ├── step-3/         # 3단계 분석
│   └── step-4/         # 4단계 결과
├── context/            # Context Provider
└── demo/               # 데모 컴포넌트
```

**스토어** (`src/stores/server/features/jungsi/`)
```
├── apis.ts             # API 호출
├── interfaces.ts       # 타입 정의
├── mutations.ts        # Mutation hooks
└── queries.ts          # Query hooks
```

**계산 로직** (`src/lib/calculations/regular-v2/`)
```
├── advantage.ts        # 유불리 계산
├── calc-percentile.ts  # 백분위 계산
├── lazy-load.ts        # 지연 로딩
├── risk.ts             # 리스크 계산
├── types.ts            # 타입 정의
├── 경기자전변환점수.ts   # 경기대 자연 변환
├── 고려세변환점수.ts     # 고려대 세종 변환
└── 이화간호변환점수.ts   # 이화여대 간호 변환
```

**유틸리티** (`src/lib/utils/services/`)
```
└── jungsi-score-converter.ts  # 점수 변환
```

#### 의존성
- `@/lib/api` (공용)
- `@/stores/atoms/tokens`, `@/stores/atoms/user` (공용)
- `@/components/ui/*` (공용)
- `@/stores/server/features/static-data` (공용 - 대학/전형 데이터)

---

### 2. 수시 (susi) - 수시 입시 분석

**상태**: 🟡 개발 예정 (2025년 겨울방학)

#### 전용 파일

**스토어** (`src/stores/server/features/susi/`)
```
├── comprehensive/      # 학생부종합
│   ├── apis.ts
│   ├── interfaces.ts
│   └── queries.ts
├── subject/            # 학생부교과
│   ├── apis.ts
│   ├── interfaces.ts
│   └── queries.ts
├── evaluation/         # 평가
│   ├── apis.ts
│   ├── interfaces.ts
│   ├── mutations.ts
│   └── queries.ts
├── interest-univ/      # 관심 대학
│   ├── apis.ts
│   ├── interfaces.ts
│   ├── mutations.ts
│   └── queries.ts
└── pass-record/        # 합격 기록
    ├── apis.ts
    ├── interfaces.ts
    └── queries.ts
```

**탐색 컴포넌트** (`src/components/services/explore/`)
```
├── early-comprehensive/  # 학종 탐색
│   ├── components/
│   │   ├── step-0/ ~ step-4/
│   └── context/
└── early-subject/        # 교과 탐색
    ├── components/
    │   ├── step-1/ ~ step-5/
    └── context/
```

#### 의존성
- 정시와 동일한 공용 모듈
- `@/stores/server/features/static-data` (대학/전형 데이터)

---

### 3. 탐색 (explore) - 전형 검색

**상태**: 🟢 서비스 중

#### 전용 파일

**라우트** (`src/routes/explore/`)
```
├── admission.tsx           # 전형 상세
├── early-comprehensive.lazy.tsx  # 학종 탐색
├── early-subject.lazy.tsx        # 교과 탐색
├── recruitment-unit.tsx    # 모집단위
└── university.tsx          # 대학 상세
```

**스토어** (`src/stores/server/features/explore/`)
```
├── early-comprehensive/    # 학종 탐색 API
├── early-subject/          # 교과 탐색 API
└── search/                 # 검색 API
```

#### 의존성
- `@/stores/server/features/static-data`
- 공용 컴포넌트

---

### 4. 플래너 (planner) - 학습 플래너

**상태**: 🟠 개발 중

#### 전용 파일

**라우트** (`src/routes/planner/`)
```
├── index.tsx           # 플래너 메인
├── today.lazy.tsx      # 오늘
├── plans.lazy.tsx      # 계획
├── routine.lazy.tsx    # 루틴
├── learning.lazy.tsx   # 학습
├── class.lazy.tsx      # 수업
└── daily.lazy.tsx      # 일간
```

**컴포넌트** (`src/components/services/planner/`)
```
├── index.ts
├── status/             # 상태 컴포넌트
└── NotificationPanel.tsx
```

**스토어** (`src/stores/server/features/planner/`)
```
├── apis.ts
├── index.ts
├── interfaces.ts
├── mutations.ts
└── queries.ts
```

**클라이언트 스토어** (`src/stores/client/`)
```
├── use-planner-store.ts
└── use-notification-store.ts
```

#### 의존성
- 공용 모듈
- `@/stores/atoms/user` (사용자 정보)

---

### 5. 모의고사 (mock-exam) - 모의고사 분석

**상태**: 🟢 서비스 중

#### 전용 파일

**라우트** (`src/routes/mock-analysis/`)
```
├── route.tsx
├── _layout.tsx
├── _layout.score-input.lazy.tsx
├── _layout.score-analysis.lazy.tsx
├── _layout.statistics.lazy.tsx
├── _layout.prediction.lazy.tsx
├── _layout.target-university.lazy.tsx
└── _layout.wrong-answers.lazy.tsx
```

**스토어** (`src/stores/server/features/mock-exam/`)
```
├── apis.ts
├── interfaces.ts
├── mutations.ts
└── queries.ts
```

**유틸리티** (`src/lib/utils/services/`)
```
└── mock-exam.ts        # 모의고사 유틸
```

---

### 6. 멘토링 (mentoring)

**상태**: 🟢 서비스 중

#### 전용 파일

**라우트** (`src/routes/mentor/`)
```
├── index.tsx           # 멘토 목록
└── $id.tsx             # 멘토 상세
```

**컴포넌트** (`src/components/services/mentoring/`)
```
├── myclass/            # 내 클래스
└── ...
```

**스토어** (`src/stores/server/features/mentoring/`)
```
├── apis.ts
├── interfaces.ts
├── mutations.ts
└── queries.ts
```

---

### 7. 결제 (payments) & 상품 (products)

**상태**: 🟢 서비스 중

#### 전용 파일

**라우트**
```
src/routes/products/index.tsx
src/routes/order/$productId.tsx
```

**스토어**
```
src/stores/server/features/payments/
src/stores/server/features/products/
```

---

### 8. 인증 (auth) - 로그인/회원가입

**상태**: 🟢 서비스 중

#### 전용 파일

**라우트** (`src/routes/auth/`)
```
├── login.tsx
├── register.tsx
└── reset-password.tsx
```

**스토어** (`src/stores/server/features/auth/`)
```
├── apis.ts
├── interfaces.ts
└── mutations.ts
```

**클라이언트 스토어** (`src/stores/client/`)
```
├── use-auth-store.tsx
└── use-social-sign-up.tsx
```

**검증** (`src/lib/validations/`)
```
└── auth.ts
```

---

## 공용 파일 (Shared Files)

> ⚠️ **주의**: 공용 파일 수정 시 모든 관련 기능에 영향을 미칩니다!

### 🔴 Core (핵심 - 수정 시 전체 영향)

**API 레이어** (`src/lib/api/`)
```
├── index.ts            # 공용 API 내보내기
├── instances.ts        # axios 인스턴스
├── token-manager.ts    # 토큰 관리
└── interceptors/
    ├── request.ts      # 요청 인터셉터
    ├── response.ts     # 응답 인터셉터
    ├── setup.ts        # 설정
    └── token-refresh.ts # 토큰 갱신
```

**에러 처리** (`src/lib/errors/`)
```
├── error-codes.ts      # 에러 코드 정의
└── error-handler.ts    # 에러 핸들러
```

**환경 설정** (`src/lib/config/`)
```
└── env.ts              # 환경 변수
```

### 🟠 State (상태 - 수정 시 인증/사용자 관련 영향)

**전역 상태** (`src/stores/atoms/`)
```
├── tokens.ts           # 토큰 상태
└── user.ts             # 사용자 상태
```

### 🟡 UI (UI 컴포넌트 - 수정 시 전체 UI 영향)

**UI 컴포넌트** (`src/components/ui/`)
```
├── button.tsx
├── card.tsx
├── dialog.tsx
├── form.tsx
├── input.tsx
├── select.tsx
└── ... (30+ 컴포넌트)
```

**커스텀 컴포넌트** (`src/components/custom/`)
```
├── button.tsx
├── chart.tsx
├── data-grid.tsx
├── responsive-dialog.tsx
├── risk-badge.tsx
└── searchable-dropdown.tsx
```

### 🟢 Utils (유틸리티 - 수정 시 부분 영향)

**공통 유틸** (`src/lib/utils/`)
```
├── common/
│   ├── date.ts         # 날짜 유틸
│   └── format.ts       # 포맷 유틸
├── services/
│   ├── compatibility.ts
│   ├── evaluation.ts
│   ├── university.ts
│   └── subject.ts
└── firebase/
    └── firebase.ts     # Firebase 설정
```

**정적 데이터** (`src/stores/server/features/static-data/`)
```
├── apis.ts             # 정적 데이터 API
├── interfaces.ts       # 타입 정의
└── queries.ts          # Query hooks
```

---

## 수정 체크리스트

### 기능별 파일 수정 시

- [ ] 해당 기능의 전용 파일만 수정했는지 확인
- [ ] 다른 기능에서 import하는 파일이 아닌지 확인
- [ ] 커밋 메시지에 스코프 명시 (예: `feat(jungsi): ...`)

### 공용 파일 수정 시

- [ ] 영향받는 모든 기능 테스트
- [ ] 커밋 메시지에 영향 범위 명시 (예: `feat(shared): ... [affects: jungsi, susi]`)
- [ ] 변경 이력에 기록

---

## 변경 이력 (Change Log)

| 날짜 | 파일 | 수정자 | 영향 범위 | 설명 |
|------|------|--------|----------|------|
| 2025-12-17 | DEPENDENCY-MAP.md | - | - | 초기 문서 생성 |

---

## 관련 문서

- `feature-map.json` - 프로그래밍용 의존성 맵
- `CONTRIBUTING.md` - 기여 가이드라인
- `CLAUDE.md` - 프로젝트 개요
