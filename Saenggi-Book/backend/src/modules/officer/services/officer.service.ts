import { PrismaService } from '../../../database/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SmsService } from '../../sms/sms.service';
import { UpdateOfficerProfileResponseDto } from '../dtos/update-officer-profile.dto';

@Injectable()
export class OfficerService {
  private readonly logger = new Logger(OfficerService.name);
  constructor(
    private readonly prisma: PrismaService,
    private smsService: SmsService,
  ) { }

  async checkOfficer(memberId: string): Promise<boolean> {
    try {
      const officers = await this.prisma.$queryRaw<any[]>`
        SELECT member_id FROM officer_list_tb WHERE member_id = ${memberId} LIMIT 1
      `;
      return officers.length > 0;
    } catch (err) {
      this.logger.error('checkOfficer failed:', err);
      return false;
    }
  }

  async getOfficerProfile(memberId: string): Promise<any> {
    const officers = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM officer_list_tb WHERE member_id = ${memberId} LIMIT 1
    `;
    if (!officers.length) {
      throw new BadRequestException('사정관이 아닙니다.');
    }
    return officers[0];
  }

  async updateOfficerProfile(
    memberId: string,
    data: UpdateOfficerProfileResponseDto,
  ): Promise<any> {
    const officers = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM officer_list_tb WHERE member_id = ${memberId} LIMIT 1
    `;
    if (!officers.length) {
      throw new BadRequestException('사정관이 아닙니다.');
    }

    const officer = officers[0];
    const newName = data.name || officer.officer_name;
    const newUniversity = data.university || officer.university;
    const newEducation = data.education || officer.education;

    await this.prisma.$executeRaw`
      UPDATE officer_list_tb
      SET officer_name = ${newName}, university = ${newUniversity}, education = ${newEducation}
      WHERE member_id = ${memberId}
    `;

    return { ...officer, officer_name: newName, university: newUniversity, education: newEducation };
  }
}
