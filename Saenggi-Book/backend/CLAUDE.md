# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**거북스쿨 (TurtleSchool) 백엔드** - 한국 대학 입시 컨설팅 서비스를 위한 교육 플랫폼 API. 복잡한 학생부 기록, 결제 처리, 입학 평가 기능을 제공하는 NestJS 기반 REST API로 여러 프론트엔드 애플리케이션을 지원합니다.

**운영 도메인**: v2.ingipsy.com
**관리자 포털**: https://admin2.turtleskool.com
**API 문서**: http://localhost:4001/swagger (서버 실행 시)

## 개발 명령어

### 필수 명령어
```bash
# 개발
yarn start:dev              # Watch 모드 개발 서버 (포트 4001)
yarn start:debug            # 디버그 모드 (inspector 포함)

# 빌드 & 프로덕션
yarn build                  # TypeScript를 dist/로 컴파일
yarn start:prod             # 프로덕션 빌드 실행

# 테스트
yarn test                   # 유닛 테스트 실행
yarn test:watch             # Watch 모드 테스트
yarn test:cov               # 테스트 커버리지 리포트
yarn test:e2e               # End-to-end 통합 테스트

# 코드 품질
yarn lint                   # ESLint 자동 수정
yarn format                 # Prettier 포맷팅

# 데이터베이스 작업
yarn typeorm:run            # 대기 중인 마이그레이션 실행
yarn typeorm:generate -n MigrationName  # 엔티티 변경사항으로부터 마이그레이션 생성
yarn typeorm:revert         # 마지막 마이그레이션 롤백
yarn typeorm:create         # 빈 마이그레이션 파일 생성
```

### 데이터베이스 설정
```bash
# Windows
setup-db.bat                # Docker PostgreSQL 컨테이너 시작

# Linux/Mac
chmod +x setup-db.sh && ./setup-db.sh

# 수동 Docker 실행
docker run --name geobuk-postgres \
  -e POSTGRES_PASSWORD=tsuser1234 \
  -e POSTGRES_USER=tsuser \
  -e POSTGRES_DB=geobukschool_dev \
  -p 5432:5432 -d postgres:14
```

### 최초 설정
```bash
# 1. 의존성 설치
yarn install

# 2. 환경 파일 생성
cp .env.example .env.development

# 3. PostgreSQL 시작
setup-db.bat  # 또는 setup-db.sh

# 4. 마이그레이션 실행
yarn typeorm:run

# 5. 서버 시작
yarn start:dev
```

## 아키텍처 & 코드 구조

### 모듈 구조
애플리케이션은 도메인 주도 설계를 따르는 NestJS 모듈 아키텍처를 사용합니다:

```
src/
├── auth/                   # JWT + OAuth (Google/Naver) 인증
├── modules/
│   ├── members/            # 사용자 관리 (학생/교사/학부모)
│   ├── schoolrecord/       # 학생부 기록 (출석, 성적, 과목)
│   ├── susi/               # 수시 전형 (교과, 학종)
│   ├── essay/              # 논술 분석
│   ├── mock-exam/          # 모의고사 점수 & 표준화
│   ├── pay/                # 결제 처리 (Iamport 연동)
│   ├── sms/                # SMS 알림 (Aligo 연동)
│   ├── officer/            # 입학사정관 평가 시스템
│   ├── board/              # 커뮤니티 게시판 (게시글, 댓글)
│   ├── core/               # 대학/입학/모집 데이터
│   └── static-data/        # 참조 데이터 및 조회 테이블
├── admin/                  # 관리자 패널 (데이터 가져오기/내보내기, 통계)
├── common/                 # 공유 유틸리티 (JWT, bcrypt, interceptors, filters)
├── config/                 # 타입 안전 설정 (검증된 환경 변수)
└── database/               # TypeORM 설정, 엔티티, 마이그레이션
```

### 전역 요청/응답 흐름

```
클라이언트 요청
    ↓
[CORS 검증] → [DTO 검증 (class-validator)]
    ↓
[JwtAuthGuard가 memberId 추출] → [RolesGuard가 권한 체크]
    ↓
[Controller] → [Service Layer] → [TypeORM Repository]
    ↓
[캐시 레이어 (Redis)] → [응답 직렬화]
    ↓
[SuccessResponseInterceptor] → { success: true, data: ... }
```

**예외 처리 경로**: 모든 에러 → `HttpExceptionFilter` → `{ success: false, message, statusCode }`

### 인증 플로우

