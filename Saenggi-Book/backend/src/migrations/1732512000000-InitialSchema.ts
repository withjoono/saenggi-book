// @ts-nocheck

/**
 * Initial Schema Migration
 *
 * 이 마이그레이션은 기존 DB_SYNCHRONIZE=true로 생성된 스키마를 마이그레이션 시스템으로 전환하기 위한 것입니다.
 *
 * 중요: 이 마이그레이션은 빈 데이터베이스에서 실행되어야 합니다.
 * 만약 이미 테이블이 존재하는 경우, 이 마이그레이션을 건너뛰고
 * 다음 마이그레이션부터 실행하세요.
 *
 * 실행 방법:
 * 1. 새 데이터베이스: yarn typeorm migration:run
 * 2. 기존 데이터베이스: 이 마이그레이션을 수동으로 typeorm_migrations 테이블에 기록
 *
 * 기록 방법 (기존 DB의 경우):
 * INSERT INTO typeorm_migrations (timestamp, name)
 * VALUES (1732512000000, 'InitialSchema1732512000000');
 */
export class InitialSchema1732512000000 implements MigrationInterface {
  name = 'InitialSchema1732512000000';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    // 이 마이그레이션은 "베이스라인" 마이그레이션입니다.
    // 실제 테이블 생성은 DB_SYNCHRONIZE=true로 이미 완료되었습니다.
    //
    // 새 데이터베이스의 경우, 다음 방법 중 하나를 선택하세요:
    //
    // 방법 1: DB_SYNCHRONIZE=true로 한 번 실행하여 스키마 생성 후
    //         이 마이그레이션을 manually insert하여 기록
    //
    // 방법 2: 아래 주석을 해제하여 자동 생성된 스키마 SQL 사용
    //         (yarn typeorm migration:generate로 생성 가능)

    console.log('⚠️  InitialSchema migration - 베이스라인 마이그레이션');
    console.log('📝 이 마이그레이션은 기존 스키마를 추적하기 위한 것입니다.');
    console.log('✅ 기존 데이터베이스의 경우: 이 마이그레이션을 수동으로 기록하세요.');
    console.log('🆕 새 데이터베이스의 경우: DB_SYNCHRONIZE=true로 스키마 생성 후 기록하세요.');

    // 실제 테이블 생성 SQL은 필요시 여기에 추가
    // 현재는 베이스라인 마커로만 사용
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️  InitialSchema 롤백은 권장되지 않습니다.');
    console.log('📝 모든 테이블을 삭제하게 됩니다.');
    // 롤백 시 모든 테이블 삭제 - 프로덕션에서 매우 위험!
    // 실제 구현 시 모든 테이블 DROP 쿼리 필요
  }
}
