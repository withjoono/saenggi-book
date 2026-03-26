import { Controller, Post, Get, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MemberPermissionGuard } from '../guards/user-permission.guard';
import { AddRegularInterestDto, RemoveRegularInterestDto } from '../dtos/regular-interest.dto';
import { MemberRegularInterestsService } from '../services/member-regular-interests.service';

@ApiTags('members')
@Controller('members/:memberId/regular-interests')
export class MemberRegularInterestsController {
  constructor(private readonly memberRegularInterestsService: MemberRegularInterestsService) {}

  @ApiOperation({
    summary: '정시 관심 대학 추가',
    description: '정시 전형(가/나/다군)의 관심 대학 목록에 대학을 추가합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 201,
    description: '정시 관심 대학 추가 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 전형 타입 또는 ID)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Post()
  @UseGuards(MemberPermissionGuard)
  async addInterest(@Body() body: AddRegularInterestDto, @Param('memberId') memberId: number) {
    await this.memberRegularInterestsService.addInterest(
      memberId,
      body.admissionType,
      body.targetIds,
    );
    return null;
  }

  @ApiOperation({
    summary: '정시 관심 대학 삭제',
    description: '정시 전형의 관심 대학 목록에서 대학을 삭제합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '정시 관심 대학 삭제 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Delete()
  @UseGuards(MemberPermissionGuard)
  async removeInterest(
    @Body() body: RemoveRegularInterestDto,
    @Param('memberId') memberId: number,
  ) {
    await this.memberRegularInterestsService.removeInterest(
      memberId,
      body.admissionType,
      body.targetIds,
    );
    return null;
  }

  @ApiOperation({
    summary: '정시 관심 대학 목록 조회',
    description: '전형 타입(가/나/다군)에 따라 사용자의 정시 관심 대학 목록을 조회합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiQuery({
    name: 'admissionType',
    description: '정시 전형 타입 (가군/나군/다군)',
    enum: ['가', '나', '다'],
    example: '가',
  })
  @ApiResponse({
    status: 200,
    description: '정시 관심 대학 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Get('')
  @UseGuards(MemberPermissionGuard)
  async getIntersetRecruitmentUnits(
    @Param('memberId') memberId: number,
    @Query('admissionType')
    admissionType: '가' | '나' | '다',
  ) {
    return this.memberRegularInterestsService.getRegularInterests(memberId, admissionType);
  }
}
