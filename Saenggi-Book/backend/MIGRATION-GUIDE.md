# Database Migration Guide

## 현재 상태 분석 (Current Status Analysis)

### 프로젝트 정보
- **ORM**: TypeORM
- **주 데이터베이스**: PostgreSQL 14+
- **개발 DB**: PostgreSQL (Docker) 또는 better-sqlite3
- **엔티티 수**: 45개 등록됨
- **마이그레이션 디렉토리**: 없음 (아직 생성되지 않음)
- **현재 동기화 방식**: `DB_SYNCHRONIZE=true` (환경 변수 기반)

### PostgreSQL 호환성 검토 결과

#### ✅ 호환 가능한 항목
1. **timestamp 타입**: 45개 엔티티 모두 `type: 'timestamp'` 사용 - PostgreSQL 완전 호환
2. **JSON 타입**: 사용 안 함 (json/jsonb 컬럼 없음)
3. **Array 타입**: 사용 안 함 (array 컬럼 없음)
4. **기본 컬럼 타입**: varchar, text, bigint, boolean, int 등 표준 SQL 타입 사용

#### ⚠️ MySQL 호환성 이슈 (PostgreSQL에서 작동하지 않음)

**Issue 1: `onUpdate` 트리거 구문**
- **영향받는 파일**: 3개
- **문제**: MySQL 전용 `onUpdate: 'CURRENT_TIMESTAMP'` 구문 사용
- **PostgreSQL 영향**: `onUpdate` 옵션이 무시됨 (업데이트 시 자동 갱신 안됨)

```typescript
// 문제가 있는 코드 예시
@Column({
  type: 'timestamp',
  default: () => 'CURRENT_TIMESTAMP',
  onUpdate: 'CURRENT_TIMESTAMP',  // ⚠️ MySQL 전용, PostgreSQL에서 작동 안함
  comment: '수정일',
})
updated_at: Date;
```

**영향받는 엔티티**:
1. `src/database/entities/boards/comment.entity.ts:29`
2. `src/database/entities/member/member-regular-combination.entity.ts:45`
3. `src/database/entities/member/member-recruitment-unit-combination.entity.ts:45`

**Issue 2: 함수 구문 불일치**
- **영향받는 파일**: 1개 (`post.entity.ts`)
- **문제**: `default: 'now()'`와 `onUpdate: 'now()'` 혼용

```typescript
// post.entity.ts:33-34
@Column({
  type: 'timestamp',
  default: 'now()',        // 문자열 'now()' 사용
  onUpdate: 'now()',       // ⚠️ PostgreSQL에서 작동 안함
  comment: '게시글 수정일',
})
updated_at: Date;
```

---

## 마이그레이션 전략 (Migration Strategy)

### 1. DB_SYNCHRONIZE 사용 중단 계획

**현재 문제점**:
- `DB_SYNCHRONIZE=true`는 개발 초기에는 편리하지만 프로덕션에서는 위험
- 스키마 변경이 자동으로 적용되어 데이터 손실 위험
- 변경 이력 추적 불가능
- 롤백 불가능

**마이그레이션 단계별 전환 계획**:

#### Phase 1: 준비 단계 (현재 단계)
```bash
# 1. migrations 디렉토리 생성
mkdir -p src/migrations

# 2. TypeORM CLI 설정 파일 생성
# ormconfig.ts 또는 데이터 소스 파일 생성
```

#### Phase 2: 초기 마이그레이션 생성
```bash
# 3. 현재 스키마 기준 초기 마이그레이션 생성
yarn typeorm migration:generate -n InitialSchema

# 4. 생성된 마이그레이션 파일 검토
# src/migrations/[timestamp]-InitialSchema.ts
```

#### Phase 3: 호환성 수정 마이그레이션
```bash
# 5. onUpdate 이슈 해결을 위한 트리거 생성 마이그레이션
yarn typeorm migration:create -n AddUpdateTimestampTriggers
```

#### Phase 4: 테스트 환경 적용
```bash
# 6. 개발 환경에서 마이그레이션 테스트
DB_SYNCHRONIZE=false yarn typeorm migration:run

# 7. 데이터 무결성 검증
# - 모든 테이블 존재 확인
# - 컬럼 타입 확인
# - 제약조건 확인
```

