import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 기본 엔티티 클래스
 * 모든 엔티티가 상속받는 공통 필드
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

/**
 * Soft Delete를 지원하는 기본 엔티티
 */
export abstract class SoftDeleteBaseEntity extends BaseEntity {
  // TypeORM의 @DeleteDateColumn은 각 서비스에서 필요시 추가
}