**JWT 토큰 시스템** (Spring 백엔드 호환):
- `src/common/jwt/jwt.service.ts`의 커스텀 JWT 구현
- 알고리즘: HS512 (base64 인코딩된 시크릿)
- Access Token: 2시간 유효 (sub: 'ATK', jti: memberId)
- Refresh Token: 60일 유효 (sub: 'RTK', jti: memberId)

**Guards**:
- `JwtAuthGuard`: 전역 인증 (JWT에서 memberId 추출)
- `RolesGuard`: 역할 기반 접근 제어 (ROLE_USER, ROLE_ADMIN 등)
- `@Public()` 데코레이터: 공개 엔드포인트에 대한 인증 우회

**비밀번호 해싱**:
- `src/common/bcrypt/bcrypt.service.ts`의 Spring 호환 bcrypt
- 크로스 호환성을 위한 `{bcrypt}` 접두사 사용

### 전역 Interceptors & Filters

**모든 요청에 적용**:
1. `ValidationPipe`: `class-validator`로 DTO 검증 (whitelist + transform)
2. `ClassSerializerInterceptor`: `@Exclude()`로 표시된 민감한 필드 제외
3. `SuccessResponseInterceptor`: 성공 응답을 `{ success: true, data }`로 래핑
4. `SentryInterceptor`: 에러 모니터링 및 리포팅
5. `HttpExceptionFilter`: 에러 포맷 표준화

### 엔티티 관계 & 도메인 모델

**핵심 엔티티**: 복잡한 관계를 가진 `MemberEntity`:
```typescript
MemberEntity
  ├─ MemberInterestsEntity (수시 관심목록: 교과, 학종, 논술)
  ├─ MemberRecruitmentUnitCombinationEntity (원서 조합)
  ├─ MemberRegularInterestsEntity (정시 관심대학)
  ├─ SchoolRecord* (학생부: 교과, 선택과목, 봉사, 특기)
  ├─ MockexamScore* (모의고사 점수)
  ├─ PostEntity & CommentEntity (커뮤니티)
  └─ PayContract* (결제 계약)
```

**대학 데이터 계층 구조**:
```
University (대학)
  └─ Admission (학부: 인문대학, 자연과학대학)
      └─ AdmissionMethod (전형: 일반전형, 학교장추천)
          └─ RecruitmentUnit (모집단위: 컴퓨터공학과)
              ├─ Score requirements (등급컷, 위험도)
              ├─ Interview info (면접 정보)
              ├─ Minimum grade cutoffs (최저등급)
              └─ Pass/fail records (합불사례)
```

**계열 분류**:
- `GeneralFieldEntity` → `MajorFieldEntity` → `MidFieldEntity` → `MinorFieldEntity`

### 결제 처리 플로우

```
1. Frontend → PaymentController.validatePayment(iamportId)
2. PaymentService.validatePayment() → Iamport API 검증
3. PaymentService.completePayment() → PayOrderEntity + PayContractEntity 생성
4. MembersService.findActiveServicesById() → 활성 구독 조회
```

**결제 엔티티**:
- `PayServiceEntity`: 서비스 상품 (과목별 구독)
- `PayOrderEntity`: 거래 기록
- `PayCouponEntity`: 할인 코드
- `PayContractEntity`: 활성 구독 계약
- `PayCancelLogEntity`: 취소 내역

### 학생부 시스템

복잡한 학생부 데이터 관리:
- `SchoolRecordAttendanceDetailEntity`: 출석 기록
- `SchoolRecordSubjectLearningEntity`: 성적 세부 내역 (교과 과정)
- `SchoolRecordSelectSubjectEntity`: 선택 과목
- `SchoolRecordVolunteerEntity`: 봉사활동 시간
- `SchoolrecordSportsArtEntity`: 체육/예술 활동 (특기)

### 관리자 데이터 관리

**Excel 가져오기/내보내기**: `src/admin/excel-mapper/`
- 논술 데이터, 수시 기록, 모의고사 점수 대량 가져오기
- 엔티티별 매핑이 포함된 커스텀 XLSX 파싱
- 통계 생성 및 데이터 분석

### 설정 관리

**타입 안전 환경 기반 설정**:
- 환경별 `.env.{environment}` 파일 (development/production)
- `src/config/`의 `class-validator`를 사용한 검증
- `AllConfigType` 인터페이스를 통한 타입 안전 접근
- `src/database/typeorm-config.service.ts`의 데이터베이스 설정