#### Phase 5: 프로덕션 적용
```bash
# 8. 프로덕션 환경 변수 설정
DB_SYNCHRONIZE=false  # 절대 true로 설정 금지

# 9. 프로덕션 마이그레이션 실행
yarn typeorm migration:run

# 10. 롤백 준비 (문제 발생 시)
yarn typeorm migration:revert
```

---

## 수정 가이드 (Fix Guide)

### 1. onUpdate 이슈 해결 방법

**방법 A: TypeORM Decorator 사용 (권장)**
```typescript
import { UpdateDateColumn } from 'typeorm';

// ✅ 올바른 방법 - TypeORM이 자동으로 처리
@UpdateDateColumn({
  type: 'timestamp',
  comment: '수정일',
})
updated_at: Date;
```

**방법 B: PostgreSQL 트리거 생성 (마이그레이션)**
```typescript
// src/migrations/[timestamp]-AddUpdateTimestampTriggers.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdateTimestampTriggers1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 트리거 함수 생성
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_timestamp_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // comment_tb 테이블에 트리거 적용
    await queryRunner.query(`
      CREATE TRIGGER update_comment_timestamp
      BEFORE UPDATE ON comment_tb
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp_trigger();
    `);

    // member_regular_combination 테이블에 트리거 적용
    await queryRunner.query(`
      CREATE TRIGGER update_member_regular_combination_timestamp
      BEFORE UPDATE ON member_regular_combination
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp_trigger();
    `);

    // member_recruitment_unit_combination 테이블에 트리거 적용
    await queryRunner.query(`
      CREATE TRIGGER update_member_recruitment_unit_combination_timestamp
      BEFORE UPDATE ON member_recruitment_unit_combination
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp_trigger();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: 트리거 제거
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_comment_timestamp ON comment_tb;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_member_regular_combination_timestamp ON member_regular_combination;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_member_recruitment_unit_combination_timestamp ON member_recruitment_unit_combination;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_timestamp_trigger();`);
  }
}
```

### 2. TypeORM 데이터 소스 설정

**ormconfig.ts 생성** (TypeORM CLI용):
```typescript
// ormconfig.ts (프로젝트 루트)
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 환경 변수 로드
config({ path: '.env.development' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/database/entities/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,  // CLI에서는 항상 false
  logging: true,
});
```

---

## 마이그레이션 명령어 (Migration Commands)

### 기본 명령어
```bash
# 1. 엔티티 변경사항으로부터 마이그레이션 자동 생성
yarn typeorm migration:generate -n DescriptiveMigrationName

# 2. 빈 마이그레이션 파일 생성 (수동 작성용)
yarn typeorm migration:create -n CustomMigrationName

# 3. 대기 중인 마이그레이션 실행
yarn typeorm migration:run

# 4. 마지막 마이그레이션 롤백
yarn typeorm migration:revert

# 5. 마이그레이션 상태 확인
yarn typeorm migration:show
```

### 실행 예시
```bash
# 초기 스키마 생성
yarn typeorm migration:generate -n InitialSchema

# 생성된 파일 확인
ls -l src/migrations/
# 출력: 1732512345678-InitialSchema.ts

# 마이그레이션 실행
yarn typeorm migration:run
# 출력: Migration InitialSchema1732512345678 has been executed successfully.

# 롤백 (문제 발생 시)
yarn typeorm migration:revert
# 출력: Migration InitialSchema1732512345678 has been reverted successfully.
```

---

## DB_SYNCHRONIZE 사용 가이드라인

### ✅ 사용 가능한 경우 (개발 환경만)
- 로컬 개발 환경 (`NODE_ENV=development`)
- SQLite 테스트 데이터베이스
- 프로토타입 단계
- **조건**: 데이터 손실이 허용되는 환경

### ❌ 절대 사용 금지
- 프로덕션 환경 (`NODE_ENV=production`)
- 스테이징 환경 (`NODE_ENV=staging`)
- 실제 사용자 데이터가 있는 모든 환경
- CI/CD 파이프라인

### 환경별 설정 권장사항

