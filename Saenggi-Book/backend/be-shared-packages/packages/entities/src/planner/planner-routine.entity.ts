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
 * 주간 루틴 카테고리
 */
export enum RoutineCategory {
    FIXED = 'fixed',       // 고정 일과 (수업, 식사, 수면 등)
    STUDY = 'study',       // 학습 시간 (과목별)
    REST = 'rest',         // 휴식
    OTHER = 'other',       // 기타
}

/**
 * 플래너 주간 루틴 엔티티
 *
 * 사용자의 반복 일과를 정의합니다.
 * 요일별로 고정된 시간대를 설정하여 학습 가능 시간을 파악합니다.
 */
@Entity('sp_routine')
@Index(['memberId'])
export class PlannerRoutineEntity extends BaseEntity {
    @Column({ name: 'member_id', type: 'bigint' })
    memberId: number;

    @Column({ type: 'varchar', length: 200 })
    title: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: RoutineCategory.FIXED,
    })
    category: RoutineCategory;

    // 학습 루틴인 경우 과목
    @Column({ type: 'varchar', length: 50, nullable: true })
    subject: string;

    // 시간
    @Column({ name: 'start_time', type: 'time' })
    startTime: string; // "09:00"

    @Column({ name: 'end_time', type: 'time' })
    endTime: string; // "10:30"

    // 반복 설정
    @Column({ type: 'boolean', default: true })
    repeat: boolean;

    // 요일별 활성화 (JSON 배열: [일, 월, 화, 수, 목, 금, 토])
    @Column({ type: 'jsonb', default: [false, true, true, true, true, true, false] })
    days: boolean[];

    // 색상
    @Column({ type: 'varchar', length: 20, nullable: true })
    color: string;

    // 활성화 여부
    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    // 관계
    @ManyToOne(() => SpMemberEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member: SpMemberEntity;

    /**
     * 루틴 시간 (분)
     */
    get durationMinutes(): number {
        const [startH, startM] = this.startTime.split(':').map(Number);
        const [endH, endM] = this.endTime.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }
}
