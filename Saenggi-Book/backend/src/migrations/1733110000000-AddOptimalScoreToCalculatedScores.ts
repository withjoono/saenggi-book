// @ts-nocheck

export class AddOptimalScoreToCalculatedScores1733110000000 implements MigrationInterface {
  name = 'AddOptimalScoreToCalculatedScores1733110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // optimal_score 컬럼 추가
    await queryRunner.addColumn(
      'ts_member_calculated_scores',
      new TableColumn({
        name: 'optimal_score',
        type: 'decimal',
        precision: 10,
        scale: 5,
        default: 0,
        comment: '최적 선택과목 조합 점수',
      }),
    );

    // score_difference 컬럼 추가
    await queryRunner.addColumn(
      'ts_member_calculated_scores',
      new TableColumn({
        name: 'score_difference',
        type: 'decimal',
        precision: 10,
        scale: 5,
        default: 0,
        comment: '유불리 점수 차이 (optimal_score - converted_score)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('ts_member_calculated_scores', 'score_difference');
    await queryRunner.dropColumn('ts_member_calculated_scores', 'optimal_score');
  }
}
