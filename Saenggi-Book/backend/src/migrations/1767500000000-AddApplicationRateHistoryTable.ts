// @ts-nocheck

export class AddApplicationRateHistoryTable1767500000000 implements MigrationInterface {
  name = 'AddApplicationRateHistoryTable1767500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // application_rate_history 테이블 생성
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "application_rate_history" (
        "id" SERIAL PRIMARY KEY,
        "university_code" VARCHAR(20) NOT NULL,
        "university_name" VARCHAR(300) NOT NULL,
        "department_name" VARCHAR(400) NOT NULL,
        "admission_type" VARCHAR(300),
        "recruitment_count" INTEGER DEFAULT 0,
        "application_count" INTEGER DEFAULT 0,
        "previous_application_count" INTEGER DEFAULT 0,
        "competition_rate" DECIMAL(10, 2) DEFAULT 0,
        "previous_competition_rate" DECIMAL(10, 2) DEFAULT 0,
        "change_amount" INTEGER DEFAULT 0,
        "recorded_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 인덱스 생성
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_application_rate_history_lookup"
      ON "application_rate_history" ("university_code", "department_name", "recorded_at")
    `);

    // application_rates 테이블이 없다면 생성
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "application_rates" (
        "id" SERIAL PRIMARY KEY,
        "university_code" VARCHAR(20) NOT NULL,
        "university_name" VARCHAR(300) NOT NULL,
        "department_name" VARCHAR(400) NOT NULL,
        "admission_type" VARCHAR(300),
        "recruitment_count" INTEGER DEFAULT 0,
        "application_count" INTEGER DEFAULT 0,
        "competition_rate" DECIMAL(10, 2) DEFAULT 0,
        "source_url" VARCHAR(500) NOT NULL,
        "crawled_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 인덱스 생성
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_application_rates_lookup"
      ON "application_rates" ("university_code", "department_name", "admission_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_application_rate_history_lookup"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "application_rate_history"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_application_rates_lookup"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "application_rates"`);
  }
}
