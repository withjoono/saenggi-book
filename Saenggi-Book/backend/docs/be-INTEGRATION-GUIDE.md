# 분리 개발 프로젝트 통합 가이드

> **대상**: GB-Back-Nest에 통합될 분리 개발 프로젝트 (플래너 등)
> **버전**: 1.0.0
> **최종 수정**: 2024-12

---

## 목차

1. [개요](#개요)
2. [필수 설정 파일](#필수-설정-파일)
3. [명명 규칙](#명명-규칙)
4. [코드 스타일](#코드-스타일)
5. [프로젝트 구조](#프로젝트-구조)
6. [Git 커밋 컨벤션](#git-커밋-컨벤션)
7. [통합 체크리스트](#통합-체크리스트)
8. [FAQ](#faq)

---

## 개요

이 문서는 GB-Back-Nest(메인 백엔드)에 통합될 분리 개발 프로젝트가 따라야 할 표준을 정의합니다.

### 통합 흐름

```
┌─────────────────┐     통합      ┌─────────────────────────────┐
│  분리 프로젝트   │ ──────────→ │  GB-Back-Nest (메인 백엔드)   │
│  (플래너 등)    │              │  src/modules/{모듈명}/       │
└─────────────────┘              └─────────────────────────────┘
```

---

## 필수 설정 파일

아래 설정 파일들을 프로젝트에 복사하거나 동일하게 구성하세요.

### 1. `.prettierrc`

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 2. `.editorconfig`

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.ts]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### 3. `.eslintrc.js` (핵심 규칙)

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],

    // 명명 규칙 (중요!)
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
      { selector: 'function', format: ['camelCase'] },
      { selector: 'class', format: ['PascalCase'] },
      { selector: 'interface', format: ['PascalCase'] },
      { selector: 'typeAlias', format: ['PascalCase'] },
      { selector: 'enum', format: ['PascalCase'] },
      { selector: 'enumMember', format: ['UPPER_CASE', 'PascalCase'] },
    ],

    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
  },
};
```

### 4. `package.json` 스크립트

```json
{
  "scripts": {
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "validate": "yarn lint && yarn type-check"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.1.3"
  }
}
```

### 5. Git 훅 설정 (선택, 권장)

```bash
# 설치
yarn add -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Husky 초기화
npx husky install

# pre-commit 훅
npx husky add .husky/pre-commit "npx lint-staged"

# commit-msg 훅
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
```

**lint-staged 설정** (`package.json`에 추가):

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**commitlint.config.js**:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'test', 'chore', 'perf', 'revert'
    ]],
    'scope-enum': [1, 'always', [
      'planner',  // 플래너 scope 추가
      'shared', 'common', 'config'
    ]],
  },
};
```

---

## 명명 규칙

### TypeScript 코드

| 대상 | 규칙 | 올바른 예 | 잘못된 예 |
|-----|------|----------|----------|
| 변수 | camelCase | `memberScore` | `member_score` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY` | `maxRetry` |
| 함수 | camelCase | `calculateScore()` | `calculate_score()` |
| 클래스 | PascalCase | `PlannerService` | `planner_service` |
| 인터페이스 | PascalCase | `PlannerConfig` | `IPlannerConfig` |
| 타입 | PascalCase | `PlannerType` | `plannerType` |
| Enum | PascalCase | `PlannerStatus` | `PLANNER_STATUS` |
| Enum 값 | UPPER_CASE | `ACTIVE`, `INACTIVE` | `active` |
| 파일명 | kebab-case | `planner.service.ts` | `plannerService.ts` |
| 디렉토리 | kebab-case | `daily-planner/` | `dailyPlanner/` |

### 데이터베이스

| 대상 | 규칙 | 예시 |
|-----|------|------|
| 테이블명 | snake_case | `planner_task` |
| 컬럼명 | snake_case | `member_id`, `created_at` |
| 외래키 | `{테이블}_id` | `planner_id` |

### TypeORM Entity 예시

```typescript
// ✅ 올바른 예시
@Entity('planner_task')
export class PlannerTaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;  // TS: camelCase

  @Column({ name: 'task_title', type: 'varchar', length: 200 })
  taskTitle: string;  // TS: camelCase

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### API 설계

| 대상 | 규칙 | 예시 |
|-----|------|------|
| URL 경로 | kebab-case | `/api/planner/daily-tasks` |
| Query Param | camelCase | `?memberId=123&startDate=2024-01-01` |
| Request Body | camelCase | `{ "taskTitle": "공부하기" }` |
| Response Body | camelCase | `{ "isCompleted": true }` |

---

## 코드 스타일

### Import 순서

```typescript
// 1. Node.js 내장
import * as fs from 'fs';

// 2. 외부 라이브러리
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 3. 내부 모듈 (절대 경로)
import { MemberEntity } from 'src/database/entities/member/member.entity';

// 4. 상대 경로 (같은 모듈)
import { CreatePlannerDto } from './dtos/create-planner.dto';
```

### 주석 스타일

```typescript
/**
 * 플래너 태스크를 생성합니다.
 *
 * @param memberId - 회원 ID
 * @param dto - 생성 데이터
 * @returns 생성된 태스크
 * @throws NotFoundException - 회원을 찾을 수 없는 경우
 */
async createTask(memberId: number, dto: CreateTaskDto): Promise<TaskEntity> {
  // 단일 라인 주석
  const member = await this.findMember(memberId);

  /*
   * 여러 줄 주석:
   * - 복잡한 로직 설명
   * - 주의사항 등
   */
  return this.taskRepository.save({ ...dto, memberId });
}
```

### DTO 작성

```typescript
import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlannerTaskDto {
  @ApiProperty({ description: '태스크 제목', example: '수학 공부' })
  @IsString()
  @MaxLength(200)
  taskTitle: string;  // camelCase

  @ApiPropertyOptional({ description: '메모', example: '30분 집중' })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ description: '회원 ID', example: 123 })
  @IsNumber()
  memberId: number;
}
```

---

## 프로젝트 구조

### NestJS 모듈 표준 구조

```
src/modules/planner/
├── planner.module.ts           # 모듈 정의
├── planner.controller.ts       # 메인 컨트롤러
├── planner.service.ts          # 메인 서비스
├── controllers/                # 추가 컨트롤러
│   ├── task.controller.ts
│   └── schedule.controller.ts
├── services/                   # 추가 서비스
│   ├── task.service.ts
│   └── schedule.service.ts
├── dtos/                       # DTO 파일
│   ├── create-task.dto.ts
│   ├── update-task.dto.ts
│   └── task-response.dto.ts
├── entities/                   # 엔티티 (또는 database/entities에)
│   ├── planner-task.entity.ts
│   └── planner-schedule.entity.ts
├── interfaces/                 # 인터페이스
│   └── planner.interface.ts
└── constants/                  # 상수
    └── planner.constants.ts
```

### 모듈 작성 예시

```typescript
// planner.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlannerController } from './planner.controller';
import { PlannerService } from './planner.service';
import { PlannerTaskEntity } from './entities/planner-task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlannerTaskEntity]),
  ],
  controllers: [PlannerController],
  providers: [PlannerService],
  exports: [PlannerService],  // 다른 모듈에서 사용 시
})
export class PlannerModule {}
```

---

## Git 커밋 컨벤션

### 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(planner): 일일 태스크 API 추가` |
| `fix` | 버그 수정 | `fix(planner): 날짜 필터 오류 수정` |
| `docs` | 문서 | `docs(planner): README 업데이트` |
| `style` | 포맷팅 | `style(planner): prettier 적용` |
| `refactor` | 리팩토링 | `refactor(planner): 서비스 구조 개선` |
| `test` | 테스트 | `test(planner): 유닛 테스트 추가` |
| `chore` | 빌드/설정 | `chore(planner): eslint 설정 추가` |

### Scope

- `planner`: 플래너 관련
- `shared`: 공용 코드
- `config`: 설정

### 예시

```bash
# 기능 추가
git commit -m "feat(planner): 주간 일정 조회 API 추가"

# 버그 수정
git commit -m "fix(planner): 태스크 삭제 시 연관 데이터 처리"

# 리팩토링
git commit -m "refactor(planner): TaskService를 별도 파일로 분리"
```

---

## 통합 체크리스트

### 개발 시작 전

- [ ] 이 문서의 명명 규칙 숙지
- [ ] 설정 파일 복사 완료 (`.prettierrc`, `.editorconfig`, `.eslintrc.js`)
- [ ] `yarn lint` 실행 시 에러 없음
- [ ] API 스펙 정의 완료 (Swagger/OpenAPI)

### 개발 중

- [ ] 변수/함수: camelCase
- [ ] 클래스/인터페이스: PascalCase
- [ ] 파일명: kebab-case
- [ ] DB 컬럼: snake_case (Entity에서 `name:` 옵션 사용)
- [ ] DTO에 `class-validator` 데코레이터 적용
- [ ] DTO에 `@ApiProperty` Swagger 데코레이터 적용

### 통합 전

- [ ] `yarn lint` 통과
- [ ] `yarn type-check` (tsc --noEmit) 통과
- [ ] 모든 console.log 제거 또는 console.warn/error로 변경
- [ ] 하드코딩된 값 상수화
- [ ] 주석 및 JSDoc 작성

### 통합 후 (메인 백엔드에서)

- [ ] `yarn build` 성공
- [ ] `yarn test` 통과
- [ ] Swagger 문서 확인 (`/swagger`)
- [ ] API 동작 테스트

---

## FAQ

### Q: snake_case와 camelCase를 언제 사용하나요?

**A**:
- **TypeScript 코드**: 항상 camelCase (변수, 함수, 프로퍼티)
- **데이터베이스**: 항상 snake_case (테이블, 컬럼)
- **Entity에서 매핑**: `@Column({ name: 'snake_case' }) camelCase: type;`

### Q: 인터페이스에 I 접두사를 붙여야 하나요?

**A**: 아니요. `IUserService` 대신 `UserService` 또는 `UserServiceInterface`를 사용하세요.

### Q: API 응답에서 날짜 형식은?

**A**: ISO 8601 형식 (`2024-01-15T09:30:00.000Z`)

### Q: 에러 메시지는 어떻게 관리하나요?

**A**: 하드코딩 대신 상수 파일에서 관리:
```typescript
// constants/planner.errors.ts
export const PlannerErrors = {
  TASK_NOT_FOUND: '태스크를 찾을 수 없습니다',
  INVALID_DATE_RANGE: '유효하지 않은 날짜 범위입니다',
};
```

### Q: 기존 MemberEntity를 사용해야 하나요?

**A**: 네. 통합 시 메인 백엔드의 `MemberEntity`와 관계를 맺어야 합니다:
```typescript
@ManyToOne(() => MemberEntity)
@JoinColumn({ name: 'member_id' })
member: MemberEntity;
```

---

## 문의

통합 관련 문의사항은 메인 백엔드 담당자에게 연락하세요.

**관련 문서**:
- [GB-Back-Nest CONTRIBUTING.md](../CONTRIBUTING.md)
- [GB-Back-Nest CLAUDE.md](../CLAUDE.md)
