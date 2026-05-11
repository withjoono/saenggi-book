import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RegisterWithEmailDto } from 'src/auth/dtos/register-with-email.dto';
import { RegisterWithSocialDto } from 'src/auth/dtos/register-with-social';
import { SocialUser } from 'src/auth/types/social-user.type';
import { BcryptService } from 'src/common/bcrypt/bcrypt.service';
import { EditProfileDto } from '../dtos/edit-profile.dto';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private bcryptService: BcryptService,
  ) { }

  async findOneByEmail(email: string): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM sv_auth_member WHERE email = ${email} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async findOneByEmailAndProviderType(
    email: string,
    providerType: 'local' | 'google' | 'naver',
  ): Promise<any | null> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM sv_auth_member WHERE email = ${email} LIMIT 1
      `;
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.warn(`findOneByEmailAndProviderType failed: ${error.message}`);
      return null;
    }
  }

  // JWT sub = Hub member ID (VarChar) → sv_auth_member.hub_member_id (BigInt) 로 조회
  async findOneById(id: string | number): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM sv_auth_member WHERE hub_member_id = ${BigInt(String(id))} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async findMeById(id: string | number): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT id, email, nickname, hst_type_id, graduate_year, major, member_type, hub_member_id
      FROM sv_auth_member WHERE hub_member_id = ${BigInt(String(id))} LIMIT 1
    `;
    if (results.length === 0) return null;
    const row = results[0];
    // sv_auth_member는 Hub 인증 기반이므로 일부 필드는 기본값 반환
    return {
      ...row,
      role_type: 'ROLE_USER',
      phone: null,
      ck_sms_agree: false,
      s_type_id: null,
      g_type_id: null,
    };
  }

  async findActiveServicesById(memberId: string | number): Promise<string[]> {
    // 테스트 계정은 모든 서비스 이용 가능
    const testAccountEmails = ['test@test.com', 'admin@test.com', 'test2@test.com', 'test3@test.com'];
    let members: any[] = [];

    try {
      members = await this.prisma.$queryRaw<any[]>`
        SELECT email FROM sv_auth_member WHERE hub_member_id = ${BigInt(String(memberId))} LIMIT 1
      `;
    } catch (error) {
      this.logger.warn(`findActiveServicesById - Member lookup failed for ${memberId}: ${error.message}`);
    }

    if (members.length > 0 && testAccountEmails.includes(members[0].email)) {
      return ['S', 'J', 'T'];
    }

    try {
      const results = await this.prisma.$queryRaw<any[]>`
        SELECT ps.service_range_code
        FROM hub.payment_contract pc
        JOIN hub.payment_order po ON pc.order_id = po.id
        JOIN hub.payment_service ps ON po.pay_service_id = ps.id
        WHERE pc.member_id = ${String(memberId)}
          AND pc.contract_period_end_dt > NOW()
          AND pc.contract_use = 1
      `;
      return results.map((result) => result.service_range_code);
    } catch (error) {
      this.logger.warn(`findActiveServicesById - Active services lookup failed for member ${memberId}: ${error.message}`);
      return ['S', 'J', 'T'];
    }
  }

  async findOneByOAuthId(oauthId: string): Promise<any | null> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM sv_auth_member WHERE hub_member_id = ${BigInt(oauthId)} LIMIT 1
      `;
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.warn(`findOneByOAuthId failed: ${error.message}`);
      return null;
    }
  }

  async findOneByPhone(phone: string): Promise<any | null> {
    // phone 컬럼은 sv_auth_member에 없음 - null 반환
    return null;
  }

  async saveMemberByEmail(data: RegisterWithEmailDto): Promise<any | null> {
    // 이메일 직접 가입은 Hub 전환 후 지원하지 않음
    throw new Error('이메일 직접 가입은 Hub를 통해 진행해주세요.');
  }

  async saveMemberBySocial(
    data: RegisterWithSocialDto,
    socialUser: SocialUser,
  ): Promise<any | null> {
    // 소셜 직접 가입은 Hub 전환 후 지원하지 않음
    throw new Error('소셜 가입은 Hub를 통해 진행해주세요.');
  }

  async editProfile(memberId: string, updateData: EditProfileDto): Promise<any> {
    const member = await this.findOneById(memberId);
    if (!member) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const majorVal = updateData.major !== undefined
      ? (updateData.major === 0 ? 'LiberalArts' : 'NaturalSciences')
      : member.major;

    const graduateYear = updateData.graduate_year !== undefined ? updateData.graduate_year : member.graduate_year;
    const hstTypeId = updateData.hst_type_id !== undefined ? String(updateData.hst_type_id) : member.hst_type_id;

    const results = await this.prisma.$queryRaw<any[]>`
      UPDATE sv_auth_member
      SET major = ${majorVal}, graduate_year = ${graduateYear}, hst_type_id = ${hstTypeId}, update_dt = NOW()
      WHERE hub_member_id = ${BigInt(memberId)}
      RETURNING *
    `;
    return results.length > 0 ? results[0] : member;
  }

  async findOneByEmailAndPhone(email: string, phone: string): Promise<any | null> {
    // phone 컬럼은 sv_auth_member에 없으므로 email로만 조회
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM sv_auth_member WHERE email = ${email} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async updatePassword(memberId: string | number, newPassword: string): Promise<void> {
    // password 컬럼은 sv_auth_member에 없음 - Hub에서 비밀번호 관리
    this.logger.warn(`updatePassword called for member ${memberId} but sv_auth_member has no password column`);
  }

  async createMemberFromOAuth(data: {
    email: string;
    nickname: string;
    phone: string;
    hubMemberId: string;
  }): Promise<any> {
    // 기존 회원 확인 (hub_member_id 기준)
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM sv_auth_member WHERE hub_member_id = ${BigInt(data.hubMemberId)} LIMIT 1
    `;
    if (existing.length > 0) return existing[0];

    const results = await this.prisma.$queryRaw<any[]>`
      INSERT INTO sv_auth_member (email, nickname, hub_member_id, member_type, account_stop_yn, create_dt, update_dt)
      VALUES (${data.email}, ${data.nickname}, ${BigInt(data.hubMemberId)}, 'student', 'N', NOW(), NOW())
      RETURNING *
    `;
    return results[0];
  }
}
