# 리팩토링 계획서 (Refactoring Plan)

## 📋 개요

**목적**: Reference 프로젝트(turtleschool_front)의 검증된 패턴을 현재 프로젝트에 적용하여 코드 품질과 유지보수성 향상

**기간**: 단계별 리팩토링 (7단계)

**원칙**:
- ✅ 현재 프로젝트의 최신 기술 스택 유지 (TanStack Query v5, TanStack Router, Zustand)
- ✅ Reference 프로젝트의 검증된 패턴 도입
- ✅ 점진적 리팩토링으로 기능 중단 최소화
- ✅ 타입 안전성 강화

---

## 🔍 현재 vs Reference 비교 분석

### 현재 프로젝트 (GeobukSchool-Frontend)

**기술 스택**:
```json
{
  "상태관리": "Zustand 4.5.4",
  "서버상태": "TanStack Query 5.51.11",
  "라우팅": "TanStack Router 1.45.0",
  "HTTP": "Axios 1.7.2",
  "폼": "React Hook Form 7.52.1 + Zod",
  "UI": "Radix UI + Tailwind CSS"
}
```

**구조**:
```
src/
├── stores/
│   ├── client/         # Zustand stores
│   └── server/         # API 계층
│       ├── api-client.ts
│       ├── common-utils.ts
│       └── features/   # Feature별 API
├── components/
├── routes/             # TanStack Router
├── hooks/
└── lib/
```

**장점**:
- ✅ 최신 라이브러리 사용 (TanStack Query v5, Router)
- ✅ 타입 안전 라우팅 (TanStack Router)
- ✅ Feature 기반 API 구조
- ✅ humps를 통한 자동 케이스 변환

**개선 필요**:
- ⚠️ 전역 상태 관리 패턴 부족 (Zustand만 사용)
- ⚠️ API 에러 처리 일관성 부족
- ⚠️ 컴포넌트 재사용성 낮음
- ⚠️ 토큰 갱신 로직 복잡

### Reference 프로젝트 (turtleschool_front)

**기술 스택**:
```json
{
  "상태관리": "Recoil 0.7.7 + recoil-persist",
  "서버상태": "React Query 3.39.3",
  "라우팅": "React Router 6.10.0",
  "HTTP": "Axios 1.3.5",
  "UI": "Material-UI 5.12.3 + Tailwind CSS"
}
```

**구조**:
```
src/
├── api/                # Legacy API
│   ├── instance.ts     # clientAxios, memberAxios
│   ├── urls.ts
│   └── fetches/
├── apis/               # New API (NestJS)
│   └── nest-axios-instance.ts
├── recoil/
│   ├── atoms/          # 전역 상태
│   └── selectors/      # 파생 상태
├── components/
└── routes/
```

**장점**:
- ✅ Recoil 기반 체계적 상태 관리
- ✅ RecoilNexus를 통한 어디서든 상태 접근
- ✅ 명확한 토큰 관리 (인터셉터에서 Recoil 사용)
- ✅ 검증된 에러 처리 패턴

**개선 필요**:
- ⚠️ 구버전 라이브러리
- ⚠️ API 계층 중복 (api/ + apis/)
- ⚠️ 타입 정의 부족

---

## 🎯 리팩토링 목표

### 1. API 계층 개선
**목표**: Reference의 검증된 인터셉터 패턴 + 현재의 Feature 구조 결합

**Before** (현재):
```typescript
// src/stores/server/api-client.ts
- 토큰 갱신 로직이 복잡 (isRefreshing, refreshSubscribers)
- 에러 처리 일관성 부족
- makeApiCall과 인터셉터 역할 중복
```

**After** (개선):
```typescript
// src/lib/api/
├── instances.ts        # axios 인스턴스 (public, auth)
├── interceptors.ts     # 인터셉터 로직 분리
├── error-handler.ts    # 에러 처리 통합
└── token-manager.ts    # 토큰 관리 전담
```

**개선 사항**:
- ✅ Reference의 단순하고 명확한 인터셉터 패턴 적용
- ✅ 토큰 관리 로직 분리
- ✅ 에러 처리 표준화
- ✅ 현재의 humps 케이스 변환 유지

