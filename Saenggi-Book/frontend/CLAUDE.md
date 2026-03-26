# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

GeobukSchool Frontend - 이중 백엔드 아키텍처(Spring + NestJS)를 사용하는 React 기반 대학 입시 컨설팅 플랫폼. 수시 및 정시 전략에 대한 종합 분석 기능 제공.

## 기술 스택

- **프레임워크**: React 18.3.1 + TypeScript 5.5.4
- **빌드 도구**: Vite 5.3.5
- **라우팅**: TanStack Router 1.45.0 (파일 기반, 타입 안전)
- **상태 관리**:
  - Zustand 4.5.4 (localStorage 영속성을 가진 전역 상태)
  - TanStack Query 5.51.11 (서버 상태)
- **HTTP 클라이언트**: Axios 1.7.2 (humps로 camelCase/snake_case 자동 변환)
- **폼**: React Hook Form 7.52.1 + Zod 3.23.8
- **UI**: Radix UI primitives + Tailwind CSS + shadcn/ui 컴포넌트
- **백엔드 프록시**:
  - `/api-spring` → Spring 백엔드 (포트 8080)
  - `/api-nest` → NestJS 백엔드 (포트 4001)

## 개발 명령어

### 애플리케이션 실행
```bash
npm run dev                      # 포트 3000에서 개발 서버 시작 (호스트 바인딩)
npm run build                    # Vite로 프로덕션 빌드
npm run preview                  # 프로덕션 빌드 미리보기
npm run lint                     # ESLint 검사 (TypeScript 파일)
```

### 배포
```bash
npm run deploy:firebase          # Firebase Hosting 기본 배포
npm run deploy:firebase:prod     # 프로덕션 환경 배포
npm run deploy:firebase:staging  # 스테이징 환경 배포
```

### 백엔드 요구사항
프론트엔드는 두 개의 백엔드 서버가 실행되어야 합니다:
- Spring 백엔드: http://localhost:8080
- NestJS 백엔드: http://localhost:4001

백엔드 URL 설정은 `.env` 파일 참조.

## 아키텍처 및 코드 구조

### 이중 백엔드 아키텍처
이 프로젝트는 두 개의 분리된 백엔드를 사용합니다:
1. **Spring 백엔드** (`/api-spring`): 파일 업로드, 생기부 파싱, 입학사정관 프로필, 논술 관련 기능 처리
2. **NestJS 백엔드** (`/api-nest`): 인증, 사용자 관리, 주요 비즈니스 로직 등 나머지 모든 기능 처리

새로운 API 호출 추가 시:
- **NestJS 엔드포인트**: `authClient` 또는 `publicClient` (from `@/lib/api`)
- **Spring 엔드포인트**: `springAuthClient` 또는 `springPublicClient` (from `@/lib/api`)
- 레거시 코드: `src/stores/server/api-client.ts` (단계적 폐기 예정)

### 프로젝트 구조

```
src/
├── lib/                        # 핵심 유틸리티 및 설정
│   ├── api/                    # 신규: 리팩토링된 API 레이어 (Phase 1)
│   │   ├── instances.ts        # publicClient, authClient
│   │   ├── token-manager.ts    # 중앙화된 토큰 관리
│   │   ├── interceptors/       # 요청/응답/토큰 갱신 로직
│   │   └── index.ts
│   ├── errors/                 # 에러 처리 (에러 코드, 핸들러)
│   ├── calculations/           # 비즈니스 로직 계산
│   ├── validations/            # 폼 및 데이터 검증 유틸리티
│   └── utils/                  # 일반 유틸리티
│
├── stores/
│   ├── atoms/                  # 신규: 전역 상태 (Phase 2)
│   │   ├── tokens.ts           # 토큰 상태 (Zustand + persist)
│   │   └── user.ts             # 사용자 정보 상태 (Zustand + persist)
│   ├── client/                 # UI 상태 (Zustand 스토어)
│   └── server/                 # 레거시 API 레이어 (단계적 폐기 예정)
│       ├── api-client.ts       # 레거시: 구 axios 인스턴스
│       └── features/           # 기능 기반 API 모듈
│
├── routes/                     # TanStack Router 파일 기반 라우트
│   ├── __root.tsx
│   ├── index.tsx
│   ├── auth/                   # 인증 라우트
│   ├── analysis/               # 분석 기능
│   ├── explore/                # 대학 탐색
│   ├── evaluation/             # 평가 서비스
│   ├── susi/                   # 수시 전형
│   └── jungsi/                 # 정시 전형
│
├── components/
│   ├── ui/                     # shadcn/ui + Radix primitives
│   ├── custom/                 # 커스텀 재사용 가능 컴포넌트
│   ├── services/               # 도메인별 컴포넌트
│   ├── reports/                # 리포트 생성 컴포넌트
│   └── errors/                 # 에러 바운더리 컴포넌트
│
└── types/                      # TypeScript 타입 정의
```

