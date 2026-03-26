import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { SusiKyokwa2027Service } from '../services/susi-kyokwa-2027.service';

/**
 * 2027학년도 수시 교과전형 API
 */
@ApiTags('susi-kyokwa-2027')
@Controller('ms/kyokwa/2027')
export class SusiKyokwa2027Controller {
  constructor(private readonly service: SusiKyokwa2027Service) {}

  // ========== 입시결과 (Cut) ==========

  @Get('cut')
  @Public()
  @ApiOperation({ summary: '교과전형 입시결과 목록' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'universityCode', required: false, type: String })
  async getCutList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('universityCode') universityCode?: string,
  ) {
    return this.service.getCutList({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      universityCode,
    });
  }

  @Get('cut/:idaId')
  @Public()
  @ApiOperation({ summary: 'ida_id로 입시결과 조회' })
  @ApiParam({ name: 'idaId', description: 'IDA 고유 ID (예: 26-U001211)' })
  async getCutByIdaId(@Param('idaId') idaId: string) {
    return this.service.getCutByIdaId(idaId);
  }

  // ========== 세부내역 (Recruitment) ==========

  @Get('recruitment')
  @Public()
  @ApiOperation({ summary: '교과전형 세부내역 목록' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'universityCode', required: false, type: String })
  @ApiQuery({ name: 'admissionType', required: false, type: String })
  @ApiQuery({ name: 'admissionCategory', required: false, type: String, description: '일반/특별' })
  @ApiQuery({ name: 'region', required: false, type: String })
  async getRecruitmentList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('universityCode') universityCode?: string,
    @Query('admissionType') admissionType?: string,
    @Query('admissionCategory') admissionCategory?: string,
    @Query('region') region?: string,
  ) {
    return this.service.getRecruitmentList({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      universityCode,
      admissionType,
      admissionCategory,
      region,
    });
  }

  @Get('recruitment/:idaId')
  @Public()
  @ApiOperation({ summary: 'ida_id로 세부내역 조회' })
  @ApiParam({ name: 'idaId', description: 'IDA 고유 ID (예: 26-U001211)' })
  async getRecruitmentByIdaId(@Param('idaId') idaId: string) {
    return this.service.getRecruitmentByIdaId(idaId);
  }

  // ========== 특별전형 (Special) ==========

  @Get('special')
  @Public()
  @ApiOperation({ summary: '교과전형 특별전형 목록' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'admissionCategory', required: false, type: String, description: '일반/특별' })
  async getSpecialList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('admissionCategory') admissionCategory?: string,
  ) {
    return this.service.getSpecialList({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      admissionCategory,
    });
  }

  @Get('special/:idaId')
  @Public()
  @ApiOperation({ summary: 'ida_id로 특별전형 정보 조회' })
  @ApiParam({ name: 'idaId', description: 'IDA 고유 ID (예: 26-U001211)' })
  async getSpecialByIdaId(@Param('idaId') idaId: string) {
    return this.service.getSpecialByIdaId(idaId);
  }

  // ========== 통합 조회 ==========

  @Get('full/:idaId')
  @Public()
  @ApiOperation({ summary: 'ida_id로 교과전형 전체 정보 조회 (입시결과 + 세부내역 + 특별전형)' })
  @ApiParam({ name: 'idaId', description: 'IDA 고유 ID (예: 26-U001211)' })
  async getFullInfoByIdaId(@Param('idaId') idaId: string) {
    return this.service.getFullInfoByIdaId(idaId);
  }

  // ========== 메타 정보 ==========

  @Get('universities')
  @Public()
  @ApiOperation({ summary: '대학 목록 조회' })
  async getUniversities() {
    return this.service.getUniversities();
  }

  @Get('admission-types')
  @Public()
  @ApiOperation({ summary: '전형 유형 목록 조회' })
  async getAdmissionTypes() {
    return this.service.getAdmissionTypes();
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: '검색 (대학명, 모집단위명, 전형명)' })
  @ApiQuery({ name: 'q', required: true, type: String, description: '검색어' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.search(query, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: '통계 정보' })
  async getStats() {
    return this.service.getStats();
  }
}