### 2. 상태 관리 하이브리드 패턴
**목표**: Zustand(로컬) + Recoil 패턴(전역) 하이브리드

**Before** (현재):
```typescript
// Zustand만 사용
src/stores/client/
├── use-auth-store.tsx
└── use-social-sign-up.tsx
```

**After** (개선):
```typescript
src/stores/
├── atoms/              # Recoil-style atoms (전역 상태)
│   ├── tokens.ts       # 인증 토큰
│   ├── user.ts         # 사용자 정보
│   └── app.ts          # 앱 전역 상태
├── client/             # Zustand stores (UI 상태)
│   └── use-*.tsx
└── server/             # TanStack Query (서버 상태)
    └── features/
```

**패턴**:
- **Recoil-style atoms**: 전역 상태 (토큰, 사용자 정보)
- **Zustand**: 로컬/UI 상태 (모달, 필터)
- **TanStack Query**: 서버 데이터

### 3. 컴포넌트 아키텍처
**목표**: Atomic Design + Feature 기반 구조

**Before** (현재):
```
src/components/
├── ui/              # 기본 UI
├── custom/          # 커스텀
├── services/        # 도메인별?
└── test/
```

**After** (개선):
```
src/components/
├── ui/              # Radix primitives (유지)
├── shared/          # 공통 컴포넌트
│   ├── buttons/
│   ├── forms/
│   └── charts/
├── features/        # Feature 컴포넌트
│   ├── auth/
│   ├── explore/
│   ├── evaluation/
│   └── payment/
└── layouts/         # 레이아웃
```

### 4. 타입 안전성 강화
**목표**: Reference의 인터페이스 패턴 + 현재의 Zod 검증

**개선**:
- ✅ 모든 API 응답에 타입 정의
- ✅ Zod 스키마로 런타임 검증
- ✅ 공통 타입 중앙화 (src/types/)

### 5. 에러 처리 표준화
**목표**: Reference의 에러 코드 시스템 도입

**패턴**:
```typescript
// src/lib/errors/
├── error-codes.ts      # 에러 코드 정의
├── error-handler.ts    # 에러 처리기
└── error-boundary.tsx  # React 에러 경계
```

**에러 코드**:
- C401: 토큰 만료 → 자동 갱신
- C999: 유효하지 않은 토큰 → 로그아웃
- C5050: 세션 만료 → 로그아웃

### 6. 유틸리티 함수 정리
**목표**: Reference의 검증된 유틸 + 현재의 lib 구조

**개선**:
```
src/lib/
├── api/              # API 관련
├── calculations/     # 계산 (유지)
├── validations/      # 검증 (유지)
├── formatters/       # 포맷팅 (신규)
└── helpers/          # 헬퍼 (신규)
```

---

## 📋 단계별 실행 계획

### Phase 1: API 계층 리팩토링 (우선순위: 높음)

**목표**: 안정적이고 유지보수 쉬운 API 계층 구축

**작업 항목**:
1. **토큰 관리자 분리**
   ```typescript
   // src/lib/api/token-manager.ts
   export const getAccessToken = () => localStorage.getItem('accessToken');
   export const getRefreshToken = () => localStorage.getItem('refreshToken');
   export const setTokens = (access, refresh) => { ... };
   export const clearTokens = () => { ... };
   ```

2. **Axios 인스턴스 재구성**
   ```typescript
   // src/lib/api/instances.ts
   export const publicClient = axios.create({ ... });
   export const authClient = axios.create({ ... });
   ```

3. **인터셉터 로직 분리**
   ```typescript
   // src/lib/api/interceptors/
   ├── request.ts      # Request 인터셉터
   ├── response.ts     # Response 인터셉터
   └── token-refresh.ts # 토큰 갱신
   ```

4. **에러 핸들러 통합**
   ```typescript
   // src/lib/api/error-handler.ts
   export const handleApiError = (error) => { ... };
   ```

**예상 소요**: 2-3시간
**검증**: 로그인/로그아웃/토큰갱신 테스트

