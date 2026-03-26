// @ts-nocheck

export class CreateSusiCategorySubjectNecessityTable1737270000000
  implements MigrationInterface
{
  name = 'CreateSusiCategorySubjectNecessityTable1737270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ss_category_subject_necessity" (
        "id" VARCHAR(100) NOT NULL,
        "category_id" VARCHAR(20) NOT NULL,
        "major_field" VARCHAR(50) NOT NULL,
        "major_field_code" INTEGER NOT NULL,
        "mid_field" VARCHAR(50) NOT NULL,
        "mid_field_code" INTEGER NOT NULL,
        "minor_field" VARCHAR(100) NOT NULL,
        "minor_field_code" INTEGER NOT NULL,
        "subject_name" VARCHAR(50) NOT NULL,
        "necessity_level" INTEGER NOT NULL,
        "subject_type" VARCHAR(20) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ss_category_subject_necessity" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_ss_csn_category_subject" ON "ss_category_subject_necessity" ("category_id", "subject_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ss_csn_major_subject" ON "ss_category_subject_necessity" ("major_field_code", "subject_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ss_csn_mid_subject" ON "ss_category_subject_necessity" ("mid_field_code", "subject_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ss_csn_minor_subject" ON "ss_category_subject_necessity" ("minor_field_code", "subject_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ss_csn_category_id" ON "ss_category_subject_necessity" ("category_id")`,
    );

    await queryRunner.query(`
      COMMENT ON TABLE "ss_category_subject_necessity" IS '계열별 필수과목/권장과목'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_ss_csn_category_id"`);
    await queryRunner.query(`DROP INDEX "idx_ss_csn_minor_subject"`);
    await queryRunner.query(`DROP INDEX "idx_ss_csn_mid_subject"`);
    await queryRunner.query(`DROP INDEX "idx_ss_csn_major_subject"`);
    await queryRunner.query(`DROP INDEX "idx_ss_csn_category_subject"`);
    await queryRunner.query(`DROP TABLE "ss_category_subject_necessity"`);
  }
}
