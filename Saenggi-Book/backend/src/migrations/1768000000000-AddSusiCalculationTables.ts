// @ts-nocheck

export class AddSusiCalculationTables1768000000000 implements MigrationInterface {
  name = 'AddSusiCalculationTables1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========== 테이블 1: susi_calculation_formula (환산 공식) ==========
    await queryRunner.createTable(
      new Table({
        name: 'susi_calculation_formula',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '고유 ID',
          },
          {
            name: 'year',
            type: 'int',
            default: 2026,
            comment: '적용 연도',
          },
          {
            name: 'university_name',
            type: 'varchar',
            length: '100',
            comment: '대학명',
          },
          {
            name: 'university_code',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '대학 코드',
          },
          {
            name: 'reflection_semesters',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '반영 학기 (예: 1-1,1-2,2-1,2-2,3-1)',
          },
          // 학년별 반영비율
          {
            name: 'grade_1_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '1학년 반영비율 (%)',
          },
          {
            name: 'grade_2_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '2학년 반영비율 (%)',
          },
          {
            name: 'grade_3_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '3학년 반영비율 (%)',
          },
          // 교과별 반영비율
          {
            name: 'korean_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '국어 반영비율 (%)',
          },
          {
            name: 'english_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '영어 반영비율 (%)',
          },
          {
            name: 'math_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '수학 반영비율 (%)',
          },
          {
            name: 'social_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '사회 반영비율 (%)',
          },
          {
            name: 'science_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '과학 반영비율 (%)',
          },
          {
            name: 'etc_ratio',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '기타 교과 반영비율 (%)',
          },
          // 반영 과목 수
          {
            name: 'reflection_subject_count',
            type: 'int',
            isNullable: true,
            comment: '반영 과목 수 (전체)',
          },
          {
            name: 'reflection_subject_detail',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '반영 교과 상세 설명',
          },
          // 등급별 환산점수 테이블 (JSONB)
          {
            name: 'grade_conversion_table',
            type: 'jsonb',
            isNullable: true,
            comment: '등급별 환산점수 테이블 { "1": 100, "2": 98, ... "9": 0 }',
          },
          // 진로선택과목 환산 방식
          {
            name: 'career_subject_conversion',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '진로선택과목 환산 방식',
          },
          {
            name: 'career_grade_conversion_table',
            type: 'jsonb',
            isNullable: true,
            comment: '진로선택과목 성취도별 환산점수 { "A": 100, "B": 95, "C": 90 }',
          },
          // 출결 반영
          {
            name: 'attendance_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '출결 반영 점수',
          },
          {
            name: 'attendance_deduction_rule',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '출결 감점 기준',
          },
          // 봉사활동 반영
          {
            name: 'volunteer_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: '봉사활동 반영 점수',
          },
          {
            name: 'volunteer_rule',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '봉사활동 기준',
          },
          // 환산점수 총점
          {
            name: 'max_score',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 1000,
            comment: '환산점수 만점',
          },
          // 메타 정보
          {
            name: 'remarks',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '특이사항 및 비고',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: '활성화 여부',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '생성일시',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '수정일시',
          },
        ],
      }),
      true,
    );

    // 인덱스: university_name
    await queryRunner.createIndex(
      'susi_calculation_formula',
      new TableIndex({
        name: 'IDX_susi_calculation_formula_university_name',
        columnNames: ['university_name'],
      }),
    );

    // 인덱스: year
    await queryRunner.createIndex(
      'susi_calculation_formula',
      new TableIndex({
        name: 'IDX_susi_calculation_formula_year',
        columnNames: ['year'],
      }),
    );

    // 인덱스: university_name + year (유니크)
    await queryRunner.createIndex(
      'susi_calculation_formula',
      new TableIndex({
        name: 'IDX_susi_calculation_formula_univ_year_unique',
        columnNames: ['university_name', 'year'],
        isUnique: true,
      }),
    );

    // ========== 테이블 2: susi_user_calculated_scores (대학별 환산점수) ==========
    await queryRunner.createTable(
      new Table({
        name: 'susi_user_calculated_scores',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '고유 ID',
          },
          {
            name: 'member_id',
            type: 'int',
            comment: '회원 ID',
          },
          {
            name: 'university_name',
            type: 'varchar',
            length: '100',
            comment: '대학명',
          },
          {
            name: 'year',
            type: 'int',
            isNullable: true,
            comment: '적용 연도',
          },
          // 환산점수
          {
            name: 'converted_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '최종 환산점수',
          },
          {
            name: 'max_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            isNullable: true,
            comment: '환산점수 만점',
          },
          {
            name: 'score_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: '환산점수 비율 (%)',
          },
          // 평균 등급
          {
            name: 'average_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '전체 평균 등급',
          },
          {
            name: 'grade_1_average',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '1학년 평균 등급',
          },
          {
            name: 'grade_2_average',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '2학년 평균 등급',
          },
          {
            name: 'grade_3_average',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '3학년 평균 등급',
          },
          // 교과별 점수
          {
            name: 'korean_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '국어 환산점수',
          },
          {
            name: 'korean_average_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '국어 평균 등급',
          },
          {
            name: 'english_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '영어 환산점수',
          },
          {
            name: 'english_average_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '영어 평균 등급',
          },
          {
            name: 'math_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '수학 환산점수',
          },
          {
            name: 'math_average_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '수학 평균 등급',
          },
          {
            name: 'social_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '사회 환산점수',
          },
          {
            name: 'social_average_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '사회 평균 등급',
          },
          {
            name: 'science_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '과학 환산점수',
          },
          {
            name: 'science_average_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '과학 평균 등급',
          },
          {
            name: 'etc_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '기타 교과 환산점수',
          },
          // 반영 과목 정보
          {
            name: 'reflected_subject_count',
            type: 'int',
            default: 0,
            comment: '반영된 총 과목 수',
          },
          {
            name: 'reflected_subjects',
            type: 'jsonb',
            isNullable: true,
            comment: '반영된 과목 상세 정보',
          },
          // 출결/봉사 점수
          {
            name: 'attendance_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '출결 점수',
          },
          {
            name: 'volunteer_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '봉사 점수',
          },
          // 계산 성공 여부
          {
            name: 'success',
            type: 'boolean',
            default: true,
            comment: '계산 성공 여부',
          },
          {
            name: 'failure_reason',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '실패 사유',
          },
          // 메타 정보
          {
            name: 'calculated_at',
            type: 'timestamp',
            isNullable: true,
            comment: '계산 일시',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '생성일시',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '수정일시',
          },
        ],
      }),
      true,
    );

    // 인덱스: member_id + university_name (유니크)
    await queryRunner.createIndex(
      'susi_user_calculated_scores',
      new TableIndex({
        name: 'IDX_susi_user_calculated_scores_member_univ_unique',
        columnNames: ['member_id', 'university_name'],
        isUnique: true,
      }),
    );

    // 인덱스: member_id
    await queryRunner.createIndex(
      'susi_user_calculated_scores',
      new TableIndex({
        name: 'IDX_susi_user_calculated_scores_member',
        columnNames: ['member_id'],
      }),
    );

    // 인덱스: university_name
    await queryRunner.createIndex(
      'susi_user_calculated_scores',
      new TableIndex({
        name: 'IDX_susi_user_calculated_scores_university',
        columnNames: ['university_name'],
      }),
    );

    // ========== 테이블 3: susi_user_recruitment_scores (모집단위별 환산점수) ==========
    await queryRunner.createTable(
      new Table({
        name: 'susi_user_recruitment_scores',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '고유 ID',
          },
          {
            name: 'member_id',
            type: 'int',
            comment: '회원 ID',
          },
          {
            name: 'susi_subject_id',
            type: 'int',
            comment: '수시 모집단위 ID (susi_subject_tb.id)',
          },
          // 모집단위 정보 (캐싱)
          {
            name: 'university_name',
            type: 'varchar',
            length: '100',
            comment: '대학명',
          },
          {
            name: 'recruitment_name',
            type: 'varchar',
            length: '200',
            comment: '모집단위명',
          },
          {
            name: 'type_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '전형명',
          },
          {
            name: 'basic_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '전형 기본 유형',
          },
          {
            name: 'detailed_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '전형 세부 유형',
          },
          {
            name: 'department',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '계열 (인문/자연)',
          },
          {
            name: 'year',
            type: 'int',
            isNullable: true,
            comment: '적용 연도',
          },
          // 환산점수
          {
            name: 'converted_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '환산점수',
          },
          {
            name: 'max_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            isNullable: true,
            comment: '환산점수 만점',
          },
          {
            name: 'score_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: '환산점수 비율 (%)',
          },
          // 평균 등급
          {
            name: 'average_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '반영 평균 등급',
          },
          // 위험도 및 등급컷
          {
            name: 'risk_score',
            type: 'int',
            isNullable: true,
            comment: '위험도 점수 (-15 ~ 10)',
          },
          {
            name: 'grade_cut_50',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '50% 등급컷',
          },
          {
            name: 'grade_cut_70',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '70% 등급컷',
          },
          {
            name: 'grade_difference',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '등급 차이',
          },
          // 작년 입시결과 (캐싱)
          {
            name: 'last_year_avg_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '작년 합격자 평균 등급',
          },
          {
            name: 'last_year_min_grade',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: '작년 합격자 최저 등급',
          },
          {
            name: 'last_year_competition_rate',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '작년 경쟁률',
          },
          // 계산 성공 여부
          {
            name: 'success',
            type: 'boolean',
            default: true,
            comment: '계산 성공 여부',
          },
          {
            name: 'failure_reason',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '실패 사유',
          },
          // 메타 정보
          {
            name: 'calculated_at',
            type: 'timestamp',
            isNullable: true,
            comment: '계산 일시',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '생성일시',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '수정일시',
          },
        ],
      }),
      true,
    );

    // 인덱스: member_id + susi_subject_id (유니크)
    await queryRunner.createIndex(
      'susi_user_recruitment_scores',
      new TableIndex({
        name: 'IDX_susi_user_recruitment_scores_member_susi_unique',
        columnNames: ['member_id', 'susi_subject_id'],
        isUnique: true,
      }),
    );

    // 인덱스: member_id
    await queryRunner.createIndex(
      'susi_user_recruitment_scores',
      new TableIndex({
        name: 'IDX_susi_user_recruitment_scores_member',
        columnNames: ['member_id'],
      }),
    );

    // 인덱스: member_id + university_name
    await queryRunner.createIndex(
      'susi_user_recruitment_scores',
      new TableIndex({
        name: 'IDX_susi_user_recruitment_scores_member_univ',
        columnNames: ['member_id', 'university_name'],
      }),
    );

    // 인덱스: susi_subject_id
    await queryRunner.createIndex(
      'susi_user_recruitment_scores',
      new TableIndex({
        name: 'IDX_susi_user_recruitment_scores_susi_subject',
        columnNames: ['susi_subject_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 테이블 삭제 (역순)
    await queryRunner.dropTable('susi_user_recruitment_scores');
    await queryRunner.dropTable('susi_user_calculated_scores');
    await queryRunner.dropTable('susi_calculation_formula');
  }
}
