import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SusiKyokwaService } from '../services/susi-kyokwa.service';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('수시 교과전형')
@Controller('ms/kyokwa')
export class SusiKyokwaController {
  constructor(private readonly susiKyokwaService: SusiKyokwaService) {}

  @Get('step-1')
  @Public()
  @ApiOperation({ summary: '[수시 교과] Step 1 - 차트용 데이터 조회' })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2025 })
  @ApiQuery({ name: 'basic_type', required: true, enum: ['일반', '특별'] })
  async getStep1(
    @Query('year') year: number,
    @Query('basic_type') basicType: '일반' | '특별',
  ) {
    return this.susiKyokwaService.getStep1(year, basicType);
  }

  @Get('step-2')
  @ApiOperation({ summary: '[수시 교과] Step 2 - 최저등급 데이터 조회' })
  @ApiQuery({ name: 'ids', required: true, type: String, description: '콤마로 구분된 ID 목록' })
  async getStep2(@Query('ids') idsString: string) {
    const ids = idsString.split(',').map((id) => parseInt(id.trim(), 10));
    return this.susiKyokwaService.getStep2(ids);
  }

  @Get('step-3')
  @ApiOperation({ summary: '[수시 교과] Step 3 - 비교과 데이터 조회' })
  @ApiQuery({ name: 'ids', required: true, type: String, description: '콤마로 구분된 ID 목록' })
  async getStep3(@Query('ids') idsString: string) {
    const ids = idsString.split(',').map((id) => parseInt(id.trim(), 10));
    return this.susiKyokwaService.getStep3(ids);
  }

  @Get('step-4')
  @ApiOperation({ summary: '[수시 교과] Step 4 - 모집단위 데이터 조회' })
  @ApiQuery({ name: 'ids', required: true, type: String, description: '콤마로 구분된 ID 목록' })
  async getStep4(@Query('ids') idsString: string) {
    const ids = idsString.split(',').map((id) => parseInt(id.trim(), 10));
    return this.susiKyokwaService.getStep4(ids);
  }

  @Get('step-5')
  @ApiOperation({ summary: '[수시 교과] Step 5 - 면접 데이터 조회' })
  @ApiQuery({ name: 'ids', required: true, type: String, description: '콤마로 구분된 ID 목록' })
  async getStep5(@Query('ids') idsString: string) {
    const ids = idsString.split(',').map((id) => parseInt(id.trim(), 10));
    return this.susiKyokwaService.getStep5(ids);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '[수시 교과] 상세 정보 조회' })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.susiKyokwaService.getDetail(id);
  }
}
