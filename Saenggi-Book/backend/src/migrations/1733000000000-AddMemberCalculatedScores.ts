// @ts-nocheck

export class AddMemberCalculatedScores1733000000000 implements MigrationInterface {
  name = 'AddMemberCalculatedScores1733000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ts_member_calculated_scores',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '환산점수 고유 ID',
          },
          {
            name: 'member_id',
            type: 'int',
            comment: '회원 ID',
          },
          {
            name: 'university_id',
            type: 'int',
            comment: '대학 ID',
          },
          {
            name: 'university_name',
            type: 'varchar',
            length: '100',
            comment: '대학명',
          },
          {
            name: 'score_calculation',
            type: 'varchar',
            length: '100',
            comment: '환산식 코드명',
          },
          {
            name: 'major',
            type: 'varchar',
            length: '50',
            comment: '계열 (인문/자연)',
          },
          {
            name: 'converted_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '환산점수',
          },
          {
            name: 'standard_score_sum',
            type: 'int',
            default: 0,
            comment: '표점합',
          },
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
            onUpdate: 'CURRENT_TIMESTAMP',
            comment: '수정일시',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['member_id'],
            referencedTableName: 'member_tb',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['university_id'],
            referencedTableName: 'ts_universities',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // 인덱스 생성
    await queryRunner.createIndex(
      'ts_member_calculated_scores',
      new TableIndex({
        name: 'IDX_member_calculated_scores_member_id',
        columnNames: ['member_id'],
      }),
    );

    await queryRunner.createIndex(
      'ts_member_calculated_scores',
      new TableIndex({
        name: 'IDX_member_calculated_scores_member_university',
        columnNames: ['member_id', 'university_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ts_member_calculated_scores');
  }
}
