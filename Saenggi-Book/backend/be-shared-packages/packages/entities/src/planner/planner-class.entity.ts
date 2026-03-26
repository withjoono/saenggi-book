import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { SpMemberEntity } from '../member/sp-member.entity';

/**
 * 플래너 클래스 엔티티 (멘토링 클래스)
 */
@Entity('sp_class')
@Index(['plannerId'])
@Index(['classCode'], { unique: true })
export class PlannerClassEntity extends BaseEntity {
  @Column({ name: 'planner_id', type: 'bigint' })
  plannerId: number; // 멘토 ID

  @Column({ name: 'class_code', type: 'varchar', length: 10 })
  classCode: string;

  @Column({ name: 'class_name', type: 'varchar', length: 100, nullable: true })
  className: string;

  @Column({ name: 'start_date', type: 'varchar', length: 8 })
  startDate: string; // YYYYMMDD

  @Column({ name: 'end_date', type: 'varchar', length: 8, nullable: true })
  endDate: string;

  @Column({ name: 'use_yn', type: 'char', length: 1, default: 'Y' })
  useYn: 'Y' | 'N';

  // 관계
  @ManyToOne(() => SpMemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planner_id' })
  mentor: SpMemberEntity;

  /**
   * 클래스 활성화 여부
   */
  get isActive(): boolean {
    return this.useYn === 'Y';
  }
}
