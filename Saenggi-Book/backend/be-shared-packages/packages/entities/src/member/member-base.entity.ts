import { Column, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../common/base.entity';
import { MemberRole, MemberType, AuthProvider } from '@geobuk/shared-types';

/**
 * 회원 기본 엔티티 (추상 클래스)
 *
 * ⚠️ 이 클래스는 메인 백엔드의 MemberEntity와 호환됩니다.
 * 다른 서비스에서는 이 클래스를 상속받아 읽기 전용으로 사용하세요.
 *
 * @example
 * // 플래너 서비스에서 사용
 * @Entity('member_tb')
 * export class MemberReadOnlyEntity extends MemberBaseEntity {}
 */
export abstract class MemberBaseEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 500, nullable: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @Column({
    name: 'member_type',
    type: 'varchar',
    length: 20,
    default: MemberType.STUDENT,
  })
  memberType: MemberType;

  @Column({
    name: 'member_role',
    type: 'varchar',
    length: 30,
    default: MemberRole.USER,
  })
  memberRole: MemberRole;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({ name: 'provider_id', type: 'varchar', length: 255, nullable: true })
  providerId: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  @Exclude()
  refreshToken: string;
}
