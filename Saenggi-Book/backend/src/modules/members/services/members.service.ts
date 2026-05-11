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

  // JWT sub = Hub member ID (alphanumeric VarChar) -> hub.auth_member에서 직접 조회
  async findOneById(id: string | number): Promise<any | null> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
        SELECT id, email, nickname, member_type, phone FROM hub.auth_member WHERE id = ${String(id)} LIMIT 1
      `;
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.warn(`findOneById failed: ${error.message}`);
      return null;
    }
  }

  // /auth/me: hub.auth_member 기반, sv_auth_member Saenggi-Book 전용 필드는 이메일로 fallback 조회
  async findMeById(id: string | number): Promise<any | null> {
    try {
      const hubResults = await this.prisma.$queryRaw<any[]>`
        SELECT id, email, nickname, member_type, phone FROM hub.auth_member WHERE id = ${String(id)} LIMIT 1
      `;
      if (hubResults.length === 0) return null;
      const hubRow = hubResults[0];

      let svRow: any = null;
      if (hubRow.email) {
        try {
          const svResults = await this.prisma.$queryRaw<any[]>`
            SELECT hst_type_id, graduate_year, major FROM sv_auth_member WHERE email = ${hubRow.email} LIMIT 1
          `;
          if (svResults.length > 0) svRow = svResults[0];
        } catch (_) {
          // sv_auth_member 조회 실패 무시
        }
      }

      return {
        id: hubRow.id,
        email: hubRow.email,
        nickname: hubRow.nickname,
        member_type: hubRow.member_type,
        hub_member_id: hubRow.id,
        hst_type_id: svRow?.hst_type_id ?? null,
        graduate_year: svRow?.graduate_year ?? null,
        major: svRow?.major ?? null,
        role_type: 'ROLE_USER',
        phone: hubRow.phone ?? null,
        ck_sms_agree: false,
        s_type_id: null,
        g_type_id: null,
      };
    } catch (error) {
      this.logger.warn(`findMeById failed for ${id}: ${error.message}`);
      return null;
    }
  }

  async findActiveServicesById(memberId: string | number): Promise<string[]> {
    const testAccountEmails = ['test@test.com', 'admin@test.com', 'test2@test.com', 'test3@test.com'];
    let email: string | null = null;

    try {
      const members = await this.prisma.$queryRaw<any[]>`
        SELECT email FROM hub.auth_member WHERE id = ${String(memberId)} LIMIT 1
      `;
      if (members.length > 0) email = members[0].email;
    } catch (error) {
      this.logger.warn(`findActiveServicesById - Member lookup failed for ${memberId}: ${error.message}`);
    }

    if (email && testAccountEmails.includes(email)) {
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
        SELECT * FROM hub.auth_member WHERE id = ${oauthId} LIMIT 1
      `;
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.warn(`findOneByOAuthId failed: ${error.message}`);
      return null;
    }
  }

  async findOneByPhone(phone: string): Promise<any | null> {
    return null;
  }

  async saveMemberByEmail(data: RegisterWithEmailDto): Promise<any | null> {
    throw new Error('이메일 직접 가입은 Hub를 통해 진행해주세요.');
  }

  async saveMemberBySocial(
    data: RegisterWithSocialDto,
    socialUser: SocialUser,
  ): Promise<any | null> {
    throw new Error('소셜 가입은 Hub를 통해 진행해주세요.');
  }

  async editProfile(memberId: string, updateData: EditProfileDto): Promise<any> {
    const member = await this.findOneById(memberId);
    if (!member) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const majorVal = updateData.major !== undefined
      ? (updateData.major === 0 ? 'LiberalArts' : 'NaturalSciences')
      : null;

    const graduateYear = updateData.graduate_year !== undefined ? updateData.graduate_year : null;
    const hstTypeId = updateData.hst_type_id !== undefined ? String(updateData.hst_type_id) : null;

    if (member.email) {
      try {
        await this.prisma.$queryRaw<any[]>`
          INSERT INTO sv_auth_member (email, member_type, hub_member_id, account_stop_yn, create_dt, update_dt,
            major, graduate_year, hst_type_id)
          VALUES (${member.email}, ${member.member_type}, 0, 'N', NOW(), NOW(),
            ${majorVal}, ${graduateYear}, ${hstTypeId})
          ON CONFLICT (email) DO UPDATE SET
            major = COALESCE(EXCLUDED.major, sv_auth_member.major),
            graduate_year = COALESCE(EXCLUDED.graduate_year, sv_auth_member.graduate_year),
            hst_type_id = COALESCE(EXCLUDED.hst_type_id, sv_auth_member.hst_type_id),
            update_dt = NOW()
        `;
      } catch (error) {
        this.logger.warn(`editProfile sv_auth_member upsert failed: ${error.message}`);
      }
    }

    return {
      ...member,
      major: majorVal ?? member.major,
      graduate_year: graduateYear ?? member.graduate_year,
      hst_type_id: hstTypeId ?? member.hst_type_id,
    };
  }

  async findOneByEmailAndPhone(email: string, phone: string): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM sv_auth_member WHERE email = ${email} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async updatePassword(memberId: string | number, newPassword: string): Promise<void> {
    this.logger.warn(`updatePassword called for member ${memberId} but sv_auth_member has no password column`);
  }

  async createMemberFromOAuth(data: {
    email: string;
    nickname: string;
    phone: string;
    hubMemberId: string;
  }): Promise<any> {
    try {
      const existing = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM hub.auth_member WHERE id = ${data.hubMemberId} LIMIT 1
      `;
      if (existing.length > 0) return existing[0];
    } catch (error) {
      this.logger.warn(`createMemberFromOAuth lookup failed: ${error.message}`);
    }
    return { id: data.hubMemberId, email: data.email, nickname: data.nickname, member_type: 'student' };
  }
}