### Phase 2: 상태 관리 개선 (우선순위: 높음)

**목표**: 전역 상태를 Recoil 패턴으로 관리

**작업 항목**:
1. **Atoms 생성**
   ```typescript
   // src/stores/atoms/tokens.ts
   export const useTokenStore = create<TokenStore>((set) => ({
     accessToken: null,
     refreshToken: null,
     setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
     clearTokens: () => set({ accessToken: null, refreshToken: null }),
   }));

   // localStorage 영속화 추가
   ```

2. **User 상태 관리**
   ```typescript
   // src/stores/atoms/user.ts
   export const useUserStore = create<UserStore>((set) => ({ ... }));
   ```

3. **기존 Zustand stores 정리**
   - use-auth-store.tsx → atoms/tokens.ts로 마이그레이션
   - 필요한 부분만 남기고 정리

**예상 소요**: 2-3시간
**검증**: 토큰 영속성, 로그인 유지 테스트

### Phase 3: 컴포넌트 구조 개선 (우선순위: 중간)

**목표**: Feature 기반 컴포넌트 구조

**작업 항목**:
1. **디렉토리 재구성**
   ```bash
   mkdir -p src/components/{shared,features,layouts}
   ```

2. **공통 컴포넌트 이동**
   ```
   src/components/custom/ → src/components/shared/
   ```

3. **Feature 컴포넌트 그룹화**
   ```
   src/components/services/mock-exam/ → src/components/features/mock-exam/
   ```

**예상 소요**: 3-4시간
**검증**: 빌드 성공, 컴포넌트 렌더링 확인

### Phase 4: 타입 정의 강화 (우선순위: 중간)

**목표**: 모든 API에 타입 정의

**작업 항목**:
1. **공통 타입 정의**
   ```typescript
   // src/types/common.ts
   export interface ApiResponse<T> {
     data: T;
     message: string;
     status: boolean;
   }
   ```

2. **각 Feature별 인터페이스 검토**
   - 누락된 타입 추가
   - any 타입 제거

**예상 소요**: 2-3시간

### Phase 5: 에러 처리 표준화 (우선순위: 중간)

**목표**: 일관된 에러 처리

**작업 항목**:
1. **에러 코드 정의**
   ```typescript
   // src/lib/errors/error-codes.ts
   export const ERROR_CODES = {
     TOKEN_EXPIRED: 'C401',
     INVALID_TOKEN: 'C999',
     SESSION_EXPIRED: 'C5050',
   };
   ```

2. **에러 핸들러**
   ```typescript
   // src/lib/errors/error-handler.ts
   export const handleApiError = (error) => {
     switch (error.response?.data?.detailCode) {
       case ERROR_CODES.TOKEN_EXPIRED:
         // 토큰 갱신
         break;
       case ERROR_CODES.INVALID_TOKEN:
         // 로그아웃
         break;
     }
   };
   ```

**예상 소요**: 2시간

### Phase 6: 유틸리티 정리 (우선순위: 낮음)

**목표**: 코드 재사용성 향상

**작업 항목**:
1. **포맷터 추가**
   ```typescript
   // src/lib/formatters/
   ├── date.ts
   ├── number.ts
   └── text.ts
   ```

2. **헬퍼 함수 추가**
   ```typescript
   // src/lib/helpers/
   ├── storage.ts
   ├── url.ts
   └── validation.ts
   ```

**예상 소요**: 2시간

### Phase 7: 테스트 및 검증 (우선순위: 높음)

**목표**: 리팩토링 안정성 검증

**작업 항목**:
1. **수동 테스트**
   - 로그인/로그아웃
   - 토큰 갱신
   - API 호출
   - 페이지 네비게이션

2. **에러 시나리오 테스트**
   - 토큰 만료
   - 네트워크 에러
   - 잘못된 입력

3. **성능 검증**
   - 번들 사이즈
   - 로딩 시간

**예상 소요**: 2-3시간

---

## 🚀 실행 우선순위

### 즉시 실행 (Phase 1-2)
1. **API 계층 리팩토링** - 가장 중요, 모든 기능의 기반
2. **상태 관리 개선** - 토큰 관리 안정화

