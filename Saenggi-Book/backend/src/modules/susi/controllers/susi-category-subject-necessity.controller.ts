import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SusiCategorySubjectNecessityService } from '../services/susi-category-subject-necessity.service';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('[유저] 계열별 필수/권장 과목')
@Controller('ms/category-subject-necessity')
export class SusiCategorySubjectNecessityController {
  constructor(
    private readonly service: SusiCategorySubjectNecessityService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '[계열적합성] 전체 계열별 필수/권장 과목 데이터 조회',
    description:
      '모든 계열의 필수과목, 장려과목, 주요교과 데이터를 조회합니다. 프론트엔드 COMPATIBILITY_DATA 형식과 호환됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '계열적합성 데이터 목록',
  })
  async getAllCompatibilityData() {
    return await this.service.getAllCompatibilityData();
  }

  @Get('statistics')
  @Public()
  @ApiOperation({
    summary: '[계열적합성] 통계 조회',
    description:
      '전체 레코드 수, 계열 수, 과목 수, 필수/권장 분포, 과목 유형별 분포를 조회합니다.',
  })
  async getStatistics() {
    return await this.service.getStatistics();
  }

  @Get('raw')
  @Public()
  @ApiOperation({
    summary: '[계열적합성] 원본 데이터 조회',
    description: '매핑 없이 원본 데이터베이스 데이터를 조회합니다.',
  })
  async getRawData() {
    return await this.service.getRawData();
  }

  @Get('by-series')
  @Public()
  @ApiOperation({
    summary: '[계열적합성] 계열명으로 조회',
    description:
      '대계열, 중계열, 소계열 이름으로 해당 계열의 필수/권장 과목을 조회합니다.',
  })
  @ApiQuery({
    name: 'majorField',
    required: true,
    description: '대계열 이름 (예: 공학계열)',
  })
  @ApiQuery({
    name: 'midField',
    required: true,
    description: '중계열 이름 (예: 건축)',
  })
  @ApiQuery({
    name: 'minorField',
    required: true,
    description: '소계열 이름 (예: 건축학)',
  })
  async getCompatibilityBySeries(
    @Query('majorField') majorField: string,
    @Query('midField') midField: string,
    @Query('minorField') minorField: string,
  ) {
    return await this.service.getCompatibilityBySeries(
      majorField,
      midField,
      minorField,
    );
  }

  @Get('major-field/:majorFieldCode')
  @Public()
  @ApiOperation({
    summary: '[계열적합성] 대계열 코드로 조회',
    description: '대계열 코드로 해당 대계열의 모든 계열 데이터를 조회합니다.',
  })
  @ApiParam({
    name: 'majorFieldCode',
    description: '대계열 코드',
    example: 1,
  })
  async getCompatibilityByMajorField(
    @Param('majorFieldCode', ParseIntPipe) majorFieldCode: number,
  ) {
    return await this.service.getCompatibilityByMajorField(majorFieldCode);
  }

  @Get('mid-field/:midFieldCode')
  @Public()
  @ApiOperation({
    summary: '[계열적합성] 중계열 코드로 조회',
    description: '중계열 코드로 해당 중계열의 모든 계열 데이터를 조회합니다.',
  })
  @ApiParam({
    name: 'midFieldCode',
    description: '중계열 코드',
    example: 1,
  })
  async getCompatibilityByMidField(
    @Param('midFieldCode', ParseIntPipe) midFieldCode: number,
  ) {
    return await this.service.getCompatibilityByMidField(midFieldCode);
  }

  @Get(':categoryId')
  @Public()
  @ApiOperation({
    summary: '[계열적합성] 계열 ID로 조회',
    description: '계열 ID로 해당 계열의 필수/권장 과목 데이터를 조회합니다.',
  })
  @ApiParam({
    name: 'categoryId',
    description: '계열 ID (예: 111)',
    example: '111',
  })
  @ApiResponse({
    status: 200,
    description: '계열적합성 데이터',
  })
  @ApiResponse({
    status: 404,
    description: '해당 계열을 찾을 수 없음',
  })
  async getCompatibilityByCategoryId(@Param('categoryId') categoryId: string) {
    return await this.service.getCompatibilityByCategoryId(categoryId);
  }
}
