import { Controller, Post, Get, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MemberInterestsService } from '../services/member-interests.service';
import { AddInterestDto } from '../dtos/add-interest.dto';
import { RemoveInterestDto } from '../dtos/remove-interest.dto';
import { InterestSusiSubjectResponse } from '../dtos/interest-susi-subject-response';
import { MemberPermissionGuard } from '../guards/user-permission.guard';
import { InterestSusiComprehensiveResponse } from '../dtos/interest-susi-comprehensive-response';

@ApiTags('members')
@Controller('members/:memberId/interests')
export class MemberInterestsController {
  constructor(private readonly memberInterestsService: MemberInterestsService) {}

  @ApiOperation({
    summary: '수시 관심 대학 추가',
    description:
      '관심 대학 목록에 대학을 추가합니다. 교과전형(susi_subject_tb) 또는 학종전형(susi_comprehensive_tb) 테이블에 저장됩니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 201,
    description: '관심 대학 추가 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 테이블명 또는 ID)',
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
  async addInterest(@Body() body: AddInterestDto, @Param('memberId') memberId: number) {
    await this.memberInterestsService.addInterest(
      memberId,
      body.targetTable,
      body.targetIds,
      body.evaluation_id,
    );
    return null;
  }

  @ApiOperation({
    summary: '수시 관심 대학 삭제',
    description: '관심 대학 목록에서 대학을 삭제합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '관심 대학 삭제 성공',
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
  async removeInterest(@Body() body: RemoveInterestDto, @Param('memberId') memberId: number) {
    await this.memberInterestsService.removeInterest(memberId, body.targetTable, body.targetIds);
    return null;
  }

  @ApiOperation({
    summary: '수시 교과전형 관심 대학 조회',
    description: '사용자가 저장한 수시 교과전형 관심 대학 목록을 조회합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '교과전형 관심 대학 목록 조회 성공',
    type: [InterestSusiSubjectResponse],
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
  @Get('/susi-subject')
  @UseGuards(MemberPermissionGuard)
  async getInterestsSusiSubject(
    @Param('memberId') memberId: number,
  ): Promise<InterestSusiSubjectResponse[]> {
    return this.memberInterestsService.getSusiSubject(memberId);
  }

  @ApiOperation({
    summary: '수시 학종전형 관심 대학 조회',
    description: '사용자가 저장한 수시 학생부종합전형 관심 대학 목록을 조회합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '학종전형 관심 대학 목록 조회 성공',
    type: [InterestSusiComprehensiveResponse],
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
  @Get('/susi-comprehensive')
  @UseGuards(MemberPermissionGuard)
  async getInterestsSusiComprehensive(
    @Param('memberId') memberId: number,
  ): Promise<InterestSusiComprehensiveResponse[]> {
    return this.memberInterestsService.getSusiComprehensive(memberId);
  }

  @ApiOperation({
    summary: '전형별 관심 모집단위 조회',
    description: '전형 타입에 따라 사용자의 관심 모집단위 목록을 조회합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiQuery({
    name: 'admissionType',
    description: '전형 타입',
    enum: ['susi_subject_tb', 'susi_comprehensive_tb', 'early_subject', 'early_comprehensive'],
    example: 'susi_subject_tb',
  })
  @ApiResponse({
    status: 200,
    description: '관심 모집단위 목록 조회 성공',
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
    admissionType:
      | 'susi_subject_tb'
      | 'susi_comprehensive_tb'
      | 'early_subject'
      | 'early_comprehensive',
  ) {
    return this.memberInterestsService.getIntersetRecruitmentUnits(memberId, admissionType);
  }
}
