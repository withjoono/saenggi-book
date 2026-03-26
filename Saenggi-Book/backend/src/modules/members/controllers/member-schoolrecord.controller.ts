import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MemberPermissionGuard } from '../guards/user-permission.guard';
import { SchoolRecordService } from 'src/modules/schoolrecord/schoolrecord.service';

@ApiTags('schoolrecord')
@Controller('members/:memberId/schoolrecord')
export class MemberSchoolRecordController {
  constructor(private readonly schoolRecordService: SchoolRecordService) { }

  @ApiOperation({
    summary: '학생부 출결 데이터 조회',
    description:
      '사용자의 학생부 출결 현황을 조회합니다. 학년별 출석, 지각, 조퇴, 결석 일수를 포함합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '출결 데이터 조회 성공',
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
  @Get('attendance')
  @UseGuards(MemberPermissionGuard)
  async getAttendanceDetails(@Param('memberId') memberId: string) {
    return await this.schoolRecordService.getAttendanceDetails(memberId);
  }

  @ApiOperation({
    summary: '학생부 선택과목 데이터 조회',
    description:
      '사용자가 이수한 선택과목 정보를 조회합니다. 진로선택, 일반선택 과목별 등급과 성취도를 포함합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '선택과목 데이터 조회 성공',
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
  @Get('select-subject')
  @UseGuards(MemberPermissionGuard)
  async getSelectSubjects(@Param('memberId') memberId: string) {
    return await this.schoolRecordService.getSelectSubjects(memberId);
  }

  @ApiOperation({
    summary: '학생부 기본과목 데이터 조회',
    description:
      '사용자의 학생부 기본과목(국어, 영어, 수학 등) 성적 정보를 조회합니다. 학기별 등급과 원점수를 포함합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '기본과목 데이터 조회 성공',
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
  @Get('subject')
  @UseGuards(MemberPermissionGuard)
  async getSubjectLearnings(@Param('memberId') memberId: string) {
    return await this.schoolRecordService.getSubjectLearnings(memberId);
  }

  @ApiOperation({
    summary: '학생부 봉사활동 데이터 조회',
    description: '사용자의 봉사활동 기록을 조회합니다. 활동 일자, 장소, 시간 등을 포함합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '봉사활동 데이터 조회 성공',
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
  @Get('volunteers')
  @UseGuards(MemberPermissionGuard)
  async getVolunteers(@Param('memberId') memberId: string) {
    return await this.schoolRecordService.getVolunteers(memberId);
  }

  @ApiOperation({
    summary: '학생부 체육/예술 활동 데이터 조회',
    description:
      '사용자의 체육 및 예술 교과 활동 기록을 조회합니다. 특기사항 및 성취 수준을 포함합니다.',
  })
  @ApiParam({ name: 'memberId', description: '회원 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '체육/예술 활동 데이터 조회 성공',
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
  @Get('sport-art')
  @UseGuards(MemberPermissionGuard)
  async getSportArts(@Param('memberId') memberId: string) {
    return await this.schoolRecordService.getSportArts(memberId);
  }
}
