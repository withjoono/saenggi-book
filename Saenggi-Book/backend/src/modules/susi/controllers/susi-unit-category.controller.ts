// @ts-nocheck
import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SusiUnitCategoryService } from '../services/susi-unit-category.service';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('[유저] 수시 모집단위 계열 분류')
@Controller('ms/unit-categories')
export class SusiUnitCategoryController {
  constructor(private readonly unitCategoryService: SusiUnitCategoryService) {}

  @Get('statistics')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] 통계 조회',
    description: '전체 모집단위 수, 대계열 수, 중계열 수, 소계열 수를 조회합니다.',
  })
  async getStatistics() {
    return await this.unitCategoryService.getStatistics();
  }

  @Get('major-fields')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] 대계열 목록 조회',
    description: '대계열 목록을 조회합니다 (자연계열, 인문계열 등).',
  })
  async getMajorFields() {
    return await this.unitCategoryService.getMajorFields();
  }

  @Get('major-fields/stats')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] 대계열별 통계',
    description: '대계열별 모집단위 수를 조회합니다.',
  })
  async getMajorFieldStats() {
    return await this.unitCategoryService.getMajorFieldStats();
  }

  @Get('mid-fields')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] 중계열 목록 조회',
    description: '중계열 목록을 조회합니다. 대계열코드로 필터링 가능합니다.',
  })
  @ApiQuery({ name: 'majorFieldCode', required: false, description: '대계열코드' })
  async getMidFields(@Query('majorFieldCode', ParseIntPipe) majorFieldCode?: number) {
    return await this.unitCategoryService.getMidFields(majorFieldCode);
  }

  @Get('mid-fields/stats')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] 중계열별 통계',
    description: '중계열별 모집단위 수를 조회합니다. 대계열코드로 필터링 가능합니다.',
  })
  @ApiQuery({ name: 'majorFieldCode', required: false, description: '대계열코드' })
  async getMidFieldStats(@Query('majorFieldCode', ParseIntPipe) majorFieldCode?: number) {
    return await this.unitCategoryService.getMidFieldStats(majorFieldCode);
  }

  @Get('minor-fields')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] 소계열 목록 조회',
    description: '소계열 목록을 조회합니다. 중계열코드로 필터링 가능합니다.',
  })
  @ApiQuery({ name: 'midFieldCode', required: false, description: '중계열코드' })
  async getMinorFields(@Query('midFieldCode', ParseIntPipe) midFieldCode?: number) {
    return await this.unitCategoryService.getMinorFields(midFieldCode);
  }

  @Get('minor-fields/stats')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] 소계열별 통계',
    description: '소계열별 모집단위 수를 조회합니다. 중계열코드로 필터링 가능합니다.',
  })
  @ApiQuery({ name: 'midFieldCode', required: false, description: '중계열코드' })
  async getMinorFieldStats(@Query('midFieldCode', ParseIntPipe) midFieldCode?: number) {
    return await this.unitCategoryService.getMinorFieldStats(midFieldCode);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '[계열 분류] ID로 계열 정보 조회',
    description: '모집단위 ID로 계열 분류 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '모집단위 ID (예: 26-U001211)', example: '26-U001211' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '계열 정보를 찾을 수 없음' })
  async getCategoryById(@Param('id') id: string): Promise<any> {
    return await this.unitCategoryService.getCategoryById(id);
  }
}