**중요 환경 변수**:
```bash
NODE_ENV=development|production
PORT=4001
DB_TYPE=postgres|better-sqlite3
DB_SYNCHRONIZE=false  # 프로덕션에서 절대 true 금지
AUTH_JWT_SECRET=<base64-encoded>
AUTH_REFRESH_SECRET=<base64-encoded>
IMP_KEY/IMP_SECRET=<Iamport 결제 자격 증명>
ALIGO_API_KEY=<SMS 서비스 자격 증명>
SENTRY_DSN=<에러 추적>
SLACK_WEBHOOK=<알림 알람>
```

## 중요 구현 패턴

### 1. 데이터베이스 마이그레이션 안전성

**중요**: `DB_SYNCHRONIZE=true`는 `TypeOrmConfigService`에 의해 프로덕션에서 차단됩니다.

**엔티티 변경 시**:
```bash
# 1. 엔티티 파일 수정
# 2. 마이그레이션 생성
yarn typeorm migration:generate -n DescriptiveChangeName

# 3. src/migrations/의 생성된 SQL 검토
# 4. 마이그레이션 테스트
yarn typeorm:run

# 5. 마이그레이션 파일 커밋
git add src/migrations/*.ts
git commit -m "feat: [변경 설명]을 위한 마이그레이션 추가"
```

### 2. Spring 백엔드 호환성

**JWT 토큰 포맷**: 레거시 Spring 백엔드와 일치해야 함
- 시크릿 키: base64 인코딩
- 알고리즘: HS512
- 토큰 구조: { sub: 'ATK'|'RTK', jti: memberId }

**비밀번호 해싱**: `{bcrypt}` 접두사를 가진 Bcrypt
- `src/common/bcrypt/bcrypt.service.ts` 참조
- 해싱 알고리즘 변경 금지

### 3. 에러 메시지 중앙화

모든 HTTP 에러 메시지는 `src/common/utils/error-messages/`에 위치
- 도메인별로 구성
- 쉬운 번역 지원
- 일관된 에러 응답

### 4. 응답 직렬화

**민감한 필드 제외**:
```typescript
import { Exclude } from 'class-transformer';

export class MemberEntity {
  @Exclude()
  password: string;  // 클라이언트로 절대 전송되지 않음
}
```

### 5. CORS 설정

`src/main.ts`의 화이트리스트:
- 관리자 포털: admin2.turtleskool.com
- 메인 앱: turtleskool.com
- Vercel 배포
- 개발용 Localhost

### 6. 캐싱 전략

Redis를 사용한 전역 캐시 모듈:
- 기본 TTL: 5초
- 캐시되는 데이터: 사용자 구독, 참조 데이터, 계산된 점수
- 오래된 데이터를 피하기 위해 캐시 키를 신중하게 관리해야 함

### 7. Firebase 통합

**선택 사항**: 자격 증명이 없으면 정상적으로 비활성화됨
- 프로젝트 루트에 `firebase-service-account-key.json` 배치
- 클라우드 메시징/알림에 사용
- 초기화는 `src/main.ts` 참조

## 테스트 패턴

### 유닛 테스트
```bash
# 특정 테스트 파일 실행
yarn test src/modules/members/members.service.spec.ts

# TDD를 위한 Watch 모드
yarn test:watch

# 커버리지 리포트
yarn test:cov
```

### E2E 테스트
```bash
yarn test:e2e
```

**E2E 테스트 구조**: `test/` 디렉토리 참조
- 별도의 테스트 데이터베이스 사용
- 전체 HTTP 요청/응답 테스트
- 인증 플로우 테스트

## 일반적인 개발 작업

### 새 모듈 추가

```bash
# 모듈 생성
nest g module modules/new-feature
nest g controller modules/new-feature
nest g service modules/new-feature

# src/database/entities/new-feature/에 엔티티 생성
# TypeOrmConfigService의 entities 배열에 엔티티 추가
# 마이그레이션 생성
yarn typeorm migration:generate -n AddNewFeature
```

### 새 라우트 추가

1. 모듈에 DTO 생성 (예: `create-feature.dto.ts`)
2. 검증 데코레이터 추가 (`class-validator`)
3. Swagger 데코레이터 추가 (`@ApiProperty()`)
4. 컨트롤러 메서드 구현
5. 서비스 로직 추가
6. `/swagger`의 Swagger UI로 테스트

### 디버깅 팁

**Winston 로그**: `logs/` 디렉토리 확인
- `error/`: 스택 트레이스가 포함된 에러 로그
- `combined/`: 모든 애플리케이션 로그
- 일일 로테이션 활성화됨

