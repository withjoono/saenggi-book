import { Entity } from 'typeorm';
import { MemberBaseEntity } from './member-base.entity';

/**
 * StudyPlanner 전용 회원 엔티티 (읽기 전용)
 *
 * StudyPlanner DB의 sp_auth_member 테이블을 참조합니다.
 * 이 엔티티는 플래너 관련 엔티티에서 FK 참조용으로만 사용합니다.
 */
@Entity('sp_auth_member')
export class SpMemberEntity extends MemberBaseEntity {
    /**
     * 전체 이름 반환 (닉네임 또는 이메일)
     */
    get displayName(): string {
        return this.nickname || this.email?.split('@')[0] || 'Unknown';
    }
}
