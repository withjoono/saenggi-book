// @ts-nocheck
import { Injectable } from '@nestjs/common';

@Injectable()
export class SusiPassRecordService {
  constructor(    private readonly passRecordRepository: Repository<RecruitmentUnitPassFailRecordsEntity>,
  ) {}

  getPassRecordsByRecruitmentUnitId(recruitmentUnitId: number) {
    const items = this.passRecordRepository.find({
      where: { recruitmentUnit: { id: recruitmentUnitId } },
    });

    return items;
  }
}
