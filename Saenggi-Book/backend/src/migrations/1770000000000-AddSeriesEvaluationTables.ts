// @ts-nocheck

export class AddSeriesEvaluationTables1770000000000
  implements MigrationInterface
{
  name = 'AddSeriesEvaluationTables1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 대학 레벨 테이블
    await queryRunner.query(`
      CREATE TABLE "university_level" (
        "id" SERIAL NOT NULL,
        "university_name" VARCHAR(100) NOT NULL,
        "university_code" VARCHAR(10) NOT NULL,
        "level" INTEGER NOT NULL,
        CONSTRAINT "PK_university_level" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_university_level_code" ON "university_level" ("university_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_university_level_name" ON "university_level" ("university_name")`,
    );

    await queryRunner.query(`
      COMMENT ON TABLE "university_level" IS '대학별 레벨 정보 (계열 적합성 진단용)'
    `);

    // 2. 문과 계열 평가 기준 테이블
    await queryRunner.query(`
      CREATE TABLE "series_evaluation_criteria_humanities" (
        "id" SERIAL NOT NULL,
        "level" INTEGER NOT NULL,
        "university_category" VARCHAR(100) NOT NULL,
        "korean" DECIMAL(3,1) NOT NULL,
        "english" DECIMAL(3,1) NOT NULL,
        "math" DECIMAL(3,1) NOT NULL,
        "social" DECIMAL(3,1) NOT NULL,
        "second_foreign_language" DECIMAL(3,1) NOT NULL,
        "overall_grade_range" VARCHAR(20),
        CONSTRAINT "PK_series_evaluation_criteria_humanities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_sec_humanities_level" ON "series_evaluation_criteria_humanities" ("level")`,
    );

    await queryRunner.query(`
      COMMENT ON TABLE "series_evaluation_criteria_humanities" IS '문과 계열 적합성 평가 기준'
    `);

    // 3. 이과 계열 평가 기준 테이블
    await queryRunner.query(`
      CREATE TABLE "series_evaluation_criteria_science" (
        "id" SERIAL NOT NULL,
        "level" INTEGER NOT NULL,
        "university_category" VARCHAR(100) NOT NULL,
        "statistics" DECIMAL(3,1) NOT NULL,
        "calculus" DECIMAL(3,1) NOT NULL,
        "geometry" DECIMAL(3,1) NOT NULL,
        "ai_math" DECIMAL(3,1) NOT NULL,
        "physics1" DECIMAL(3,1) NOT NULL,
        "physics2" DECIMAL(3,1) NOT NULL,
        "chemistry1" DECIMAL(3,1) NOT NULL,
        "chemistry2" DECIMAL(3,1) NOT NULL,
        "biology1" DECIMAL(3,1) NOT NULL,
        "biology2" DECIMAL(3,1) NOT NULL,
        "earth_science1" DECIMAL(3,1) NOT NULL,
        "earth_science2" DECIMAL(3,1) NOT NULL,
        CONSTRAINT "PK_series_evaluation_criteria_science" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_sec_science_level" ON "series_evaluation_criteria_science" ("level")`,
    );

    await queryRunner.query(`
      COMMENT ON TABLE "series_evaluation_criteria_science" IS '이과 계열 적합성 평가 기준'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_sec_science_level"`);
    await queryRunner.query(
      `DROP TABLE "series_evaluation_criteria_science"`,
    );

    await queryRunner.query(`DROP INDEX "idx_sec_humanities_level"`);
    await queryRunner.query(
      `DROP TABLE "series_evaluation_criteria_humanities"`,
    );

    await queryRunner.query(`DROP INDEX "idx_university_level_name"`);
    await queryRunner.query(`DROP INDEX "idx_university_level_code"`);
    await queryRunner.query(`DROP TABLE "university_level"`);
  }
}
