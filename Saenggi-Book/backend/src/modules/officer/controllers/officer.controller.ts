// @ts-nocheck
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { OfficerService } from '../services/officer.service';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateOfficerProfileResponseDto } from '../dtos/update-officer-profile.dto';

@Controller('officer')
export class OfficerController {
  constructor(private readonly officerService: OfficerService) {}

  @ApiOperation({
    summary: '사정관인지 체크',
  })
  @Get('check')
  async checkIsOfficer(@CurrentMemberId() memberId: string): Promise<boolean> {
    return this.officerService.checkOfficer(memberId);
  }

  @ApiOperation({
    summary: '내 사정관 프로필 조회',
  })
  @Get('profile')
  async getOfficerProfile(@CurrentMemberId() memberId: string): Promise<any> {
    return this.officerService.getOfficerProfile(memberId);
  }

  @ApiOperation({
    summary: '내 사정관 프로필 업데이트',
  })
  @Patch('profile')
  async updateOfficerProfile(
    @CurrentMemberId() memberId: string,
    @Body() body: UpdateOfficerProfileResponseDto,
  ): Promise<any> {
    return this.officerService.updateOfficerProfile(memberId, body);
  }
}
