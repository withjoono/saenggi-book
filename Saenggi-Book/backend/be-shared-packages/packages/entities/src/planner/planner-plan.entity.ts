import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { SpMemberEntity } from '../member/sp-member.entity';
import { PlanType } from '@geobuk/shared-types';

/**
 * 플래너 장기계획 엔티티
 */
@Entity('sp_plan')
@Index(['memberId'])
export class PlannerPlanEntity extends BaseEntity {
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subject: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  step: string;

  // 기간
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string;

  // 교재/강의
  @Column({ type: 'int', default: PlanType.LECTURE })
  type: PlanType;

  @Column({ type: 'varchar', length: 200, nullable: true })
  material: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  person: string;

  // 진행률
  @Column({ type: 'int', nullable: true })
  total: number;

  @Column({ type: 'int', default: 0 })
  done: number;

  // 상태
  @Column({ name: 'is_item', type: 'boolean', default: false })
  isItem: boolean;

  @Column({ name: 'is_item_done', type: 'boolean', default: false })
  isItemDone: boolean;

  // 관계
  @ManyToOne(() => SpMemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: SpMemberEntity;

  /**
   * 진행률 계산 (0-100)
   */
  get progressPercent(): number {
    if (!this.total || this.total === 0) return 0;
    return Math.min(Math.round((this.done / this.total) * 100), 100);
  }
}

