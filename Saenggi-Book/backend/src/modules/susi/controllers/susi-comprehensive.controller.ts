// @ts-nocheck
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SusiComprehensiveService } from '../services/susi-comprehensive.service';
import { SusiComprehensiveStep1ResponseDto } from '../dtos/susi-comprehensive-step-1.dto';
import {
  SusiComprehensiveStep2QueryDto,
  SusiComprehensiveStep2ResponseDto,
} from '../dtos/susi-comprehensive-step-2.dto';
import {
  SusiComprehensiveStep3QueryDto,
  SusiComprehensiveStep3ResponseDto,
} from '../dtos/susi-comprehensive-step-3.dto';
import {
  SusiComprehensiveStep4QueryDto,
  SusiComprehensiveStep4ResponseDto,
} from '../dtos/susi-comprehensive-step-4.dto';

@ApiTags('ms')
@Controller('ms/comprehensive')
export class SusiComprehensiveController {
  constructor(private readonly susiComprehensiveService: SusiComprehensiveService) {}

  @ApiOperation({
    summary: '[수시 학종] Step 1 대학 조회',
    description:
      '기본유형, 대계열, 중계열, 소계열 조건으로 수시 학생부종합전형 대학 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'year',
    description: '입시 연도',
    example: 2024,
    required: true,
  })
  @ApiQuery({
    name: 'basic_type',
    description: '기본 유형',
    required: false,
  })
  @ApiQuery({
    name: 'large_department',
    description: '대계열',
    required: false,
  })
  @ApiQuery({
    name: 'medium_department',
    description: '중계열',
    required: false,
  })
  @ApiQuery({
    name: 'small_department',
    description: '소계열',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '대학 목록 조회 성공',
    type: [SusiComprehensiveStep1ResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth('access-token')
  @Get('step-1')
  async getSusiComprehensiveStep_1(
    @Query('year', ParseIntPipe) year,
    @Query('basic_type') basic_type,
    @Query('large_department') large_department,
    @Query('medium_department') medium_department,
    @Query('small_department') small_department,
  ): Promise<SusiComprehensiveStep1ResponseDto[]> {
    const data = await this.susiComprehensiveService.getSusiComprehensiveStep_1({
      year,
      basic_type,
      large_department,
      medium_department,
      small_department,
    });
    return data;
  }

  @ApiOperation({
    summary: '[수시 학종] Step 2 비교과 정보 조회',
    description:
      '선택한 대학들의 비교과 평가 비율 정보를 조회합니다. 학생부종합전형의 서류 평가 비율 등을 확인할 수 있습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '비교과 정보 조회 성공',
    type: [SusiComprehensiveStep2ResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth('access-token')
  @Get('step-2')
  async getSusiComprehensiveStep_2(
    @Query() dto: SusiComprehensiveStep2QueryDto,
  ): Promise<SusiComprehensiveStep2ResponseDto[]> {
    const data = await this.susiComprehensiveService.getSusiComprehensiveStep_2({ ids: dto.ids });
    return data;
  }

  @ApiOperation({
    summary: '[수시 학종] Step 3 최저등급 조회',
    description:
      '선택한 대학들의 수능 최저등급 요구사항을 조회합니다. 국어, 수학, 영어, 탐구 과목별 등급컷 정보를 제공합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '최저등급 정보 조회 성공',
    type: [SusiComprehensiveStep3ResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth('access-token')
  @Get('step-3')
  async getSusiComprehensiveStep_3(
    @Query() dto: SusiComprehensiveStep3QueryDto,
  ): Promise<SusiComprehensiveStep3ResponseDto[]> {
    const data = await this.susiComprehensiveService.getSusiComprehensiveStep_3({ ids: dto.ids });
    return data;
  }

  @ApiOperation({
    summary: '[수시 학종] Step 4 전형일자 조회',
    description:
      '선택한 대학들의 전형 일정을 조회합니다. 서류 제출 마감일, 면접 일정 등의 정보를 제공합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전형일자 조회 성공',
    type: [SusiComprehensiveStep4ResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth('access-token')
  @Get('step-4')
  async getSusiComprehensiveStep_4(
    @Query() dto: SusiComprehensiveStep4QueryDto,
  ): Promise<SusiComprehensiveStep4ResponseDto[]> {
    const data = await this.susiComprehensiveService.getSusiComprehensiveStep_4({ ids: dto.ids });
    return data;
  }

  @ApiOperation({
    summary: '[수시 학종] 상세 정보 조회',
    description:
      '특정 학생부종합전형의 상세 정보를 조회합니다. 전형 방법, 모집 인원, 평가 요소 등 상세 정보를 제공합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '학생부종합전형 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '상세 정보 조회 성공',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '해당 전형을 찾을 수 없음' })
  @ApiBearerAuth('access-token')
  @Get('detail/:id')
  async getSusiSubjectDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    const data = await this.susiComprehensiveService.getSusiComprehensiveDetail(id);
    return data;
  }

  @ApiOperation({
    summary: '[수시 학종] 합불 사례 조회',
    description:
      '특정 학생부종합전형의 과거 합격/불합격 사례를 조회합니다. 실제 합격자의 내신 등급, 활동 내역 등을 참고할 수 있습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '학생부종합전형 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '합불 사례 조회 성공',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '해당 전형을 찾을 수 없음' })
  @ApiBearerAuth('access-token')
  @Get('pass-record/:id')
  async getSusiSubjectPassRecord(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any[]> {
    const data = await this.susiComprehensiveService.getSusiSubjectPassRecords(id);
    return data;
  }
}
