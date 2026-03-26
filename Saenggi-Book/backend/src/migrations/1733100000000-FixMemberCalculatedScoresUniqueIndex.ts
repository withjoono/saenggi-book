// @ts-nocheck

export class FixMemberCalculatedScoresUniqueIndex1733100000000 implements MigrationInterface {
  name = 'FixMemberCalculatedScoresUniqueIndex1733100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 유니크 인덱스 삭제 (두 가지 가능한 이름 모두 시도)
    try {
      await queryRunner.dropIndex(
        'ts_member_calculated_scores',
        'IDX_member_calculated_scores_member_university',
      );
    } catch {
      // 인덱스가 없으면 무시
    }

    try {
      await queryRunner.dropIndex('ts_member_calculated_scores', 'IDX_9b940bfcab59419e0c82ca9ea8');
    } catch {
      // 인덱스가 없으면 무시
    }

    // 기존 데이터 삭제 (중복 방지)
    await queryRunner.query('DELETE FROM ts_member_calculated_scores');

    // 새로운 유니크 인덱스 생성 (score_calculation 포함)
    await queryRunner.createIndex(
      'ts_member_calculated_scores',
      new TableIndex({
        name: 'IDX_member_calculated_scores_member_univ_calc',
        columnNames: ['member_id', 'university_id', 'score_calculation'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 새 인덱스 삭제
    await queryRunner.dropIndex(
      'ts_member_calculated_scores',
      'IDX_member_calculated_scores_member_univ_calc',
    );

    // 원래 인덱스 복원
    await queryRunner.createIndex(
      'ts_member_calculated_scores',
      new TableIndex({
        name: 'IDX_member_calculated_scores_member_university',
        columnNames: ['member_id', 'university_id'],
        isUnique: true,
      }),
    );
  }
}
