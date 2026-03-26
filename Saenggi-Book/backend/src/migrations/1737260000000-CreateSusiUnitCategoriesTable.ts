// @ts-nocheck

export class CreateSusiUnitCategoriesTable1737260000000 implements MigrationInterface {
  name = 'CreateSusiUnitCategoriesTable1737260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ss_unit_categories" (
        "id" VARCHAR(20) NOT NULL,
        "field_code" VARCHAR(10) NOT NULL,
        "major_field" VARCHAR(50) NOT NULL,
        "major_field_code" INTEGER NOT NULL,
        "mid_field" VARCHAR(50) NOT NULL,
        "mid_field_code" INTEGER NOT NULL,
        "minor_field" VARCHAR(100) NOT NULL,
        "minor_field_code" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ss_unit_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_ss_uc_major_field" ON "ss_unit_categories" ("major_field_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ss_uc_mid_field" ON "ss_unit_categories" ("mid_field_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ss_uc_minor_field" ON "ss_unit_categories" ("minor_field_code")`,
    );

    await queryRunner.query(`
      COMMENT ON TABLE "ss_unit_categories" IS '수시 모집단위 계열 분류'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_ss_uc_minor_field"`);
    await queryRunner.query(`DROP INDEX "idx_ss_uc_mid_field"`);
    await queryRunner.query(`DROP INDEX "idx_ss_uc_major_field"`);
    await queryRunner.query(`DROP TABLE "ss_unit_categories"`);
  }
}
