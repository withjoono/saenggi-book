// @ts-nocheck

export class SeedOfficerSurveyData1738483000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if data already exists
    const existing = await queryRunner.query(
      'SELECT COUNT(*) as count FROM officer_bottom_survey_tb',
    );

    if (existing[0].count > 0) {
      console.log('✅ Survey data already exists, skipping seed');
      return;
    }

    // 학업역량 (HAKUP) 문항
    await queryRunner.query(
      `INSERT INTO officer_bottom_survey_tb (evaluate_content, order_num, main_survey_type) VALUES
      ('학업 성취도 및 학업 역량의 발전 가능성', 1, 'HAKUP'),
      ('교과 성적의 우수성 및 학업에 대한 열정', 2, 'HAKUP'),
      ('탐구활동 및 심화학습의 적극성', 3, 'HAKUP'),
      ('학업 태도 및 자기주도적 학습 능력', 4, 'HAKUP'),
      ('교과 세부능력 및 특기사항의 우수성', 5, 'HAKUP')`,
    );

    // 진로역량 (JINRO) 문항
    await queryRunner.query(
      `INSERT INTO officer_bottom_survey_tb (evaluate_content, order_num, main_survey_type) VALUES
      ('전공 적합성 및 진로 목표의 명확성', 6, 'JINRO'),
      ('관련 분야에 대한 관심과 탐구 활동', 7, 'JINRO'),
      ('진로 관련 독서 및 심화 활동', 8, 'JINRO'),
      ('진로 개발을 위한 노력 및 계획', 9, 'JINRO'),
      ('전공 분야에 대한 이해도 및 열정', 10, 'JINRO')`,
    );

    // 공동체역량 (GONGDONG) 문항
    await queryRunner.query(
      `INSERT INTO officer_bottom_survey_tb (evaluate_content, order_num, main_survey_type) VALUES
      ('협력 및 소통 능력', 11, 'GONGDONG'),
      ('나눔과 배려 실천', 12, 'GONGDONG'),
      ('공동체 의식 및 시민 의식', 13, 'GONGDONG'),
      ('리더십 및 팔로워십', 14, 'GONGDONG'),
      ('봉사활동의 지속성 및 의미', 15, 'GONGDONG')`,
    );

    // 기타역량 (ETC) 문항
    await queryRunner.query(
      `INSERT INTO officer_bottom_survey_tb (evaluate_content, order_num, main_survey_type) VALUES
      ('창의성 및 문제해결 능력', 16, 'ETC'),
      ('도전정신 및 성실성', 17, 'ETC'),
      ('특별한 재능 및 잠재력', 18, 'ETC'),
      ('인성 및 가치관', 19, 'ETC'),
      ('종합적인 발전 가능성', 20, 'ETC')`,
    );

    console.log('✅ Successfully seeded 20 survey questions');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove seeded data
    await queryRunner.query(
      `DELETE FROM officer_bottom_survey_tb WHERE id BETWEEN 1 AND 20`,
    );
  }
}
