// @ts-nocheck

export class CreateSusiRecruitmentUnitsTable1737250000000 implements MigrationInterface {
  name = 'CreateSusiRecruitmentUnitsTable1737250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ss_recruitment_units" (
        "id" VARCHAR(20) NOT NULL,
        "university_name" VARCHAR(100) NOT NULL,
        "university_code" VARCHAR(20) NOT NULL,
        "admission_type" VARCHAR(50) NOT NULL,
        "admission_type_code" INTEGER NOT NULL,
        "admission_name" VARCHAR(100) NOT NULL,
        "unit_name" VARCHAR(200) NOT NULL,
        "region" VARCHAR(50),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ss_recruitment_units" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_ss_ru_university_code" ON "ss_recruitment_units" ("university_code")`);
    await queryRunner.query(`CREATE INDEX "idx_ss_ru_admission_type" ON "ss_recruitment_units" ("admission_type")`);
    await queryRunner.query(`CREATE INDEX "idx_ss_ru_admission_type_code" ON "ss_recruitment_units" ("admission_type_code")`);
    await queryRunner.query(`CREATE INDEX "idx_ss_ru_region" ON "ss_recruitment_units" ("region")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_ss_ru_region"`);
    await queryRunner.query(`DROP INDEX "idx_ss_ru_admission_type_code"`);
    await queryRunner.query(`DROP INDEX "idx_ss_ru_admission_type"`);
    await queryRunner.query(`DROP INDEX "idx_ss_ru_university_code"`);
    await queryRunner.query(`DROP TABLE "ss_recruitment_units"`);
  }
}
