import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  CreateMemberRecruitmentUnitCombinationDto,
  UpdateMemberRecruitmentUnitCombinationDto,
} from '../dtos/combination.dto';

@Injectable()
export class MemberRecruitmentUnitCombinationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    memberId: string,
    createDto: CreateMemberRecruitmentUnitCombinationDto,
  ) {
    // 모집단위 ID 유효성 검사
    const recruitmentUnits = await this.prisma.ss_recruitment_unit.findMany({
      where: { id: { in: createDto.recruitment_unit_ids } },
    });
    if (recruitmentUnits.length !== createDto.recruitment_unit_ids.length) {
      throw new BadRequestException('Some recruitment units were not found');
    }

    // 조합 생성 + 항목 연결
    const combination = await this.prisma.ss_user_application_combination.create({
      data: {
        name: createDto.name,
        member_id: memberId,
        ss_user_recruitment_unit_combination_items: {
          create: createDto.recruitment_unit_ids.map((ruId) => ({
            recruitment_unit_id: ruId,
          })),
        },
      },
      include: {
        ss_user_recruitment_unit_combination_items: {
          include: {
            ss_recruitment_unit: true,
          },
        },
      },
    });

    return combination;
  }

  async findAll(memberId: string) {
    const combinations = await this.prisma.ss_user_application_combination.findMany({
      where: { member_id: memberId },
      include: {
        ss_user_recruitment_unit_combination_items: {
          include: {
            ss_recruitment_unit: {
              include: {
                ss_admission: {
                  include: {
                    ss_university: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return combinations;
  }

  async findOne(id: number, memberId: string) {
    const combination = await this.prisma.ss_user_application_combination.findFirst({
      where: { id, member_id: memberId },
      include: {
        ss_user_recruitment_unit_combination_items: {
          include: {
            ss_recruitment_unit: true,
          },
        },
      },
    });

    if (!combination) {
      throw new NotFoundException(`Combination with ID "${id}" not found`);
    }

    return combination;
  }

  async update(
    memberId: string,
    id: number,
    updateDto: UpdateMemberRecruitmentUnitCombinationDto,
  ) {
    // 존재 확인
    await this.findOne(id, memberId);

    const updated = await this.prisma.ss_user_application_combination.update({
      where: { id },
      data: { name: updateDto.name },
      include: {
        ss_user_recruitment_unit_combination_items: {
          include: {
            ss_recruitment_unit: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(memberId: string, id: number): Promise<void> {
    // 존재 확인
    await this.findOne(id, memberId);

    await this.prisma.ss_user_application_combination.delete({
      where: { id },
    });
  }
}
