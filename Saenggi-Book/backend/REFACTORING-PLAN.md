# 거북스쿨 백엔드 리팩토링 계획

> **작성일**: 2025-11-24
> **상태**: 진행 중 (Phase 3.1 진행 중)
> **목적**: 기존 기능 복원 및 코드 품질 개선

---

## 📋 목차

1. [개요](#개요)
2. [Phase 1: 핵심 기능 복원](#phase-1-핵심-기능-복원-week-1)
3. [Phase 2: 모듈 구조 정렬](#phase-2-모듈-구조-정렬-week-2)
4. [Phase 3: 품질 개선](#phase-3-품질-개선-week-3)
5. [진행 체크리스트](#진행-체크리스트)

---

## 개요

### 리팩토링 목표

1. **누락된 기능 복원**: AWS S3 파일 업로드, Sentry, OpenTelemetry
2. **코드 품질 향상**: TypeScript 타입 안전성, 에러 처리, 로깅 일관성
3. **문서화 개선**: README, API 문서, 아키텍처 문서
4. **테스트 커버리지 증가**: 단위 테스트, 통합 테스트, E2E 테스트

### 우선순위

- **Priority 1 (Week 1)**: 핵심 기능 복원 (파일 업로드, 에러 추적)
- **Priority 2 (Week 2)**: 구조 개선 (로깅, 환경 설정, 마이그레이션)
- **Priority 3 (Week 3)**: 품질 향상 (Swagger, 테스트, 성능 모니터링)

---

## Phase 1: 핵심 기능 복원 (Week 1)

### 1.1 기존 코드 분석 (Day 1-2)

**목표**: 현재 상태 파악 및 누락 기능 식별

**작업 내용**:

1. **코드베이스 분석**
   - 모듈 구조 파악
   - 의존성 분석
   - 누락 기능 리스트업

2. **현재 동작 확인**
   - 서버 실행 테스트
   - API 엔드포인트 확인
   - 데이터베이스 연결 확인

3. **문서 정리**
   - `REFACTORING-PLAN.md` 작성
   - `REFACTORING-SUMMARY.md` 작성
   - 현재 상태 문서화

**완료 기준**:
- ✅ 코드베이스 이해도 80% 이상
- ✅ 누락 기능 리스트 작성
- ✅ 기술 스택 정리
- ✅ 리팩토링 계획 수립

---

### 1.2 Google Cloud Storage로 파일 업로드 복원 (Day 3-5)

**목표**: AWS S3를 Google Cloud Storage (GCS)로 대체

**작업 내용**:

1. **의존성 추가**
   ```bash
   yarn add @google-cloud/storage
   yarn add -D @types/multer
   ```

2. **GCS 설정 모듈 생성**
   ```
   src/gcs-upload/
   ├── config/
   │   ├── gcs-upload-config.type.ts
   │   └── gcs-upload-config.ts
   ├── controllers/
   │   └── file-upload.controller.ts
   ├── gcs-upload.service.ts
   └── gcs-upload.module.ts
   ```

3. **GCS 서비스 구현**
   ```typescript
   // gcs-upload.service.ts
   @Injectable()
   export class GcsUploadService {
     constructor(
       @Inject(gcsUploadConfig.KEY)
       private readonly config: ConfigType<typeof gcsUploadConfig>,
     ) {}

     async uploadFile(file: Express.Multer.File) {
       // GCS 업로드 로직
     }

     async deleteFile(fileName: string) {
       // GCS 파일 삭제
     }
   }
   ```

4. **기존 파일 엔티티와 통합**
   - `FileEntity` 수정 또는 생성
   - GCS URL 저장 로직

**완료 기준**:
- ✅ GCS 업로드 기능 구현
- ✅ Signed URL 생성 기능
- ✅ 파일 삭제 기능
- ✅ API 테스트 통과
- ✅ 기존 파일 엔티티와 통합

---

### 1.3 Sentry 통합 완료 (Day 5)

**목표**: 프로덕션 에러 추적 완전 구현

**작업 내용**:

1. **의존성 추가**
   ```bash
   yarn add @sentry/nestjs @sentry/profiling-node
   ```

2. **Sentry 초기화**
   ```typescript
   // instrumentation.ts
   import * as Sentry from '@sentry/nestjs';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

3. **에러 인터셉터 개선**
   ```typescript
   // sentry.interceptor.ts
   import * as Sentry from '@sentry/nestjs';

   @Injectable()
   export class SentryInterceptor implements NestInterceptor {
     intercept(context: ExecutionContext, next: CallHandler) {
       return next.handle().pipe(
         catchError(err => {
           Sentry.withScope(scope => {
             // 상세한 컨텍스트 추가
             scope.setContext('request', {/* ... */});
             Sentry.captureException(err);
           });
           throw err;
         })
       );
     }
   }
   ```

4. **환경 변수 설정**
   ```env
   SENTRY_DSN=https://your-sentry-dsn
   SENTRY_ENVIRONMENT=development
   ```

**완료 기준**:
- ✅ @sentry/nestjs 설치 및 설정
- ✅ 에러 자동 추적
- ✅ 성능 트레이싱 활성화
- ✅ 환경별 구분 (dev/prod)
- ✅ 테스트 에러 발생 → Sentry 확인

---

## Phase 2: 모듈 구조 정렬 (Week 2)

### 2.1 로깅 표준화 (Day 1-2)

**목표**: 일관된 로깅 레벨 및 메시지 포맷

**작업 내용**:

1. **로깅 가이드라인 정립**
   ```typescript
   // 로깅 레벨 사용 기준
   logger.debug()   // 개발 디버깅용 상세 정보
   logger.log()     // 일반 정보 (기본 사용)
   logger.info()    // 중요 정보 (성공적인 작업 완료)
   logger.warn()    // 경고 (예상치 못한 상황, 처리됨)
   logger.error()   // 에러 (실패, 재시도 필요)
   ```

2. **서비스별 로깅 개선**
   ```typescript
   // Before (불일치)
   this.logger.warn('SMS 발송 성공');  // ❌ 성공은 info

   // After (일관됨)
   this.logger.info('SMS 발송 성공');  // ✅ 올바름
   this.logger.warn('SMS 발송 재시도 중'); // ✅ 경고
   this.logger.error('SMS 발송 실패', error); // ✅ 에러
   ```

3. **로깅 컨텍스트 추가**
   ```typescript
   this.logger.log('사용자 로그인 성공', {
     memberId: user.id,
     email: user.email,
     timestamp: new Date(),
   });
   ```

**영향받는 파일**:
- `src/modules/sms/sms.service.ts`
- `src/modules/pay/pay.service.ts`
- `src/modules/auth/auth.service.ts`
- 기타 모든 서비스 파일

**완료 기준**:
- ✅ 로깅 가이드라인 문서 작성 (`LOGGING-GUIDELINES.md`)
- ✅ 전체 서비스 로깅 레벨 검토 및 수정
- ✅ 로깅 컨텍스트 추가
- ✅ 코드 리뷰 통과

---

### 2.2 환경 설정 문서화 (Day 3)

**목표**: 개발 환경 설정 명확화 및 문서화

**작업 내용**:

1. **DEVELOPMENT-SETUP.md 업데이트**
   - ✅ Cloud SQL 연결 방법 (Proxy, Public IP, Private IP)
   - ✅ PostgreSQL vs MySQL 차이점 설명
   - ✅ Redis 캐싱 설정 (Docker, 로컬, Memorystore)
   - ✅ GCS 파일 업로드 설정 (버킷 생성, 서비스 계정)
   - ✅ Firebase Admin SDK 설정
   - ✅ Sentry 에러 추적 설정

2. **환경 변수 템플릿 개선**
   - ✅ `.env.example` 상세 코멘트 추가
   - ✅ 각 변수별 설명 및 예제
   - ✅ 필수/선택 항목 구분
   - ✅ 보안 체크리스트 포함

3. **설정 검증 스크립트**
   - ✅ `scripts/validate-env.js` 생성
   - ✅ 필수 환경 변수 존재 확인
   - ✅ DB_SYNCHRONIZE 안전성 체크
   - ✅ JWT 시크릿 강도 확인
   - ✅ 서비스 계정 키 파일 확인
   - ✅ 데이터베이스 설정 검증
   - ✅ Redis 설정 검증
   - ✅ 모니터링 설정 확인

**완료 기준**:
- ✅ DEVELOPMENT-SETUP.md 업데이트 (Cloud SQL, Redis, GCS, Firebase, Sentry)
- ✅ .env.example 완성 (상세 코멘트 포함)
- ✅ 설정 검증 스크립트 작성 (`yarn validate:env`)
- ✅ package.json에 검증 스크립트 추가
- ✅ 빌드 테스트 통과

---

### 2.3 데이터베이스 마이그레이션 검증 (Day 4-6)

**목표**: PostgreSQL 호환성 확인 및 마이그레이션 전략 수립

**작업 내용**:

1. **엔티티 PostgreSQL 호환성 검토**
   - ✅ 53개 엔티티 파일 검토 완료
   - ✅ timestamp 타입 사용 확인 (PostgreSQL 완전 호환)
   - ✅ JSON/JSONB 타입 미사용 확인
   - ✅ Array 타입 미사용 확인
   - ⚠️ MySQL 전용 `onUpdate: 'CURRENT_TIMESTAMP'` 발견 (3개 파일)
   - ⚠️ `default: 'now()'` 구문 발견 (1개 파일)

2. **MySQL 호환성 이슈 식별**
   ```typescript
   // 문제가 있는 엔티티
   src/database/entities/boards/comment.entity.ts:29
   src/database/entities/boards/post.entity.ts:33-34
   src/database/entities/member/member-regular-combination.entity.ts:45
   src/database/entities/member/member-recruitment-unit-combination.entity.ts:45
   ```

3. **마이그레이션 구조 생성**
   - ✅ `src/migrations/` 디렉토리 생성
   - ✅ `ormconfig.ts` 생성 (TypeORM CLI 설정)
   - ✅ 초기 마이그레이션 생성: `1732512000000-InitialSchema.ts`
   - ✅ 트리거 마이그레이션 생성: `1732512100000-AddUpdateTimestampTriggers.ts`

4. **마이그레이션 전략 문서화**
   - ✅ `MIGRATION-GUIDE.md` 작성
   - ✅ PostgreSQL 호환성 분석 결과 문서화
   - ✅ onUpdate 이슈 해결 방법 제시
   - ✅ DB_SYNCHRONIZE 사용 가이드라인 작성
   - ✅ 데이터 무결성 검증 체크리스트 작성
   - ✅ 롤백 전략 문서화

5. **동기화 전략 정의**
   ```typescript
   // TypeOrmConfigService에서 프로덕션 안전장치 구현
   if (nodeEnv === 'production' && dbConfig.synchronize === true) {
     throw new Error('DB_SYNCHRONIZE=true is prohibited in production');
   }
   ```

**완료 기준**:
- ✅ 모든 엔티티 PostgreSQL 호환성 확인
- ✅ MySQL 호환성 이슈 식별 (4개 파일)
- ✅ 마이그레이션 스크립트 생성 (2개)
- ✅ 마이그레이션 가이드 문서 작성 (MIGRATION-GUIDE.md)
- ✅ DB_SYNCHRONIZE 사용 지침 문서화
- ✅ 데이터 무결성 검증 방법 문서화
- ✅ 롤백 전략 수립

**참고 문서**:
- `MIGRATION-GUIDE.md`: 상세한 마이그레이션 가이드
- `ormconfig.ts`: TypeORM CLI 설정
- `src/migrations/`: 마이그레이션 스크립트

---

## Phase 3: 품질 개선 (Week 3)

### 3.1 Swagger API 문서 완성 (Day 1-2)

**목표**: 모든 엔드포인트 Swagger 문서화

**작업 내용**:

1. **전역 Swagger 설정 개선** ✅
   - ✅ `main.ts` DocumentBuilder 설정 업데이트
   - ✅ 상세한 API 설명 추가 (인증 방법, 에러 형식 등)
   - ✅ Bearer Auth 설정 추가
   - ✅ 13개 API 태그 정의
   - ✅ Swagger UI 커스터마이징 (CSS, JS)
   - ✅ 버전 2.0.0으로 업데이트

2. **Auth 모듈 완전 문서화** ✅
   - ✅ `auth.controller.ts` 완전 문서화 (11개 엔드포인트)
     - ✅ @ApiTags('auth') 추가
     - ✅ 모든 엔드포인트 @ApiOperation() 추가
     - ✅ Protected 엔드포인트 @ApiBearerAuth() 추가
     - ✅ 모든 가능한 @ApiResponse() 추가
   - ✅ Auth 관련 7개 DTO 문서화
     - ✅ `loginWithEmailDto`
     - ✅ `RegisterWithEmailDto`
     - ✅ `LoginWithSocialDto`
     - ✅ `RegisterWithSocialDto`
     - ✅ `RefreshTokenDto`
     - ✅ `SendSignupCodeDto`
     - ✅ `VerifyCodeDto`

3. **Swagger 가이드라인 문서 작성** ✅
   - ✅ `SWAGGER-GUIDELINES.md` 작성 (포괄적인 가이드)
   - ✅ Decorator 참조 (8가지 주요 decorator)
   - ✅ Controller 문서화 템플릿 (4가지 패턴)
   - ✅ DTO 문서화 가이드 (8가지 필드 타입별)
   - ✅ Best Practices (5가지 주요 원칙)
   - ✅ 코드 템플릿 (Controller, DTO)
   - ✅ 완성 예제 (AuthController 전체)
   - ✅ 문서화 체크리스트

4. **나머지 컨트롤러 문서화** (39개 남음)
   - [ ] `members.controller.ts` 문서화
   - [ ] `pay.controller.ts` 문서화
   - [ ] `schoolrecord.controller.ts` 문서화
   - [ ] `susi.controller.ts` 문서화
   - [ ] 기타 36개 컨트롤러 문서화

**완료 기준**:
- ✅ main.ts Swagger 설정 개선
- ✅ Auth 모듈 완전 문서화 (Controller + DTOs)
- ✅ SWAGGER-GUIDELINES.md 작성
- ✅ 빌드 테스트 통과
- [ ] 모든 컨트롤러 Swagger 문서화 (1/40 완료)
- [ ] 모든 DTO에 ApiProperty 추가
- [ ] Swagger UI 접근성 테스트

**참고 문서**:
- `SWAGGER-GUIDELINES.md`: Swagger 문서화 가이드라인
- `src/auth/auth.controller.ts`: 완성된 문서화 예제
- `src/auth/dtos/`: 완성된 DTO 문서화 예제

---

### 3.2 OpenTelemetry 성능 모니터링 (Day 3-4)

**목표**: 애플리케이션 성능 추적 및 병목 지점 파악

**작업 내용**:

1. **의존성 추가**
   ```bash
   yarn add @opentelemetry/api @opentelemetry/sdk-node
   yarn add @opentelemetry/auto-instrumentations-node
   yarn add @opentelemetry/exporter-trace-otlp-http
   ```

2. **OpenTelemetry 설정**
   ```typescript
   // tracing.ts
   import { NodeSDK } from '@opentelemetry/sdk-node';
   import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

   const sdk = new NodeSDK({
     traceExporter: new OTLPTraceExporter(),
     instrumentations: [getNodeAutoInstrumentations()],
   });

   sdk.start();
   ```

3. **커스텀 스팬 추가**
   ```typescript
   import { trace } from '@opentelemetry/api';

   async processPayment() {
     const tracer = trace.getTracer('payment-service');
     const span = tracer.startSpan('process_payment');

     try {
       // 결제 처리 로직
       span.addEvent('payment_verified');
     } finally {
       span.end();
     }
   }
   ```

**완료 기준**:
- [ ] OpenTelemetry 기본 설정
- [ ] HTTP 요청 자동 추적
- [ ] 데이터베이스 쿼리 추적
- [ ] 커스텀 스팬 추가
- [ ] Jaeger/Zipkin 연동 (선택)

---

### 3.3 테스트 커버리지 개선 (Day 5-7)

**목표**: 테스트 커버리지 70% 이상 달성

**작업 내용**:

1. **단위 테스트 작성**
   ```typescript
   // payment.service.spec.ts
   describe('PaymentService', () => {
     it('should validate payment successfully', async () => {
       const result = await service.validatePayment('imp_uid', 'merchant_uid');
       expect(result).toBeDefined();
     });
   });
   ```

2. **통합 테스트 추가**
   ```typescript
   // payment.e2e-spec.ts
   describe('Payment API (e2e)', () => {
     it('/payment/validate (POST)', () => {
       return request(app.getHttpServer())
         .post('/payment/validate')
         .send({ impUid: 'test', merchantUid: 'test' })
         .expect(200);
     });
   });
   ```

3. **모킹 전략**
   ```typescript
   const mockPaymentRepository = {
     findOne: jest.fn(),
     save: jest.fn(),
   };
   ```

**완료 기준**:
- [ ] 핵심 서비스 단위 테스트 작성
- [ ] E2E 테스트 추가
- [ ] 테스트 커버리지 70% 이상
- [ ] CI/CD 파이프라인에 테스트 통합

---

## 진행 체크리스트

### Week 1: 핵심 기능 복원

- [x] **Day 1-2**: 코드베이스 분석 ✅
- [x] **Day 3-5**: GCS 파일 업로드 구현 ✅
- [x] **Day 5**: Sentry 통합 완료 ✅

### Week 2: 모듈 구조 정렬

- [x] **Day 1-2**: 로깅 표준화 ✅
- [x] **Day 3**: 환경 설정 문서화 ✅
- [x] **Day 4-6**: 데이터베이스 마이그레이션 검증 ✅

### Week 3: 품질 개선

- [~] **Day 1-2**: Swagger API 문서 완성 (진행 중, Auth 모듈 완료)
- [ ] **Day 3-4**: OpenTelemetry 성능 모니터링
- [ ] **Day 5-7**: 테스트 커버리지 개선

---

## 기대 효과

1. **안정성 향상**
   - 에러 추적 완전 구현
   - 성능 모니터링
   - 테스트 커버리지 증가

2. **개발 생산성 향상**
   - 명확한 API 문서
   - 일관된 로깅
   - 환경 설정 자동화

3. **유지보수성 개선**
   - TypeScript 타입 안전성
   - 코드 품질 향상
   - 문서화 완성

---

**작성자**: Claude Code
**버전**: 1.4
**마지막 업데이트**: 2025-11-25
