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
      SELECT * FROM auth_member WHERE email = ${email} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async findOneByEmailAndProviderType(
    email: string,
    providerType: 'local' | 'google' | 'naver',
  ): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM auth_member WHERE email = ${email} AND provider_type = ${providerType} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async findOneById(id: string | number): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM auth_member WHERE id = ${String(id)} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async findMeById(id: string | number): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT id, email, role_type, phone, ck_sms_agree, nickname, s_type_id, hst_type_id, g_type_id, graduate_year, major, member_type
      FROM auth_member WHERE id = ${String(id)} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async findActiveServicesById(memberId: string | number): Promise<string[]> {
    // 테스트 계정은 모든 서비스 이용 가능
    const testAccountEmails = ['test@test.com', 'admin@test.com', 'test2@test.com', 'test3@test.com'];
    const members = await this.prisma.$queryRaw<any[]>`
      SELECT email FROM auth_member WHERE id = ${String(memberId)} LIMIT 1
    `;

    if (members.length > 0 && testAccountEmails.includes(members[0].email)) {
      return ['S', 'J', 'T'];
    }

    try {
      const results = await this.prisma.$queryRaw<any[]>`
        SELECT ps.service_range_code
        FROM pay_contract_tb pc
        JOIN pay_order_tb po ON pc.order_id = po.id
        JOIN pay_service_tb ps ON po.pay_service_id = ps.id
        WHERE pc.member_id = ${String(memberId)}
          AND pc.contract_period_end_dt > NOW()
          AND pc.contract_use = 1
      `;
      return results.map((result) => result.service_range_code);
    } catch (error) {
      this.logger.warn(`findActiveServicesById failed for member ${memberId}: ${error.message}`);
      return ['S', 'J', 'T'];
    }
  }

  async findOneByOAuthId(oauthId: string): Promise<any | null> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM auth_member WHERE oauth_id = ${oauthId} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async findOneByPhone(phone: string): Promise<any | null> {
    const cleanPhone = phone.replaceAll('-', '');
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM auth_member WHERE phone = ${cleanPhone} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async saveMemberByEmail(data: RegisterWithEmailDto): Promise<any | null> {
    const hashedPassword = await this.bcryptService.hashPassword(data.password);
    const phoneClean = data.phone?.replaceAll('-', '') || '';
    const majorVal = data.isMajor === '0' ? 'LiberalArts' : 'NaturalSciences';
    const memberType = data.memberType || 'student';

    const results = await this.prisma.$queryRaw<any[]>`
      INSERT INTO auth_member (nickname, email, password, role_type, phone, ck_sms, ck_sms_agree, graduate_year, hst_type_id, major, account_stop_yn, provider_type, member_type, create_dt, update_dt)
      VALUES (${data.nickname}, ${data.email}, ${hashedPassword}, 'ROLE_USER', ${phoneClean}, true, ${data.ckSmsAgree}, ${data.graduateYear}, ${data.hstTypeId}, ${majorVal}, 'N', 'local', ${memberType}, NOW(), NOW())
      RETURNING *
    `;
    return results.length > 0 ? results[0] : null;
  }

  async saveMemberBySocial(
    data: RegisterWithSocialDto,
    socialUser: SocialUser,
  ): Promise<any | null> {
    const phoneClean = data.phone?.replaceAll('-', '') || '';
    const majorVal = data.isMajor === '0' ? 'LiberalArts' : 'NaturalSciences';
    const memberType = data.memberType || 'student';

    const results = await this.prisma.$queryRaw<any[]>`
      INSERT INTO auth_member (nickname, email, profile_image_url, oauth_id, role_type, phone, ck_sms, ck_sms_agree, graduate_year, hst_type_id, major, account_stop_yn, member_type, provider_type, create_dt, update_dt)
      VALUES (${data.nickname}, ${socialUser.email}, ${socialUser.profile_image || ''}, ${socialUser.id}, 'ROLE_USER', ${phoneClean}, true, ${data.ckSmsAgree}, ${data.graduateYear}, ${data.hstTypeId}, ${majorVal}, 'N', ${memberType}, ${data.socialType}, NOW(), NOW())
      RETURNING *
    `;
    return results.length > 0 ? results[0] : null;
  }

  async editProfile(memberId: string, updateData: EditProfileDto): Promise<any> {
    const member = await this.findOneById(memberId);
    if (!member) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const majorVal = updateData.major !== undefined
      ? (updateData.major === 0 ? 'LiberalArts' : 'NaturalSciences')
      : member.major;

    const ckSmsAgree = updateData.ck_sms_agree !== undefined ? updateData.ck_sms_agree : member.ck_sms_agree;
    const graduateYear = updateData.graduate_year !== undefined ? updateData.graduate_year : member.graduate_year;
    const hstTypeId = updateData.hst_type_id !== undefined ? updateData.hst_type_id : member.hst_type_id;

    const results = await this.prisma.$queryRaw<any[]>`
      UPDATE auth_member
      SET major = ${majorVal}, ck_sms_agree = ${ckSmsAgree}, graduate_year = ${graduateYear}, hst_type_id = ${hstTypeId}, update_dt = NOW()
      WHERE id = ${memberId}
      RETURNING *
    `;
    return results.length > 0 ? results[0] : member;
  }

  async findOneByEmailAndPhone(email: string, phone: string): Promise<any | null> {
    const cleanPhone = phone.replaceAll('-', '');
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM auth_member WHERE email = ${email} AND phone = ${cleanPhone} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  }

  async updatePassword(memberId: string | number, newPassword: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE auth_member SET password = ${newPassword}, provider_type = 'local' WHERE id = ${String(memberId)}
    `;
  }

  async createMemberFromOAuth(data: {
    email: string;
    nickname: string;
    phone: string;
    hubMemberId: string;
  }): Promise<any> {
    const phoneClean = data.phone?.replaceAll('-', '') || '';
    const results = await this.prisma.$queryRaw<any[]>`
      INSERT INTO auth_member (email, nickname, phone, oauth_id, provider_type, role_type, ck_sms, ck_sms_agree, account_stop_yn, member_type, create_dt, update_dt)
      VALUES (${data.email}, ${data.nickname}, ${phoneClean}, ${data.hubMemberId}, 'hub', 'ROLE_USER', true, true, 'N', 'student', NOW(), NOW())
      RETURNING *
    `;
    return results[0];
  }
}
