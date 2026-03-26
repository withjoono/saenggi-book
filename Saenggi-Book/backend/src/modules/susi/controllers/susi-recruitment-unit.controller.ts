import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SusiRecruitmentUnitService } from '../services/susi-recruitment-unit.service';
import { RecruitmentUnitQueryDto } from '../dtos/recruitment-unit-query.dto';
import {
  RecruitmentUnitResponseDto,
  RecruitmentUnitListResponseDto,
  AdmissionTypeDto,
  UniversityDto,
  StatisticsResponseDto,
} from '../dtos/recruitment-unit-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('[유저] 수시 모집단위 통합')
@Controller('ms/recruitment-units')
export class SusiRecruitmentUnitController {
  constructor(private readonly recruitmentUnitService: SusiRecruitmentUnitService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 목록 조회 (페이징, 필터링)',
    description:
      '수시 모집단위 목록을 페이징과 필터링으로 조회합니다. 대학명, 전형타입, 지역 등으로 검색 가능합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: RecruitmentUnitListResponseDto })
  async getRecruitmentUnits(
    @Query() queryDto: RecruitmentUnitQueryDto,
  ): Promise<RecruitmentUnitListResponseDto> {
    return await this.recruitmentUnitService.getRecruitmentUnits(queryDto);
  }

  @Get('statistics')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 통계 조회',
    description: '전체 모집단위 수, 대학 수, 전형타입 수, 지역 수 등의 통계를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: StatisticsResponseDto })
  async getStatistics(): Promise<StatisticsResponseDto> {
    return await this.recruitmentUnitService.getStatistics();
  }

  @Get('admission-types')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 전형타입 목록 조회',
    description: '전형타입 목록을 조회합니다 (종합, 교과, 논술, 실기, 특기자).',
  })
  @ApiResponse({ status: 200, description: '성공', type: [AdmissionTypeDto] })
  async getAdmissionTypes(): Promise<AdmissionTypeDto[]> {
    return await this.recruitmentUnitService.getAdmissionTypes();
  }

  @Get('regions')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 지역 목록 조회',
    description: '지역 목록을 조회합니다 (중복 제거).',
  })
  @ApiResponse({ status: 200, description: '성공', type: [String] })
  async getRegions(): Promise<string[]> {
    return await this.recruitmentUnitService.getRegions();
  }

  @Get('universities')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 대학 목록 조회',
    description: '대학 목록을 조회합니다 (중복 제거).',
  })
  @ApiResponse({ status: 200, description: '성공', type: [UniversityDto] })
  async getUniversities(): Promise<UniversityDto[]> {
    return await this.recruitmentUnitService.getUniversities();
  }

  @Get('by-university/:universityCode')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 대학코드로 조회',
    description: '특정 대학의 모든 모집단위를 조회합니다.',
  })
  @ApiParam({ name: 'universityCode', description: '대학코드 (예: U001)', example: 'U001' })
  @ApiResponse({ status: 200, description: '성공', type: [RecruitmentUnitResponseDto] })
  async getRecruitmentUnitsByUniversity(
    @Param('universityCode') universityCode: string,
  ): Promise<RecruitmentUnitResponseDto[]> {
    return await this.recruitmentUnitService.getRecruitmentUnitsByUniversityCode(universityCode);
  }

  @Get('by-admission-type/:admissionType')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 전형타입으로 조회',
    description: '특정 전형타입의 모든 모집단위를 조회합니다.',
  })
  @ApiParam({
    name: 'admissionType',
    description: '전형타입',
    example: '종합',
    enum: ['종합', '교과', '논술', '실기', '특기자'],
  })
  @ApiResponse({ status: 200, description: '성공', type: [RecruitmentUnitResponseDto] })
  async getRecruitmentUnitsByAdmissionType(
    @Param('admissionType') admissionType: string,
  ): Promise<RecruitmentUnitResponseDto[]> {
    return await this.recruitmentUnitService.getRecruitmentUnitsByAdmissionType(admissionType);
  }

  @Get('by-region/:region')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] 지역별 조회',
    description: '특정 지역의 모든 모집단위를 조회합니다.',
  })
  @ApiParam({ name: 'region', description: '지역(광역)', example: '서울' })
  @ApiResponse({ status: 200, description: '성공', type: [RecruitmentUnitResponseDto] })
  async getRecruitmentUnitsByRegion(
    @Param('region') region: string,
  ): Promise<RecruitmentUnitResponseDto[]> {
    return await this.recruitmentUnitService.getRecruitmentUnitsByRegion(region);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '[수시 모집단위] ID로 상세 조회',
    description: '특정 ID의 모집단위 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '모집단위 ID (예: 26-U001211)', example: '26-U001211' })
  @ApiResponse({ status: 200, description: '성공', type: RecruitmentUnitResponseDto })
  @ApiResponse({ status: 404, description: '모집단위를 찾을 수 없음' })
  async getRecruitmentUnitById(@Param('id') id: string): Promise<RecruitmentUnitResponseDto> {
    return await this.recruitmentUnitService.getRecruitmentUnitById(id);
  }
}
