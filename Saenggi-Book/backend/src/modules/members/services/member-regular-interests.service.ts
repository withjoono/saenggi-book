// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberRegularInterestsService {
  constructor(  ) {}

  async addInterest(
    memberId: number,
    admissionType: '가' | '나' | '다',
    targetIds: number[],
  ): Promise<MemberRegularInterestsEntity[]> {
    const existingInterests = await this.memberRegularInterestsRepository.find({
      where: {
        member_id: memberId,
        admission_type: admissionType,
        target_id: In(targetIds),
      },
    });

    const existingTargetIds = existingInterests.map((interest) => Number(interest.target_id));
    const newTargetIds = targetIds.filter((id) => !existingTargetIds.includes(id));

    const newInterests = newTargetIds.map((targetId) =>
      this.memberRegularInterestsRepository.create({
        member_id: memberId,
        admission_type: admissionType,
        target_id: targetId,
      }),
    );

    return await this.memberRegularInterestsRepository.save(newInterests);
  }

  async removeInterest(
    memberId: number,
    admissionType: '가' | '나' | '다',
    targetIds: number[],
  ): Promise<void> {
    await this.memberRegularInterestsRepository.delete({
      member_id: memberId,
      admission_type: admissionType,
      target_id: In(targetIds),
    });
  }

  // 정시 관심목록 조회
  async getRegularInterests(
    memberId: number,
    admissionType: '가' | '나' | '다',
  ): Promise<RegularAdmissionEntity[]> {
    const interestItems = await this.memberRegularInterestsRepository.find({
      where: { member_id: memberId, admission_type: admissionType },
    });

    const data = await this.regularAdmissionRepository.find({
      where: { id: In(interestItems.map((n) => Number(n.target_id))) },
      relations: ['university'],
    });

    return data;
  }
}
