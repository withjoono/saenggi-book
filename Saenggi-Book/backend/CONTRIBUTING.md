# CONTRIBUTING.md

거북스쿨 백엔드 기여 가이드입니다.

---

## Git 커밋 컨벤션

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type (필수)

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat(jungsi): 환산점수 계산 API 추가` |
| `fix` | 버그 수정 | `fix(susi): 교과 점수 계산 오류 수정` |
| `docs` | 문서 수정 | `docs: README 업데이트` |
| `style` | 코드 포맷팅 (기능 변경 없음) | `style: lint 오류 수정` |
| `refactor` | 코드 리팩토링 | `refactor(pay): 결제 서비스 구조 개선` |
| `test` | 테스트 추가/수정 | `test(jungsi): 환산점수 유닛 테스트 추가` |
| `chore` | 빌드, 설정 변경 | `chore: package.json 업데이트` |
| `perf` | 성능 개선 | `perf(mock-exam): 쿼리 최적화` |
| `revert` | 커밋 되돌리기 | `revert: feat(jungsi) 커밋 취소` |

### Scope (권장)

기능 모듈명을 사용합니다. `feature-map.json` 참조.

| Scope | 설명 |
|-------|------|
| `jungsi` | 정시 관련 |
| `susi` | 수시 관련 |
| `essay` | 논술 관련 |
| `schoolrecord` | 학생부 관련 |
| `mock-exam` | 모의고사 관련 |
| `pay` | 결제 관련 |
| `planner` | 플래너 관련 |
| `members` | 회원 관련 |
| `board` | 게시판 관련 |
| `mentoring` | 멘토링 관련 |
| `officer` | 입학사정관 관련 |
| `shared` | 공용 파일 수정 |
| `admin` | 관리자 관련 |

### Subject (필수)

- 50자 이내
- 현재형 동사로 시작 (추가, 수정, 삭제)
- 마침표 없음

### Body (선택)

- 변경 이유 설명
- 72자마다 줄바꿈

### Footer (선택)

- `BREAKING CHANGE:` - 호환성 깨지는 변경
- `Closes #123` - 이슈 연결
- `[affects: scope1, scope2]` - 영향받는 다른 모듈

---

## 커밋 메시지 예시

### 단일 기능 수정
```
feat(jungsi): 환산점수 코드화 기능 추가

- scoreCalculationCode 필드 추가 (SC001~SC488)
- 기존 scoreCalculation 필드 유지 (하위 호환성)
```

### 공용 파일 수정 (영향 범위 표기)
```
feat(shared): MemberEntity에 lastLoginAt 필드 추가

회원 마지막 로그인 시간 기록을 위한 필드 추가

[affects: jungsi, susi, pay, members]
```

### 버그 수정
```
fix(jungsi): 환산점수 계산 시 NULL 처리 오류 수정

- score_calculation_code가 NULL인 경우 빈 문자열 반환
- 영향받는 행: 2,332건

Closes #45
```

### 호환성 깨지는 변경
```
feat(mock-exam)!: API 응답 형식 변경

- standardScore를 number에서 string으로 변경
- percentile 필드명을 percentileRank로 변경

BREAKING CHANGE: 프론트엔드 수정 필요
[affects: jungsi, susi]
```

### DB 마이그레이션 포함
```
feat(jungsi): 정시 입결 테이블 구조 변경

- previous_result 테이블에 percentile_50, percentile_70 컬럼 추가
- 마이그레이션: migrations/20251217_add_percentile_columns.sql
```

---

## 브랜치 전략

### 브랜치 명명 규칙

```
<type>/<scope>-<description>
```

### 예시

| 브랜치명 | 설명 |
|---------|------|
| `feature/jungsi-score-code` | 정시 환산점수 코드화 기능 |
| `fix/susi-calculation-bug` | 수시 계산 버그 수정 |
| `refactor/pay-service` | 결제 서비스 리팩토링 |
| `hotfix/auth-token-expire` | 인증 토큰 만료 긴급 수정 |

