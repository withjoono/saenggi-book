// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { MemberPermissionGuard } from '../guards/user-permission.guard';
import { MemberRegularCombinationService } from '../services/member-regular-combination.service';
import {
  CreateMemberRegularCombinationDto,
  UpdateMemberRegularCombinationDto,
} from '../dtos/regular-combination.dto';

@ApiTags('members')
@Controller('members/:memberId/regular-combinations')
export class MemberRegularCombinationController {
  constructor(private readonly memberCombinationService: MemberRegularCombinationService) {}

  @ApiOperation({
    summary: '정시 모집단위 조합 생성',
    description:
      '정시 전형에서 사용자가 지원할 모집단위 조합을 생성합니다. 가/나/다군 조합을 설정할 수 있습니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 201,
    description: '정시 조합 생성 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 모집단위 ID)',
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
  async create(
    @CurrentMemberId() memberId: string,
    @Body()
    createMemberCombinationDto: CreateMemberRegularCombinationDto,
  ): Promise<any> {
    return this.memberCombinationService.create(memberId, createMemberCombinationDto);
  }

  @ApiOperation({
    summary: '정시 모집단위 조합 목록 조회',
    description: '사용자가 생성한 모든 정시 모집단위 조합 목록을 조회합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '정시 조합 목록 조회 성공',
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
  @Get()
  @UseGuards(MemberPermissionGuard)
  async findAll(@CurrentMemberId() memberId: string): Promise<any[]> {
    return this.memberCombinationService.findAll(memberId);
  }

  @ApiOperation({
    summary: '특정 정시 모집단위 조합 조회',
    description: '특정 ID의 정시 모집단위 조합 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiParam({ name: 'id', description: '조합 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '정시 조합 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '조합을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get(':id')
  @UseGuards(MemberPermissionGuard)
  async findOne(
    @CurrentMemberId() memberId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    return this.memberCombinationService.findOne(id, memberId);
  }

  @ApiOperation({
    summary: '정시 모집단위 조합 수정',
    description: '기존 정시 모집단위 조합의 정보를 수정합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiParam({ name: 'id', description: '조합 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '정시 조합 수정 성공',
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
  @ApiResponse({
    status: 404,
    description: '조합을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @UseGuards(MemberPermissionGuard)
  async update(
    @CurrentMemberId() memberId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateMemberCombinationDto: UpdateMemberRegularCombinationDto,
  ): Promise<any> {
    return this.memberCombinationService.update(memberId, id, updateMemberCombinationDto);
  }

  @ApiOperation({
    summary: '정시 모집단위 조합 삭제',
    description: '특정 정시 모집단위 조합을 삭제합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiParam({ name: 'id', description: '조합 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '정시 조합 삭제 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '조합을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @UseGuards(MemberPermissionGuard)
  async remove(
    @CurrentMemberId() memberId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.memberCombinationService.remove(memberId, id);
  }
}
