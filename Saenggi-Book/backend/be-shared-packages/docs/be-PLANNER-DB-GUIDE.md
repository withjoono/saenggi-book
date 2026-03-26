# 플래너 프로젝트 DB 가이드

> 플래너 분리 개발 시 참조하는 데이터베이스 가이드

---

## 빠른 시작

### DB 연결 정보 (개발)

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tsuser
DB_PASSWORD=tsuser1234
DB_DATABASE=geobukschool_dev
DB_SYNCHRONIZE=false
```

### TypeORM 설정

```typescript
// ormconfig.ts 또는 data-source.ts
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_DATABASE || 'geobukschool_dev',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,  // ⚠️ 절대 true 금지!
  logging: true,
});
```

---

## 핵심 테이블 참조

### member_tb (회원) - 읽기 전용

플래너의 모든 데이터는 `member_tb`와 연결됩니다.

```sql
-- 주요 컬럼
id              BIGINT PRIMARY KEY     -- 회원 고유 ID
email           VARCHAR(500)           -- 이메일
phone           VARCHAR(255)           -- 전화번호
nickname        VARCHAR(255)           -- 닉네임
member_type     VARCHAR(20)            -- 'student', 'teacher', 'parent'
```

**⚠️ 주의**: `member_tb`는 **읽기 전용**입니다. 수정하지 마세요.

### 기존 플래너 테이블

| 테이블 | 설명 | 용도 |
|-------|------|------|
| `planner_item_tb` | 일정 아이템 | 캘린더 일정 |
| `planner_plan_tb` | 장기계획 | 과목별 학습 목표 |
| `planner_routine_tb` | 루틴 | 반복 일정 |
| `planner_class_tb` | 클래스 | 멘토 운영 클래스 |
| `planner_management_tb` | 학생관리 | 멘토-학생 연결 |
| `planner_notice_tb` | 공지사항 | 클래스 공지 |

---

## 플래너 테이블 스키마

### planner_item_tb (일정)

```sql
CREATE TABLE planner_item_tb (
    id              BIGSERIAL PRIMARY KEY,
    member_id       BIGINT NOT NULL,      -- FK: member_tb.id

    -- 분류
    primary_type    VARCHAR(10) NOT NULL, -- '학습' | '수업'
    subject         VARCHAR(50),          -- 과목명
    teacher         VARCHAR(100),         -- 선생님

    -- 일정
    title           VARCHAR(200) NOT NULL,
    start_date      TIMESTAMP NOT NULL,
    end_date        TIMESTAMP NOT NULL,
    r_rule          VARCHAR(500),         -- iCalendar 반복규칙
    ex_date         TEXT,                 -- 예외날짜 (쉼표구분)

    -- 상태
    late            BOOLEAN DEFAULT FALSE,
    absent          BOOLEAN DEFAULT FALSE,
    progress        INT DEFAULT 0,        -- 0~100
    task_status     VARCHAR(20),

    -- 학습상세
    study_type      VARCHAR(50),
    study_content   TEXT,
    description     TEXT,

    -- 범위
    start_page      INT,
    end_page        INT,
    start_session   INT,
    end_session     INT,

    -- 평가
    score           DECIMAL(5,2),
    rank            INT,
    achievement     INT,

    -- 멘토 평가
    mentor_rank     INT,
    mentor_desc     TEXT,
    mentor_test     VARCHAR(200),
    test            VARCHAR(200),
    plan_date       DATE,

    -- 메타
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (member_id) REFERENCES member_tb(id) ON DELETE CASCADE
);
```

### planner_plan_tb (장기계획)

```sql
CREATE TABLE planner_plan_tb (
    id              BIGSERIAL PRIMARY KEY,
    member_id       BIGINT NOT NULL,

    title           VARCHAR(200) NOT NULL,
    subject         VARCHAR(50),
    step            VARCHAR(50),          -- 단계

    -- 기간
    start_date      DATE,
    end_date        DATE,
    start_time      TIME,
    end_time        TIME,

    -- 교재/강의
    type            INT DEFAULT 0,        -- 0: 강의, 1: 교재
    material        VARCHAR(200),         -- 교재명
    person          VARCHAR(100),         -- 강사명

    -- 진행률
    total           INT,                  -- 전체 분량
    done            INT DEFAULT 0,        -- 완료 분량

    -- 상태
    is_item         BOOLEAN DEFAULT FALSE,
    is_item_done    BOOLEAN DEFAULT FALSE,

    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (member_id) REFERENCES member_tb(id) ON DELETE CASCADE
);
```

### planner_class_tb (클래스)

```sql
CREATE TABLE planner_class_tb (
    id              BIGSERIAL PRIMARY KEY,
    planner_id      BIGINT NOT NULL,      -- FK: member_tb.id (멘토)

    class_code      VARCHAR(10) NOT NULL,
    class_name      VARCHAR(100),
    start_date      VARCHAR(8) NOT NULL,  -- YYYYMMDD
    end_date        VARCHAR(8),
    use_yn          CHAR(1) DEFAULT 'Y',

    FOREIGN KEY (planner_id) REFERENCES member_tb(id) ON DELETE CASCADE
);
```

### planner_management_tb (학생관리)

```sql
CREATE TABLE planner_management_tb (
    id              BIGSERIAL PRIMARY KEY,
    class_id        BIGINT NOT NULL,      -- FK: planner_class_tb.id
    student_id      BIGINT NOT NULL,      -- FK: member_tb.id

    FOREIGN KEY (class_id) REFERENCES planner_class_tb(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES member_tb(id) ON DELETE CASCADE
);
```

---

## 새 테이블 추가 방법

### 1. 엔티티 작성

```typescript
// entities/planner-new-table.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('planner_new_table_tb')
@Index(['member_id'])
export class PlannerNewTableEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  // 필수: member_id 외래키
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  // 비즈니스 컬럼 (예시)
  @Column({ name: 'feature_name', type: 'varchar', length: 200 })
  featureName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 2. SQL 마이그레이션 작성

```sql
-- migrations/add_planner_new_table.sql
CREATE TABLE planner_new_table_tb (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    feature_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_planner_new_table_member ON planner_new_table_tb(member_id);
```

### 3. 메인 백엔드에 전달

통합 시 위 SQL을 메인 백엔드 담당자에게 전달하세요.

---

## 명명 규칙 요약

| 대상 | 규칙 | 예시 |
|-----|------|------|
| 테이블명 | `planner_{기능}_tb` | `planner_task_tb` |
| 컬럼명 | snake_case | `member_id`, `start_date` |
| TS 프로퍼티 | camelCase | `memberId`, `startDate` |
| 외래키 | `{테이블}_id` | `member_id`, `class_id` |
| 인덱스 | `idx_{테이블}_{컬럼}` | `idx_planner_task_member` |
| 불리언 | `is_{상태}` | `is_active`, `is_deleted` |
| 날짜 | `{동작}_at` / `{명사}_date` | `created_at`, `start_date` |

---

## 자주 사용하는 쿼리

### 특정 회원의 일정 조회

```sql
SELECT * FROM planner_item_tb
WHERE member_id = :memberId
  AND start_date >= :startDate
  AND end_date <= :endDate
ORDER BY start_date;
```

### 클래스 학생 목록

```sql
SELECT m.id, m.nickname, m.email
FROM member_tb m
JOIN planner_management_tb pm ON pm.student_id = m.id
WHERE pm.class_id = :classId;
```

### 멘토의 클래스 목록

```sql
SELECT * FROM planner_class_tb
WHERE planner_id = :mentorId
  AND use_yn = 'Y';
```

---

## 체크리스트

### 새 테이블 추가 시

- [ ] 테이블명: `planner_xxx_tb` 형식
- [ ] `member_id` 외래키 포함 (필요시)
- [ ] `created_at`, `updated_at` 컬럼 포함
- [ ] `ON DELETE CASCADE` 설정
- [ ] 인덱스 생성 (`member_id` 등)
- [ ] SQL 마이그레이션 파일 작성

### 통합 전

- [ ] 엔티티 파일 준비
- [ ] SQL 마이그레이션 준비
- [ ] 기존 테이블 수정 없음 확인
- [ ] 테스트 데이터 정리

---

## 문의

DB 관련 문의는 메인 백엔드 담당자에게 연락하세요.