### API 레이어 리팩토링 (Phase 1 & 2 완료)

이 프로젝트는 참조 프로젝트(turtleschool_front) 기반의 API 레이어 리팩토링을 진행했습니다. 자세한 내용은 `REFACTORING_PLAN.md`와 `REFACTORING_SUMMARY.md` 참조.

**신규 패턴 (새 코드에 사용):**
```typescript
// 리팩토링된 API 클라이언트 사용
import { publicClient, authClient } from '@/lib/api';

// 공개 엔드포인트 (인증 불필요)
await publicClient.post('/auth/login', { email, password });

// 인증 엔드포인트
await authClient.get('/user/me');
```

**토큰 관리:**
```typescript
import { setTokens, clearTokens, getAccessToken } from '@/lib/api';
import { useTokenStore } from '@/stores/atoms/tokens';

// 로그인 후 토큰 설정
setTokens(accessToken, refreshToken);
useTokenStore.getState().setTokens(accessToken, refreshToken);

// 로그아웃 시 토큰 삭제
clearTokens();
useTokenStore.getState().clearTokens();
```

**에러 코드:**
- `C401`: 토큰 만료 → 자동 갱신
- `C999`: 유효하지 않은 토큰 → 로그아웃
- `C5050`: 세션 만료 → 로그아웃
- `C403`: 권한 없음
- `C500`: 서버 에러

### 상태 관리 패턴

**전역 상태** (Zustand atoms with persistence 사용):
- 인증 토큰 (`stores/atoms/tokens.ts`)
- 사용자 정보 (`stores/atoms/user.ts`)
- 앱 전역 설정

**UI 상태** (Zustand 사용):
- 모달 표시 여부
- 폼 상태
- 필터 및 설정
- `stores/client/` 위치

**서버 상태** (TanStack Query 사용):
- API 데이터 페칭
- 캐싱 및 무효화
- `stores/server/features/` 위치

### TanStack Router 패턴

이 프로젝트는 TanStack Router v1.45.0의 **파일 기반 라우팅**을 사용합니다:

```typescript
// src/routes/ 내의 라우트 파일
// 예시: src/routes/analysis/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/analysis/')({
  component: AnalysisPage,
})
```

**라우트 트리 생성:**
- 라우트는 `src/routeTree.gen.ts`에 자동 생성됨
- `routeTree.gen.ts`를 수동으로 편집하지 마세요
- TanStack Router Vite 플러그인이 생성 처리

**네비게이션:**
```typescript
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()
navigate({ to: '/explore' })
```

### Humps를 사용한 케이스 변환

모든 API 통신은 자동 케이스 변환을 사용합니다:
- **프론트엔드 (camelCase)** ↔ **백엔드 (snake_case)**
- `api-client.ts`와 `instances.ts`의 axios 인터셉터에서 처리
- API 호출 시 수동으로 케이스를 변환하지 마세요

### 폼 처리 패턴

React Hook Form + Zod를 사용하는 표준 패턴:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

## Import 별칭

`src/`에서의 모든 import는 `@/` 사용:

```typescript
import { Button } from '@/components/ui/button'
import { useTokenStore } from '@/stores/atoms/tokens'
import { authClient } from '@/lib/api'
```

## 주요 규칙

### API 통합
- **백엔드 타입 확인**: API 호출 추가 전 Spring vs NestJS 확인 필수
- **적절한 클라이언트 사용**:
  - NestJS: `authClient`, `publicClient` (from `@/lib/api`)
  - Spring: `springAuthClient`, `springPublicClient` (from `@/lib/api`)
