import { Entity } from 'typeorm';
import { MemberBaseEntity } from './member-base.entity';

/**
 * 회원 엔티티 (읽기 전용)
 *
 * ⚠️ 주의: 이 엔티티는 다른 서비스에서 **읽기 전용**으로만 사용하세요.
 * 회원 데이터의 생성/수정/삭제는 반드시 메인 백엔드(GB-Back-Nest)를 통해서만 진행해야 합니다.
 *
 * @example
 * // 플래너 서비스에서 회원 정보 조회
 * const member = await memberRepository.findOne({
 *   where: { id: memberId },
 *   select: ['id', 'email', 'nickname', 'memberType']
 * });
 */
@Entity('member_tb')
export class MemberEntity extends MemberBaseEntity {
  // 추가 관계는 각 서비스에서 필요시 확장
  // 이 엔티티는 기본 회원 정보만 포함

  /**
   * 전체 이름 반환 (닉네임 또는 이메일)
   */
  get displayName(): string {
    return this.nickname || this.email?.split('@')[0] || 'Unknown';
  }
}