### 다음 단계 (Phase 3-5)
3. **컴포넌트 구조 개선** - 유지보수성
4. **타입 정의 강화** - 안정성
5. **에러 처리 표준화** - 사용자 경험

### 추후 개선 (Phase 6-7)
6. **유틸리티 정리** - 코드 품질
7. **테스트 및 검증** - 최종 확인

---

## 📊 예상 효과

### 코드 품질
- ✅ 타입 안전성 향상 (any 제거)
- ✅ 코드 재사용성 증가
- ✅ 유지보수성 향상

### 개발 생산성
- ✅ 명확한 구조로 개발 속도 향상
- ✅ 에러 처리 표준화로 디버깅 시간 단축
- ✅ 컴포넌트 재사용으로 중복 코드 감소

### 사용자 경험
- ✅ 안정적인 토큰 관리
- ✅ 일관된 에러 메시지
- ✅ 빠른 페이지 로딩

---

## ⚠️ 주의사항

### 리팩토링 중 유지해야 할 것
- ✅ TanStack Query v5 (현재 최신)
- ✅ TanStack Router (타입 안전 라우팅)
- ✅ humps 케이스 변환
- ✅ Feature 기반 API 구조

### 변경하지 말아야 할 것
- ❌ 라우팅 구조 (TanStack Router 유지)
- ❌ UI 컴포넌트 (Radix UI 유지)
- ❌ 폼 라이브러리 (React Hook Form + Zod 유지)

### 단계별 커밋
- 각 Phase 완료 후 커밋
- 롤백 가능하도록 작은 단위로 커밋
- 커밋 메시지에 Phase 번호 포함

---

## 📝 체크리스트

### Phase 1: API 계층
- [ ] token-manager.ts 생성
- [ ] instances.ts 생성 (publicClient, authClient)
- [ ] 인터셉터 분리 (request, response, token-refresh)
- [ ] error-handler.ts 생성
- [ ] 기존 api-client.ts 제거
- [ ] 모든 API 호출 테스트

### Phase 2: 상태 관리
- [ ] atoms/tokens.ts 생성 (Zustand + persist)
- [ ] atoms/user.ts 생성
- [ ] 기존 use-auth-store 마이그레이션
- [ ] localStorage 영속화 추가
- [ ] 로그인/로그아웃 테스트

### Phase 3: 컴포넌트 구조
- [ ] shared/ 디렉토리 생성
- [ ] features/ 디렉토리 생성
- [ ] layouts/ 디렉토리 생성
- [ ] 컴포넌트 이동 및 import 경로 수정
- [ ] 빌드 확인

### Phase 4: 타입 정의
- [ ] types/common.ts 생성
- [ ] 각 Feature 인터페이스 검토
- [ ] any 타입 제거
- [ ] TypeScript 에러 0개 확인

### Phase 5: 에러 처리
- [ ] error-codes.ts 생성
- [ ] error-handler.ts 구현
- [ ] API 에러 처리 통합
- [ ] 에러 시나리오 테스트

### Phase 6: 유틸리티
- [ ] formatters/ 생성
- [ ] helpers/ 생성
- [ ] 중복 코드 제거

### Phase 7: 검증
- [ ] 전체 기능 수동 테스트
- [ ] 에러 시나리오 테스트
- [ ] 성능 측정 (번들 사이즈, 로딩 시간)
- [ ] 문서 업데이트

---

## 📚 참고 자료

### Reference 프로젝트 주요 파일
- `_reference/turtleschool_front/src/api/instance.ts` - Axios 인터셉터 패턴
- `_reference/turtleschool_front/src/recoil/atoms/` - Recoil atoms 패턴
- `_reference/turtleschool_front/src/api/urls.ts` - API 엔드포인트 정의

### 기술 문서
- TanStack Query: https://tanstack.com/query/latest
- Zustand Persist: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
- Axios Interceptors: https://axios-http.com/docs/interceptors

---

*작성일: 2024*
*버전: 1.0*
*상태: 실행 준비 완료*