- **환경 변수**: `env.apiUrlNest`, `env.apiUrlSpring` 사용 (from `@/lib/config/env`)
- **기능 기반 구조**: 관련 API 호출을 `stores/server/features/`에 그룹화
- **에러 처리**: 에러 코드(C401, C999 등)와 `@/lib/errors`의 `handleApiError` 사용

### 컴포넌트 개발
- **UI 컴포넌트**: `components/ui/`의 Radix UI primitives 사용
- **스타일링**: Tailwind CSS 클래스 사용, 인라인 스타일 지양
- **재사용성**: 공통 로직을 `components/custom/`으로 추출
- **타입 안전성**: 모든 props에 적절한 TypeScript 인터페이스 정의

### 상태 관리
- **토큰 상태**: `token-manager`와 `useTokenStore` 간 동기화 필수
- **사용자 상태**: 전역 사용자 정보는 `useUserStore` 사용
- **API 상태**: 수동 상태 관리보다 TanStack Query 선호

### 인증 플로우
1. 로그인 → 백엔드에서 토큰 받기
2. 토큰 저장: `setTokens()` + `useTokenStore.getState().setTokens()`
3. 인증 요청에 자동으로 Bearer 토큰 포함 (인터셉터를 통해)
4. 토큰 만료 (401 + C401) → 자동 갱신 시도
5. 갱신 실패 → 토큰 삭제 및 로그인 페이지로 리다이렉트

## Google Cloud Platform 통합

### 배포
프로젝트는 Firebase Hosting을 통해 배포됩니다:
```bash
npm run deploy:firebase:prod      # 프로덕션 배포
npm run deploy:firebase:staging   # 스테이징 배포
```

GitHub Actions를 통한 자동 배포:
- `main` 브랜치 push → 자동 프로덕션 배포
- Pull Request → 미리보기 환경 자동 생성

### 환경 변수 관리
중앙화된 환경 변수 관리:
```typescript
import { env } from '@/lib/config/env';

const apiUrl = env.apiUrlNest;        // NestJS 백엔드
const springUrl = env.apiUrlSpring;    // Spring 백엔드
const firebase = env.firebase;         // Firebase 설정
```

환경별 파일:
- `.env.development` - 로컬 개발
- `.env.production` - 프로덕션
- `.env.local` - 개인 설정 (git ignore)

### Cloud Storage
GCS 파일 업로드 및 관리:
```typescript
import { uploadToGCS, getGCSUrl } from '@/lib/gcp';

// 파일 업로드
const url = await uploadToGCS(file, 'users/123/profile.jpg');

// URL 생성
const publicUrl = getGCSUrl('path/to/file.jpg');
```

### 모니터링 및 로깅
```typescript
import { trackEvent, trackError, logToGCP } from '@/lib/gcp';

// 이벤트 추적
trackEvent('button_click', { button_id: 'submit' });

// 에러 추적
trackError(error, { context: 'user_action' });

// 로그
logToGCP('info', 'Operation completed', { data });
```

## 참고 문서

### 리팩토링 관련
- **리팩토링 계획서**: `REFACTORING_PLAN.md` - 상세 리팩토링 전략
- **Phase 1-2 요약**: `REFACTORING_SUMMARY.md` - API 계층 & 상태 관리
- **Phase 8 요약**: `GCP_REFACTORING_SUMMARY.md` - GCP 통합 완료 내역

### GCP 관련
- **GitHub Secrets**: `GITHUB_SECRETS_SETUP.md` - 배포 설정 가이드
- **Cloud Storage**: `GCP_STORAGE_USAGE.md` - 파일 업로드 사용법

### 아키텍처
- **참조 아키텍처**: `_reference/ARCHITECTURE_DOCUMENTATION_KR.md` - 원본 프로젝트 패턴
- **README**: `README.md` - 기본 프로젝트 정보 및 TODO 항목

## 참조 프로젝트의 주요 패턴

이 코드베이스는 `turtleschool_front` 참조 프로젝트의 패턴을 채택했습니다:
- **이중 axios 인스턴스**: `publicClient` (인증 불필요) + `authClient` (인증 필요)
- **에러 코드 시스템**: C401, C999, C5050 표준화된 에러 처리
- **토큰 관리**: 자동 갱신 기능을 가진 중앙화된 토큰 작업
- **State atoms 패턴**: Recoil atoms 패턴을 모방한 Zustand + persist 미들웨어