**.env.development**:
```bash
# 개발 초기에는 편의상 true 가능
DB_SYNCHRONIZE=true

# 하지만 스키마 안정화 후에는 false 권장
DB_SYNCHRONIZE=false
```

**.env.production**:
```bash
# 프로덕션에서는 반드시 false
DB_SYNCHRONIZE=false
```

**.env.staging**:
```bash
# 스테이징도 프로덕션과 동일하게 false
DB_SYNCHRONIZE=false
```

### 안전장치: TypeORM Config에서 강제 체크
```typescript
// src/database/typeorm-config.service.ts
createTypeOrmOptions(): TypeOrmModuleOptions {
  const dbConfig = this.configService.getOrThrow('database', { infer: true });
  const nodeEnv = this.configService.get('app.nodeEnv', { infer: true });

  // 프로덕션 환경에서 synchronize=true 방지
  if (nodeEnv === 'production' && dbConfig.synchronize === true) {
    throw new Error(
      '🚨 CRITICAL: DB_SYNCHRONIZE=true is strictly prohibited in production! ' +
      'Use migrations instead: yarn typeorm migration:run'
    );
  }

  return {
    // ... 기타 설정
    synchronize: dbConfig.synchronize,
  };
}
```

---

## 데이터 무결성 검증 체크리스트

### 마이그레이션 실행 후 검증 항목

#### 1. 테이블 존재 확인
```sql
-- 모든 테이블 목록 조회
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 예상 테이블 수: 45개
```

#### 2. 컬럼 타입 검증
```sql
-- timestamp 컬럼 확인
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE data_type = 'timestamp without time zone'
ORDER BY table_name, ordinal_position;
```

#### 3. 제약조건 확인
```sql
-- Primary Key 확인
SELECT conname, conrelid::regclass, contype, conkey
FROM pg_constraint
WHERE contype = 'p'
ORDER BY conrelid::regclass::text;

-- Foreign Key 확인
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conrelid::regclass::text;
```

#### 4. 인덱스 확인
```sql
-- 모든 인덱스 조회
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

#### 5. 트리거 확인 (onUpdate 수정 후)
```sql
-- 트리거 목록
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

---

## 롤백 전략 (Rollback Strategy)

### 1. 마이그레이션 롤백
```bash
# 마지막 마이그레이션 롤백
yarn typeorm migration:revert

# 여러 마이그레이션 롤백 (순차적으로 실행)
yarn typeorm migration:revert
yarn typeorm migration:revert
yarn typeorm migration:revert
```

### 2. 데이터베이스 백업/복원
```bash
# 프로덕션 마이그레이션 전 필수 백업
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# 문제 발생 시 복원
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup_before_migration_20241125_143000.sql
```

### 3. 단계별 롤백 계획
1. **Step 1**: 애플리케이션 중지
2. **Step 2**: 데이터베이스 백업 확인
3. **Step 3**: 마이그레이션 롤백 실행
4. **Step 4**: 이전 버전 코드 배포
5. **Step 5**: 애플리케이션 재시작
6. **Step 6**: 동작 확인

---

## 다음 단계 (Next Steps)

### Phase 2.3 완료를 위한 작업 순서

1. **✅ 완료**: 엔티티 PostgreSQL 호환성 검토
2. **✅ 완료**: 문제점 식별 (onUpdate 이슈 3건)
3. **🔄 진행 중**: 마이그레이션 가이드 문서 작성
4. **⏳ 예정**: migrations 디렉토리 생성
5. **⏳ 예정**: ormconfig.ts 생성
6. **⏳ 예정**: 초기 마이그레이션 생성
7. **⏳ 예정**: onUpdate 트리거 마이그레이션 생성
8. **⏳ 예정**: 개발 환경 테스트
9. **⏳ 예정**: 문서 업데이트 (REFACTORING-PLAN.md, REFACTORING-SUMMARY.md)

---

## 참고 자료 (References)

- [TypeORM Migrations 공식 문서](https://typeorm.io/migrations)
- [PostgreSQL Trigger 문서](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [NestJS TypeORM 통합](https://docs.nestjs.com/techniques/database)
- [거북스쿨 개발 환경 설정](./DEVELOPMENT-SETUP.md)
