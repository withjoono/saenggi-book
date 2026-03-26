# 데이터베이스 스키마 문서

> **버전**: 1.0.0
> **최종 수정**: 2024-12
> **데이터베이스**: PostgreSQL 14+

---

## 목차

1. [개요](#개요)
2. [ERD 다이어그램](#erd-다이어그램)
3. [도메인별 테이블](#도메인별-테이블)
4. [핵심 엔티티 상세](#핵심-엔티티-상세)
5. [분리 개발 시 DB 가이드](#분리-개발-시-db-가이드)
6. [명명 규칙](#명명-규칙)

---

## 개요

### 데이터베이스 연결 정보

| 환경 | 호스트 | 포트 | 데이터베이스 |
|-----|-------|------|-------------|
| 개발 | localhost | 5432 | geobukschool_dev |
| 프로덕션 | (Cloud SQL) | 5432 | geobukschool |

### 테이블 수 요약

| 도메인 | 테이블 수 | 설명 |
|-------|----------|------|
| Member | 6 | 회원, 관심목록, 점수 |
| Core | 15 | 대학, 입학전형, 모집단위 |
| SchoolRecord | 5 | 학생부 (출결, 성적, 봉사) |
| MockExam | 5 | 모의고사 점수 |
| Susi | 3 | 수시 전형 |
| Pay | 7 | 결제, 상품, 쿠폰 |
| Planner | 6 | 플래너 일정 |
| Board | 3 | 게시판 |
| Officer | 6 | 입학사정관 평가 |
| Mentoring | 4 | 멘토링 |
| MyClass | 4 | 출석, 상담 |
| Notification | 3 | 알림 |
| **총계** | **67+** | |

---

## ERD 다이어그램

### 핵심 관계도 (텍스트 기반)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              MEMBER (중심)                               │
│                            member_tb (id)                               │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────┬───────────────────┬──────────────────┐
         │                  │                   │                  │
         ▼                  ▼                   ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌──────────────┐
│  SCHOOL RECORD  │ │   MOCK EXAM   │ │     PLANNER     │ │     PAY      │
│  (학생부)        │ │   (모의고사)   │ │    (플래너)      │ │   (결제)     │
├─────────────────┤ ├───────────────┤ ├─────────────────┤ ├──────────────┤
│ attendance_tb   │ │ raw_score_tb  │ │ planner_item_tb │ │ contract_tb  │
│ subject_tb      │ │ standard_tb   │ │ plan_tb         │ │ order_tb     │
│ volunteer_tb    │ │ schedule_tb   │ │ routine_tb      │ │ coupon_tb    │
│ select_subj_tb  │ └───────────────┘ │ class_tb        │ └──────────────┘
│ sport_art_tb    │                   │ management_tb   │
└─────────────────┘                   │ notice_tb       │
                                      └─────────────────┘
         │
         ├──────────────────┬───────────────────┐
         │                  │                   │
         ▼                  ▼                   ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
│    INTERESTS    │ │     BOARD     │ │    OFFICER      │
│   (관심목록)     │ │   (게시판)    │ │ (입학사정관)     │
├─────────────────┤ ├───────────────┤ ├─────────────────┤
│ interests_tb    │ │ board_tb      │ │ evaluation_tb   │
│ regular_int_tb  │ │ post_tb       │ │ ticket_tb       │
│ combination_tb  │ │ comment_tb    │ └─────────────────┘
└─────────────────┘ └───────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                            CORE (대학/전형)                              │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UNIVERSITY    │ ──▶ │    ADMISSION    │ ──▶ │ ADMISSION_METHOD│
│   (대학)        │     │    (학부)        │     │   (전형)        │
│ ts_universities │     │ ts_admissions   │     │ ts_adm_methods  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │ RECRUITMENT_UNIT│
                                                │   (모집단위)     │
                                                │ ts_recruit_units│
                                                └─────────────────┘
                                                        │
         ┌────────────────────┬─────────────────────────┼──────────────────┐
         ▼                    ▼                         ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐
│     SCORE       │ │   INTERVIEW     │ │   MIN_GRADE     │ │  PREV_RESULT │
│ (점수)          │ │ (면접정보)       │ │ (최저등급)       │ │ (입결)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────┘
```

### 필드 분류 (계열)

```
GENERAL_FIELD (대계열)
    └── MAJOR_FIELD (중계열)
            └── MID_FIELD (소계열)
                    └── MINOR_FIELD (세부계열)
```

---

## 도메인별 테이블

### 1. Member (회원)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `member_tb` | 회원 정보 | id, email, phone, role_type, member_type |
| `member_interests_tb` | 수시 관심목록 | member_id, recruitment_unit_id, type |
| `member_regular_interests_tb` | 정시 관심목록 | member_id, regular_admission_id, group_type |
| `member_recruitment_unit_combination_tb` | 원서 조합 | member_id, unit_ids |
| `member_jungsi_input_score_tb` | 정시 입력 점수 | member_id, korean, math, english... |
| `member_calculated_score_tb` | 정시 계산 점수 | member_id, university_id, total_score... |

### 2. Core (대학/전형)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `ts_universities` | 대학 | id, name, code, region |
| `ts_admissions` | 학부 | id, university_id, name |
| `ts_admission_methods` | 전형방법 | id, admission_id, name, type |
| `ts_recruitment_units` | 모집단위 | id, method_id, name, quota |
| `ts_recruitment_unit_scores` | 모집단위 점수 | unit_id, score_type, value |
| `ts_recruitment_unit_interviews` | 면접정보 | unit_id, date, type |
| `ts_recruitment_unit_min_grades` | 최저등급 | unit_id, subject, grade |
| `ts_recruitment_unit_prev_results` | 입결 | unit_id, year, cut_score |
| `ts_recruitment_unit_pass_fail` | 합불사례 | unit_id, grade, result |
| `ts_regular_admissions` | 정시전형 | university_id, name, group |
| `ts_regular_admission_prev_results` | 정시입결 | admission_id, year, percentile |
| `ts_general_fields` | 대계열 | id, name |
| `ts_major_fields` | 중계열 | id, general_field_id, name |
| `ts_mid_fields` | 소계열 | id, major_field_id, name |
| `ts_minor_fields` | 세부계열 | id, mid_field_id, name |

### 3. SchoolRecord (학생부)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `schoolrecord_attendance_detail_tb` | 출결 | member_id, year, absence_days |
| `schoolrecord_subject_learning_tb` | 교과성적 | member_id, subject, grade |
| `schoolrecord_select_subject_tb` | 선택과목 | member_id, subject_name |
| `schoolrecord_volunteer_tb` | 봉사활동 | member_id, hours |
| `schoolrecord_sport_art_tb` | 체육/예술 | member_id, type, grade |

### 4. MockExam (모의고사)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `mockexam_score_tb` | 모의고사 점수 (구) | member_id, exam_id, score |
| `mockexam_raw_score_tb` | 원점수 | member_id, subject, raw_score |
| `mockexam_standard_score_tb` | 표준점수 | member_id, subject, standard_score |
| `mockexam_raw_to_standard_tb` | 변환표 | raw_score, standard_score |
| `mockexam_schedule_tb` | 시험일정 | year, month, exam_date |

### 5. Susi (수시)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `susi_subject_tb` | 수시 교과 | recruitment_unit_id, data |
| `susi_comprehensive_tb` | 학종 | recruitment_unit_id, data |
| `susi_pass_record_tb` | 합격사례 | unit_id, grade, result |

### 6. Pay (결제)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `pay_service_tb` | 서비스 상품 | id, name, price |
| `pay_product_tb` | 상품 | id, service_id, code |
| `pay_service_product_tb` | 서비스-상품 연결 | service_id, product_id |
| `pay_order_tb` | 주문 | id, member_id, amount |
| `pay_contract_tb` | 계약 | id, member_id, product_code, end_dt |
| `pay_coupon_tb` | 쿠폰 | id, code, discount |
| `pay_cancel_log_tb` | 취소내역 | order_id, reason |

### 7. Planner (플래너)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `planner_item_tb` | 일정 아이템 | member_id, title, start_date, end_date |
| `planner_plan_tb` | 장기계획 | member_id, subject, progress |
| `planner_routine_tb` | 루틴 | member_id, day_of_week, time |
| `planner_class_tb` | 클래스 | planner_id, class_code, class_name |
| `planner_management_tb` | 학생관리 | planner_id, student_id |
| `planner_notice_tb` | 공지사항 | class_id, title, content |

### 8. Board (게시판)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `board_tb` | 게시판 | id, name, type |
| `post_tb` | 게시글 | board_id, member_id, title |
| `comment_tb` | 댓글 | post_id, member_id, content |

### 9. Officer (입학사정관)

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `officer_list_tb` | 사정관 목록 | id, name, university |
| `officer_ticket_tb` | 평가 티켓 | member_id, count |
| `officer_evaluation_tb` | 평가 | member_id, officer_id, status |
| `officer_evaluation_score_tb` | 평가 점수 | evaluation_id, category, score |
| `officer_evaluation_comment_tb` | 평가 코멘트 | evaluation_id, comment |
| `officer_evaluation_survey_tb` | 평가 설문 | evaluation_id, survey_data |

### 10. 기타

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|----------|
| `myclass_attendance_tb` | 출석 | member_id, date, check_in |
| `myclass_consultation_tb` | 상담 | member_id, date, content |
| `myclass_health_record_tb` | 건강기록 | member_id, data |
| `myclass_test_tb` | 테스트 | member_id, score |
| `mentoring_account_link_tb` | 계정연결 | parent_id, student_id |
| `mentoring_admin_class_tb` | 관리반 | teacher_id, name |
| `mentoring_invite_tb` | 초대 | teacher_id, code |
| `mentoring_temp_code_tb` | 임시코드 | code, expires_at |
| `notification_log_tb` | 알림로그 | member_id, type, sent_at |
| `user_notification_settings_tb` | 알림설정 | member_id, enabled |
| `user_notification_type_tb` | 알림유형 | member_id, type_code |

---

## 핵심 엔티티 상세

### member_tb (회원)

```sql
CREATE TABLE member_tb (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(500) NOT NULL,
    password        VARCHAR(500),
    role_type       VARCHAR(500) NOT NULL,        -- 'ROLE_USER', 'ROLE_ADMIN'
    phone           VARCHAR(255) NOT NULL,
    member_type     VARCHAR(20) DEFAULT 'student', -- 'student', 'teacher', 'parent'
    nickname        VARCHAR(255),
    provider_type   VARCHAR(20),                   -- 'google', 'naver', null
    oauth_id        VARCHAR(500),
    ck_sms          BIT DEFAULT B'0',
    ck_sms_agree    BIT DEFAULT B'0',
    account_stop_yn CHAR(1) DEFAULT 'N',
    create_dt       TIMESTAMP,
    update_dt       TIMESTAMP,

    -- 추가 프로필 정보
    introduction    VARCHAR(255),
    profile_image_url VARCHAR(4000),
    address         VARCHAR(500),
    graduate_year   VARCHAR(500),
    major           VARCHAR(500),

    -- 타입 참조 (레거시)
    s_type_id       BIGINT,
    hst_type_id     BIGINT,
    g_type_id       BIGINT,

    UNIQUE (email, phone, oauth_id)
);

CREATE INDEX idx_member_email ON member_tb(email);
CREATE INDEX idx_member_phone ON member_tb(phone);
```

### planner_item_tb (플래너 일정)

```sql
CREATE TABLE planner_item_tb (
    id              BIGSERIAL PRIMARY KEY,
    member_id       BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,

    -- 기본 정보
    primary_type    VARCHAR(10) NOT NULL,         -- '학습', '수업'
    subject         VARCHAR(50),
    teacher         VARCHAR(100),
    title           VARCHAR(200) NOT NULL,

    -- 일정
    start_date      TIMESTAMP NOT NULL,
    end_date        TIMESTAMP NOT NULL,
    r_rule          VARCHAR(500),                 -- iCalendar 반복 규칙
    ex_date         TEXT,                         -- 예외 날짜

    -- 상태
    late            BOOLEAN DEFAULT FALSE,
    absent          BOOLEAN DEFAULT FALSE,
    progress        INT DEFAULT 0,                -- 0-100
    task_status     VARCHAR(20),

    -- 학습 상세
    study_type      VARCHAR(50),
    study_content   TEXT,
    description     TEXT,

    -- 평가
    score           DECIMAL(5,2),
    rank            INT,
    mentor_rank     INT,
    mentor_desc     TEXT,

    -- 페이지/세션
    start_page      INT,
    end_page        INT,
    start_session   INT,
    end_session     INT,

    -- 메타
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_planner_item_member ON planner_item_tb(member_id);
CREATE INDEX idx_planner_item_date ON planner_item_tb(start_date);
CREATE INDEX idx_planner_item_type ON planner_item_tb(primary_type);
```

### pay_contract_tb (결제 계약)

```sql
CREATE TABLE pay_contract_tb (
    id                      BIGSERIAL PRIMARY KEY,
    member_id               BIGINT REFERENCES member_tb(id),
    order_id                INT,
    product_code            VARCHAR(200) NOT NULL,  -- 'FIXEDTERM', 'TICKET', 'PACKAGE'
    contract_start_dt       TIMESTAMP NOT NULL,
    contract_period_end_dt  TIMESTAMP NOT NULL,
    contract_use            INT DEFAULT 1,          -- 1: 사용중, 0: 환불됨
    regular_contract_fl     BOOLEAN DEFAULT FALSE,
    create_dt               TIMESTAMP,
    update_dt               TIMESTAMP
);

CREATE INDEX idx_pay_contract_member ON pay_contract_tb(member_id);
CREATE INDEX idx_pay_contract_product ON pay_contract_tb(product_code);
```

---

## 분리 개발 시 DB 가이드

### 방법 1: 동일 DB 사용 (권장)

분리 개발 프로젝트가 **메인 DB에 직접 연결**하는 방식입니다.

```
┌─────────────────┐         ┌─────────────────┐
│  플래너 개발     │         │  메인 백엔드     │
│  프로젝트       │         │  GB-Back-Nest   │
└────────┬────────┘         └────────┬────────┘
         │                           │
         └─────────┬─────────────────┘
                   ▼
         ┌─────────────────┐
         │   PostgreSQL    │
         │  (동일 DB)      │
         └─────────────────┘
```

**장점**:
- `member_tb` 등 공유 테이블 바로 참조 가능
- 외래키 관계 유지
- 통합 시 마이그레이션 불필요

**설정 방법**:

```typescript
// 분리 프로젝트 ormconfig.ts
export default {
  type: 'postgres',
  host: 'localhost',  // 개발 시
  port: 5432,
  username: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,  // 절대 true 금지!
};
```

**주의사항**:
- `synchronize: false` 필수
- 새 테이블만 생성, 기존 테이블 수정 금지
- 마이그레이션은 메인 프로젝트에서만 실행

### 방법 2: 스키마 분리

동일 DB 내에서 **별도 스키마**를 사용하는 방식입니다.

```sql
-- 플래너 전용 스키마 생성
CREATE SCHEMA planner;

-- 플래너 테이블 생성
CREATE TABLE planner.tasks (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.member_tb(id),
    ...
);
```

### 방법 3: 완전 분리 DB (마이크로서비스)

```
┌─────────────────┐         ┌─────────────────┐
│  플래너 서비스   │         │  메인 백엔드     │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  Planner DB     │         │    Main DB      │
└─────────────────┘         └─────────────────┘
         │                           │
         └───────── API 통신 ────────┘
```

**member_id 동기화 필요**

---

### 새 테이블 생성 가이드

#### 1. 엔티티 파일 생성

```typescript
// src/database/entities/planner/new-feature.entity.ts
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
import { MemberEntity } from '../member/member.entity';

@Entity('planner_new_feature_tb')  // 테이블명: snake_case + _tb
@Index(['member_id'])              // 자주 조회하는 컬럼에 인덱스
export class PlannerNewFeatureEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;  // TS: camelCase

  @Column({ name: 'feature_name', type: 'varchar', length: 200 })
  featureName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 관계 정의
  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
```

#### 2. 마이그레이션 생성

```bash
# 메인 프로젝트에서만 실행
yarn typeorm migration:generate -n AddPlannerNewFeature
```

#### 3. 마이그레이션 파일 검토

```typescript
// migrations/1234567890-AddPlannerNewFeature.ts
export class AddPlannerNewFeature1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE planner_new_feature_tb (
        id BIGSERIAL PRIMARY KEY,
        member_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
        feature_name VARCHAR(200) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_planner_new_feature_member ON planner_new_feature_tb(member_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE planner_new_feature_tb`);
  }
}
```

#### 4. 마이그레이션 실행

```bash
yarn typeorm:run
```

---

## 명명 규칙

### 테이블명

```
{도메인}_{기능}_tb

예시:
- planner_item_tb
- planner_class_tb
- pay_contract_tb
- member_interests_tb
```

### 컬럼명

```
{설명}_{타입}

예시:
- member_id (외래키)
- start_date, end_date (날짜)
- is_active, is_deleted (불리언)
- created_at, updated_at (타임스탬프)
```

### 인덱스명

```
idx_{테이블}_{컬럼}

예시:
- idx_planner_item_member
- idx_pay_contract_product
```

### 외래키명

```
fk_{테이블}_{참조테이블}

예시:
- fk_planner_item_member
```

---

## 부록: SQL 스키마 덤프

전체 스키마를 SQL로 덤프하려면:

```bash
# PostgreSQL
pg_dump -h localhost -U tsuser -d geobukschool_dev --schema-only > schema_dump.sql

# 특정 테이블만
pg_dump -h localhost -U tsuser -d geobukschool_dev -t 'planner_*' --schema-only > planner_schema.sql
```

---

## 문의

DB 스키마 변경이 필요한 경우 메인 백엔드 담당자와 협의하세요.
