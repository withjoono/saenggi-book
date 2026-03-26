// @ts-nocheck
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SusiPassRecordService } from '../services/susi-pass-record-service';

@ApiTags('[유저] 수시 합불 데이터')
@Controller('ms')
export class SusiPassRecordController {
  constructor(private readonly passRecordService: SusiPassRecordService) {}

  @Get('pass-record/:recruitmentUnitId')
  @ApiOperation({
    summary: '[수시] 합불 사례 조회',
  })
  async getSusiPassRecordPassRecord(
    @Param('recruitmentUnitId', ParseIntPipe) recruitmentUnitId: number,
  ): Promise<any[]> {
    const data = await this.passRecordService.getPassRecordsByRecruitmentUnitId(recruitmentUnitId);
    return data;
  }
}
