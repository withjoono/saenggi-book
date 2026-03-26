// @ts-nocheck

export class AddCategoryColumnsToSurvey1738484000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add main_category column
    await queryRunner.query(
      `ALTER TABLE officer_bottom_survey_tb ADD COLUMN IF NOT EXISTS main_category VARCHAR(50)`,
    );

    // Add middle_category column
    await queryRunner.query(
      `ALTER TABLE officer_bottom_survey_tb ADD COLUMN IF NOT EXISTS middle_category VARCHAR(100)`,
    );

    console.log('✅ Added main_category and middle_category columns');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE officer_bottom_survey_tb DROP COLUMN IF EXISTS main_category`,
    );
    await queryRunner.query(
      `ALTER TABLE officer_bottom_survey_tb DROP COLUMN IF EXISTS middle_category`,
    );
  }
}