**Sentry**: 프로덕션 에러 추적
- `SentryInterceptor`를 통한 자동 에러 리포팅
- 스택 트레이스는 Sentry 대시보드 확인

**데이터베이스 쿼리**: TypeORM 로깅 활성화
- `TypeOrmConfigService`에서 `logging: true` 설정
- 콘솔에서 SQL 쿼리 확인

## 배포

### Google Cloud 배포
```bash
yarn gcloud:auth       # 인증
yarn gcloud:config     # 프로젝트 설정
yarn gcloud:deploy     # App Engine에 배포
```

### 환경별 빌드
- 개발: `.env.development` 사용
- 프로덕션: `.env.production` 또는 호스팅 플랫폼의 환경 변수 사용

## 중요 참고사항

### TypeScript 설정
- Strict 모드: **비활성화** (빠른 개발을 위한 느슨한 타이핑)
- Target: ES2021
- Module: Node16
- 깔끔한 임포트를 위한 경로 별칭 설정

### 데이터베이스 호환성
- **프로덕션**: PostgreSQL 14+
- **개발**: Docker PostgreSQL (권장) 또는 better-sqlite3
- 일부 엔티티는 PostgreSQL 전용 타입 사용 (timestamp, array)

### 외부 서비스 의존성
- **Iamport**: 결제 게이트웨이 (결제 기능에 필수)
- **Aligo**: SMS 서비스 (알림에 필수)
- **Firebase**: 선택 사항 (클라우드 메시징)
- **Redis**: 프로덕션에서 캐싱에 필수

### 보안 고려사항
- 모든 비밀번호는 bcrypt로 해싱
- JWT 시크릿은 base64 인코딩 필수
- 실제 자격 증명이 포함된 `.env.*` 파일 커밋 금지
- `.env.example`을 템플릿으로 사용
- `@Exclude()` 데코레이터를 통한 민감한 필드 제외

### 성능 최적화
- 자주 접근하는 데이터에 대한 Redis 캐싱
- TypeORM에 설정된 커넥션 풀링
- 적절한 경우 엔티티 관계에 대한 지연 로딩

## 트러블슈팅

### PostgreSQL 인증 실패

**증상**: `password authentication failed for user "tsuser"`

**원인**: Docker 볼륨에 이전 자격 증명이 남아있어 새 환경변수가 적용되지 않음

**해결**:
```bash
# 1. 컨테이너와 볼륨 완전 정리
docker stop geobuk-postgres
docker rm geobuk-postgres
docker volume prune -f

# 2. 새 컨테이너 생성
docker run --name geobuk-postgres \
  -e POSTGRES_PASSWORD=tsuser1234 \
  -e POSTGRES_USER=tsuser \
  -e POSTGRES_DB=geobukschool_dev \
  -p 5432:5432 -d postgres:14

# 3. 연결 확인
docker exec geobuk-postgres psql -U tsuser -d geobukschool_dev -c "SELECT 1;"
```

### 포트 5432 충돌

**증상**: `port is already allocated` 또는 연결 실패

**해결**:
```bash
# 5432 포트 사용 중인 컨테이너 확인
docker ps --filter "publish=5432"

# 해당 컨테이너 중지
docker stop [컨테이너명]
```

### JSON 파일 로드 실패

**증상**: `ENOENT: no such file or directory ... score-table-26-jungsi.json`

**원인**: NestJS assets 복사 경로와 코드의 경로 참조 불일치

**해결**:
- `nest-cli.json`의 assets는 `dist/modules/...`로 복사
- 코드에서 `dist/modules/jungsi/calculation/data/` 경로 우선 확인
- 임시 해결: `yarn build` 후 수동으로 JSON 파일 복사

### 서버 시작 체크리스트

1. **Docker 상태 확인**: `docker ps` - geobuk-postgres 실행 중?
2. **DB 연결 테스트**: `docker exec geobuk-postgres psql -U tsuser -d geobukschool_dev -c "SELECT 1;"`
3. **포트 확인**: `netstat -an | findstr 5432` (Windows)
4. **dist 폴더 정리**: 문제 시 `rm -rf dist && yarn start:dev`

## 참고 자료

- **상세 설정 가이드**: `DEVELOPMENT-SETUP.md` 참조
- **README**: 빠른 시작은 `README.md` 참조
- **API 문서**: http://localhost:4001/swagger (자동 생성)
- **TypeORM 문서**: https://typeorm.io/
- **NestJS 문서**: https://docs.nestjs.com/
