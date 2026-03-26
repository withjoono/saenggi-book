import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { SpMemberEntity } from '../member/sp-member.entity';
import { PlannerPrimaryType, TaskStatus } from '@geobuk/shared-types';

/**
 * 플래너 일정 아이템 엔티티
 */
@Entity('sp_item')
@Index(['memberId'])
@Index(['memberId', 'startDate', 'endDate'])
export class PlannerItemEntity extends BaseEntity {
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  // 분류
  @Column({
    name: 'primary_type',
    type: 'varchar',
    length: 10,
    default: PlannerPrimaryType.STUDY,
  })
  primaryType: PlannerPrimaryType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subject: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  teacher: string;

  // 일정
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'r_rule', type: 'varchar', length: 500, nullable: true })
  rRule: string;

  @Column({ name: 'ex_date', type: 'text', nullable: true })
  exDate: string;

  // 상태
  @Column({ type: 'boolean', default: false })
  late: boolean;

  @Column({ type: 'boolean', default: false })
  absent: boolean;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({
    name: 'task_status',
    type: 'varchar',
    length: 20,
    nullable: true,
    default: TaskStatus.PENDING,
  })
  taskStatus: TaskStatus;

  // 학습상세
  @Column({ name: 'study_type', type: 'varchar', length: 50, nullable: true })
  studyType: string;

  @Column({ name: 'study_content', type: 'text', nullable: true })
  studyContent: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // 범위
  @Column({ name: 'start_page', type: 'int', nullable: true })
  startPage: number;

  @Column({ name: 'end_page', type: 'int', nullable: true })
  endPage: number;

  @Column({ name: 'start_session', type: 'int', nullable: true })
  startSession: number;

  @Column({ name: 'end_session', type: 'int', nullable: true })
  endSession: number;

  // 평가
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'int', nullable: true })
  rank: number;

  @Column({ type: 'int', nullable: true })
  achievement: number;

  // 멘토 평가
  @Column({ name: 'mentor_rank', type: 'int', nullable: true })
  mentorRank: number;

  @Column({ name: 'mentor_desc', type: 'text', nullable: true })
  mentorDesc: string;

  @Column({ name: 'mentor_test', type: 'varchar', length: 200, nullable: true })
  mentorTest: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  test: string;

  @Column({ name: 'plan_date', type: 'date', nullable: true })
  planDate: Date;

  // 관계
  @ManyToOne(() => SpMemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: SpMemberEntity;
}
