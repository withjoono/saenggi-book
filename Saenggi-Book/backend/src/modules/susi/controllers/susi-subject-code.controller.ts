import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Body,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SusiSubjectCodeService } from '../services/susi-subject-code.service';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('[유저] 교과/과목 코드')
@Controller('ms/subject-codes')
export class SusiSubjectCodeController {
  constructor(private readonly service: SusiSubjectCodeService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '[교과코드] 전체 교과/과목 코드 조회',
    description:
      '2015 개정 교육과정의 전체 교과 및 과목 코드 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '교과/과목 코드 목록',
  })
  async findAll() {
    return await this.service.findAll();
  }

  @Get('statistics')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 통계 조회',
    description:
      '전체 과목 수, 주요교과별 과목 수, 과목 종류별 분포 등 통계를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '교과/과목 코드 통계',
  })
  async getStatistics() {
    return await this.service.getStatistics();
  }

  @Get('main-subjects')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 주요교과 목록 조회',
    description:
      '주요교과 코드 목록과 각 교과별 과목 수를 조회합니다. (예: 국어, 수학, 영어 등)',
  })
  @ApiResponse({
    status: 200,
    description: '주요교과 목록',
  })
  async getMainSubjects() {
    return await this.service.getMainSubjects();
  }

  @Get('course-types')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 과목 종류 목록 조회',
    description:
      '과목 종류 코드 목록과 각 종류별 과목 수를 조회합니다. (공통과목, 일반선택, 진로선택 등)',
  })
  @ApiResponse({
    status: 200,
    description: '과목 종류 목록',
  })
  async getCourseTypes() {
    return await this.service.getCourseTypes();
  }

  @Get('search')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 과목명 검색',
    description: '과목명에 포함된 키워드로 과목을 검색합니다.',
  })
  @ApiQuery({
    name: 'keyword',
    description: '검색할 과목명 키워드',
    example: '미적분',
  })
  @ApiResponse({
    status: 200,
    description: '검색된 과목 목록',
  })
  async searchBySubjectName(@Query('keyword') keyword: string) {
    return await this.service.searchBySubjectName(keyword);
  }

  @Get('by-main-subject/:mainSubjectCode')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 주요교과 코드로 과목 조회',
    description: '특정 주요교과에 속한 모든 과목을 조회합니다.',
  })
  @ApiParam({
    name: 'mainSubjectCode',
    description: '주요교과 코드 (예: HH01, HH02)',
    example: 'HH01',
  })
  @ApiResponse({
    status: 200,
    description: '해당 주요교과의 과목 목록',
  })
  async findByMainSubjectCode(
    @Param('mainSubjectCode') mainSubjectCode: string,
  ) {
    return await this.service.findByMainSubjectCode(mainSubjectCode);
  }

  @Get('by-course-type/:courseTypeCode')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 과목 종류 코드로 과목 조회',
    description:
      '특정 종류(공통과목, 일반선택 등)에 속한 모든 과목을 조회합니다.',
  })
  @ApiParam({
    name: 'courseTypeCode',
    description:
      '과목 종류 코드 (1: 공통과목, 2: 일반선택, 3: 진로선택, 4: 전문교과Ⅰ, 5: 전문교과Ⅱ)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '해당 종류의 과목 목록',
  })
  async findByCourseTypeCode(
    @Param('courseTypeCode', ParseIntPipe) courseTypeCode: number,
  ) {
    return await this.service.findByCourseTypeCode(courseTypeCode);
  }

  @Get('by-main-and-type')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 주요교과 + 종류로 과목 조회',
    description: '주요교과와 과목 종류를 동시에 지정하여 과목을 조회합니다.',
  })
  @ApiQuery({
    name: 'mainSubjectCode',
    description: '주요교과 코드',
    example: 'HH02',
  })
  @ApiQuery({
    name: 'courseTypeCode',
    description: '과목 종류 코드',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: '해당 조건의 과목 목록',
  })
  async findByMainSubjectAndCourseType(
    @Query('mainSubjectCode') mainSubjectCode: string,
    @Query('courseTypeCode', ParseIntPipe) courseTypeCode: number,
  ) {
    return await this.service.findByMainSubjectAndCourseType(
      mainSubjectCode,
      courseTypeCode,
    );
  }

  @Get('code/:code')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 과목 코드로 조회',
    description:
      '과목 코드(ID)로 과목 정보를 조회합니다. 프론트엔드 호환용 API입니다.',
  })
  @ApiParam({
    name: 'code',
    description: '과목 코드 (예: HH0111, HH0221)',
    example: 'HH0111',
  })
  @ApiResponse({
    status: 200,
    description: '과목 정보',
  })
  async findByCode(@Param('code') code: string) {
    return await this.service.findByCode(code);
  }

  @Post('batch-codes')
  @Public()
  @ApiOperation({
    summary: '[교과코드] 여러 과목 코드 일괄 조회',
    description: '여러 과목 코드를 한 번에 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '과목 코드별 정보 맵',
  })
  async findByCodes(@Body() codes: string[]) {
    return await this.service.findByCodes(codes);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '[교과코드] ID로 과목 조회',
    description: '과목 ID로 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '과목 ID (예: HH0111)',
    example: 'HH0111',
  })
  @ApiResponse({
    status: 200,
    description: '과목 상세 정보',
  })
  @ApiResponse({
    status: 404,
    description: '해당 과목을 찾을 수 없음',
  })
  async findById(@Param('id') id: string) {
    return await this.service.findById(id);
  }
}