### 브랜치 흐름

```
main (프로덕션)
  └── develop (개발)
        ├── feature/jungsi-xxx
        ├── feature/susi-xxx
        └── fix/xxx-bug
```

---

## PR (Pull Request) 가이드

### PR 제목
커밋 메시지와 동일한 형식 사용

```
feat(jungsi): 환산점수 코드화 기능 추가
```

### PR 본문 템플릿

```markdown
## 변경 사항
- [ ] 새로운 기능 추가
- [ ] 버그 수정
- [ ] 리팩토링
- [ ] 문서 수정

## 설명
변경 내용에 대한 자세한 설명

## 영향 범위
- **직접 수정**: jungsi 모듈
- **간접 영향**: (없음 / 있음: scope1, scope2)

## 테스트
- [ ] 로컬 테스트 완료
- [ ] 유닛 테스트 추가/수정
- [ ] E2E 테스트 완료

## 마이그레이션
- [ ] DB 마이그레이션 필요 없음
- [ ] 마이그레이션 SQL 포함: `파일명`

## 체크리스트
- [ ] `DEPENDENCY-MAP.md` 업데이트 (공용 파일 수정 시)
- [ ] `feature-map.json` changeLog 업데이트
- [ ] Swagger 문서 확인
- [ ] 프론트엔드 담당자에게 공유 (API 변경 시)
```

---

## 코드 리뷰 체크리스트

### 일반
- [ ] 커밋 메시지가 컨벤션을 따르는가?
- [ ] 불필요한 console.log가 없는가?
- [ ] 하드코딩된 값이 없는가?

### 공용 파일 수정 시
- [ ] 영향받는 모듈이 모두 파악되었는가?
- [ ] `[affects: ...]` 태그가 있는가?
- [ ] 하위 호환성이 유지되는가?

### DB 변경 시
- [ ] 마이그레이션 SQL이 포함되었는가?
- [ ] 롤백 SQL이 준비되었는가?
- [ ] 프로덕션 데이터 영향도가 파악되었는가?

### API 변경 시
- [ ] Swagger 문서가 업데이트되었는가?
- [ ] 하위 호환성이 유지되는가?
- [ ] 프론트엔드 팀에 공유되었는가?

---

## 유용한 Git 명령어

### 커밋 전 변경 파일 확인
```bash
git status
git diff --stat
```

### 영향 범위 확인 (특정 파일을 참조하는 파일 찾기)
```bash
grep -r "import.*from.*파일명" src/ --include="*.ts"
```

### 최근 커밋 메시지 수정
```bash
git commit --amend -m "새로운 메시지"
```

### 커밋 기록 확인
```bash
git log --oneline -10
git log --oneline --grep="jungsi"  # 특정 scope 검색
```

---

## 코딩 스타일 가이드

### 명명 규칙 (Naming Conventions)

#### TypeScript/JavaScript

| 대상 | 규칙 | 예시 |
|-----|------|------|
| 변수 | camelCase | `memberScore`, `calculatedResult` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| 함수 | camelCase | `calculateScore()`, `getMemberById()` |
| 클래스 | PascalCase | `MemberService`, `JungsiCalculationService` |
| 인터페이스 | PascalCase (접두사 없음) | `ScoreResult`, `MemberInfo` |
| 타입 | PascalCase | `ScoreType`, `CalculationMethod` |
| Enum | PascalCase (값은 UPPER_SNAKE_CASE) | `UserRole.ROLE_ADMIN` |
| 파일명 | kebab-case | `member.service.ts`, `calculate-score.dto.ts` |
| 디렉토리 | kebab-case | `mock-exam/`, `school-record/` |

```typescript
// ✅ 올바른 예시
const memberScore = 85.5;
const MAX_ATTEMPTS = 3;

function calculateTotalScore(scores: number[]): number { ... }

class MemberCalculatedScoreService { ... }

interface CalculationResult {
  totalScore: number;
  percentile: number;
}

enum ScoreType {
  STANDARD_SCORE = 'STANDARD_SCORE',
  PERCENTILE = 'PERCENTILE',
}

// ❌ 잘못된 예시
const member_score = 85.5;        // snake_case 사용
const maxAttempts = 3;            // 상수에 camelCase 사용
function calculate_total_score() { ... }  // snake_case 사용
class member_service { ... }      // PascalCase 아님
interface IScoreResult { ... }    // I 접두사 불필요
```

#### 데이터베이스 (Database)

| 대상 | 규칙 | 예시 |
|-----|------|------|
| 테이블명 | snake_case | `member_calculated_score`, `pay_contract` |
| 컬럼명 | snake_case | `member_id`, `created_at`, `total_score` |
| 외래키 | `{테이블}_id` | `member_id`, `university_id` |
| 인덱스 | `idx_{테이블}_{컬럼}` | `idx_member_calculated_score_member_id` |

```typescript
// TypeORM Entity 예시: DB는 snake_case, TS는 camelCase
@Entity('member_calculated_score')
export class MemberCalculatedScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;  // TS: camelCase, DB: snake_case

  @Column({ name: 'total_score', type: 'decimal', precision: 10, scale: 2 })
  totalScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

#### API Endpoint

| 대상 | 규칙 | 예시 |
|-----|------|------|
| URL 경로 | kebab-case | `/api/mock-exam/scores` |
| 쿼리 파라미터 | camelCase | `?memberId=123&examYear=2024` |
| Request Body | camelCase | `{ "memberId": 123, "scoreType": "standard" }` |
| Response Body | camelCase | `{ "totalScore": 85.5, "percentileRank": 92 }` |

```typescript
// ✅ 올바른 API 예시
@Controller('mock-exam')
export class MockExamController {
  @Get('scores')
  async getScores(
    @Query('memberId') memberId: number,   // camelCase
    @Query('examYear') examYear: number,
  ) { ... }

  @Post('calculate')
  async calculateScore(
    @Body() dto: CalculateScoreDto,  // DTO 필드는 camelCase
  ) { ... }
}

// DTO 예시
export class CalculateScoreDto {
  @IsNumber()
  memberId: number;

  @IsString()
  scoreType: string;  // camelCase
}
```

### 파일 구조 규칙

#### 모듈 구조 (NestJS 표준)

```
src/modules/{module-name}/
├── {module-name}.module.ts      # 모듈 정의
├── {module-name}.controller.ts  # 컨트롤러 (API 엔드포인트)
├── {module-name}.service.ts     # 서비스 (비즈니스 로직)
├── controllers/                 # 컨트롤러가 여러 개인 경우
│   ├── {feature}.controller.ts
│   └── {feature2}.controller.ts
├── services/                    # 서비스가 여러 개인 경우
│   ├── {feature}.service.ts
│   └── {feature2}.service.ts
├── dtos/                        # Data Transfer Objects
│   ├── create-{name}.dto.ts
│   ├── update-{name}.dto.ts
│   └── {name}-response.dto.ts
├── entities/                    # TypeORM 엔티티 (또는 database/entities에)
│   └── {name}.entity.ts
├── interfaces/                  # 인터페이스 정의
│   └── {name}.interface.ts
└── constants/                   # 상수 정의
    └── {name}.constants.ts
```

### Import 순서

```typescript
// 1. Node.js 내장 모듈
import * as fs from 'fs';
import * as path from 'path';

// 2. 외부 라이브러리
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 3. 내부 모듈 (절대 경로)
import { MemberEntity } from 'src/database/entities/member/member.entity';
import { JwtService } from 'src/common/jwt/jwt.service';

// 4. 상대 경로 (같은 모듈 내)
import { CalculateScoreDto } from './dtos/calculate-score.dto';
import { ScoreConstants } from './constants/score.constants';
```

### 주석 규칙

```typescript
/**
 * 복잡한 비즈니스 로직에 대한 설명
 *
 * @param memberId - 회원 ID
 * @param year - 입시 연도
 * @returns 환산점수 계산 결과
 * @throws NotFoundException 회원을 찾을 수 없는 경우
 */
async calculateConvertedScore(memberId: number, year: number): Promise<ScoreResult> {
  // 단일 라인 주석: 복잡한 로직 설명
  const rawScore = await this.getRawScore(memberId);

  /*
   * 여러 줄이 필요한 경우:
   * - 특별한 계산 로직 설명
   * - 예외 상황 설명
   */
  return this.applyConversionFormula(rawScore, year);
}
```

### 에러 처리 규칙

```typescript
// 에러 메시지는 중앙화된 파일에서 관리
// src/common/utils/error-messages/{domain}.errors.ts

// ✅ 올바른 에러 처리
import { MemberErrors } from 'src/common/utils/error-messages/member.errors';

if (!member) {
  throw new NotFoundException(MemberErrors.NOT_FOUND);
}

// ❌ 잘못된 에러 처리 (하드코딩)
if (!member) {
  throw new NotFoundException('회원을 찾을 수 없습니다');
}
```

---

## 분리 개발 가이드

여러 서비스를 독립적으로 개발하고 이 백엔드에 통합하는 방법입니다.

### 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    메인 백엔드 (GB-Back-Nest)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 정시모듈 │ │ 수시모듈 │ │ 결제모듈 │ │ 새모듈   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
        ↑             ↑             ↑             ↑
        │             │             │             │
   [분리개발1]   [분리개발2]   [분리개발3]   [분리개발4]
```

### 방법 1: NestJS 라이브러리로 분리 개발 (권장)

독립적인 NestJS 라이브러리로 개발 후 npm 패키지로 통합하는 방식입니다.

#### 1단계: 새 라이브러리 프로젝트 생성

```bash
# 새 프로젝트 생성
nest new my-feature-lib --package-manager yarn

# 또는 monorepo 스타일로 생성
nest g library my-feature
```

#### 2단계: 라이브러리 구조

```
my-feature-lib/
├── src/
│   ├── my-feature.module.ts       # 메인 모듈 (export용)
│   ├── my-feature.service.ts      # 비즈니스 로직
│   ├── my-feature.controller.ts   # API 엔드포인트
│   ├── dtos/
│   │   └── *.dto.ts
│   ├── entities/
│   │   └── *.entity.ts            # TypeORM 엔티티
│   └── index.ts                   # 외부 export
├── package.json
└── tsconfig.json
```

#### 3단계: package.json 설정

```json
{
  "name": "@geobuk/my-feature",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.0"
  }
}
```

#### 4단계: 메인 백엔드에 통합

```bash
# 로컬 개발 시 (yarn link 사용)
cd my-feature-lib && yarn link
cd ../GB-Back-Nest && yarn link @geobuk/my-feature

# 또는 npm 패키지로 배포 후
yarn add @geobuk/my-feature
```

```typescript
// src/app.module.ts에 추가
import { MyFeatureModule } from '@geobuk/my-feature';

@Module({
  imports: [
    MyFeatureModule.forRoot({
      // 설정 옵션
    }),
    // ... 기존 모듈
  ],
})
export class AppModule {}
```

### 방법 2: Git Submodule로 분리 개발

코드를 별도 저장소로 관리하고 submodule로 연결하는 방식입니다.

#### 1단계: 별도 저장소 생성

```bash
# 새 저장소 생성
git init my-feature-module
cd my-feature-module

# NestJS 모듈 구조로 작성
mkdir -p src/{controllers,services,dtos,entities}
```

#### 2단계: Submodule로 연결

```bash
# 메인 프로젝트에서
git submodule add https://github.com/your-org/my-feature-module.git src/modules/my-feature

# submodule 업데이트
git submodule update --remote
```

### 방법 3: 독립 API 서버 (마이크로서비스)

완전히 독립적인 서비스로 개발하고 API로 통신하는 방식입니다.

#### 구조

```
┌───────────────────┐     HTTP/gRPC     ┌───────────────────┐
│  메인 백엔드       │ ←───────────────→ │  새 서비스 API     │
│  (GB-Back-Nest)   │                   │  (독립 서버)       │
└───────────────────┘                   └───────────────────┘
         ↓                                      ↓
    PostgreSQL                             별도 DB 가능
```

#### 통합 방법

```typescript
// src/modules/my-feature/my-feature.service.ts
@Injectable()
export class MyFeatureService {
  constructor(private readonly httpService: HttpService) {}

  async getDataFromExternalService(id: number) {
    const response = await this.httpService
      .get(`${process.env.MY_FEATURE_API_URL}/data/${id}`)
      .toPromise();
    return response.data;
  }
}
```

### API 계약 우선 개발 (API Contract First)

분리 개발 시 가장 중요한 것은 **API 계약**을 먼저 정의하는 것입니다.

#### 1단계: API 스펙 정의 (OpenAPI/Swagger)

```yaml
# api-spec/my-feature.yaml
openapi: 3.0.0
info:
  title: My Feature API
  version: 1.0.0

paths:
  /api/my-feature/{id}:
    get:
      summary: Get feature by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FeatureResponse'

components:
  schemas:
    FeatureResponse:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        score:
          type: number
```

#### 2단계: 공유 DTO/인터페이스 정의

```typescript
// shared-types/my-feature.types.ts
export interface FeatureResponse {
  id: number;
  name: string;
  score: number;
  createdAt: string;
}

export interface CreateFeatureDto {
  name: string;
  score: number;
}
```

### 권장 워크플로우

```
1. API 스펙 정의 (Swagger/OpenAPI)
   ↓
2. 공유 타입 정의 (interfaces, DTOs)
   ↓
3. 분리 개발 (독립 프로젝트)
   ↓
4. Mock 서버로 프론트엔드 개발 병행
   ↓
5. 메인 백엔드 통합
   ↓
6. E2E 테스트
```

### 체크리스트

#### 분리 개발 시작 전

- [ ] API 스펙 정의 완료
- [ ] 공유 타입/인터페이스 정의 완료
- [ ] 데이터베이스 스키마 설계 완료
- [ ] 기존 엔티티와의 관계 파악 완료
- [ ] 이 문서의 코딩 스타일 가이드 숙지

#### 통합 전

- [ ] 로컬 테스트 완료
- [ ] API 계약 준수 확인
- [ ] 명명 규칙 준수 확인 (camelCase/snake_case)
- [ ] ESLint/Prettier 검사 통과
- [ ] TypeORM 엔티티가 기존 패턴과 일치

#### 통합 후

- [ ] 전체 빌드 성공 (`yarn build`)
- [ ] 기존 테스트 통과 (`yarn test`)
- [ ] Swagger 문서에 새 API 표시 확인
- [ ] 프론트엔드 연동 테스트

---

## 자동화 도구

### Husky (Git Hooks)

이 프로젝트는 Husky로 Git 훅을 관리합니다:

- **commit-msg**: commitlint로 커밋 메시지 검사
- **pre-commit**: (설정 가능) lint, 테스트 실행

### ESLint + Prettier

```bash
# 수동 검사 및 수정
yarn lint          # ESLint 자동 수정
yarn format        # Prettier 포맷팅

# VS Code 설정 (자동 저장 시 포맷팅)
# .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Commitlint

커밋 메시지가 컨벤션을 따르지 않으면 커밋이 거부됩니다:

```bash
# ✅ 올바른 커밋 메시지
git commit -m "feat(jungsi): 환산점수 API 추가"

# ❌ 거부되는 커밋 메시지
git commit -m "작업함"  # type 없음
git commit -m "FEAT: 추가"  # type은 소문자
```
