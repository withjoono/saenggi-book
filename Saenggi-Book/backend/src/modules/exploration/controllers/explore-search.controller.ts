import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { ExploreSearchService } from '../services/explore-search.service';

@Controller('explore/search')
export class ExploreSearchController {
  constructor(private readonly exploreSearchService: ExploreSearchService) {}

  @Get('university')
  @Public()
  @ApiOperation({
    summary: '[검색] 대학명으로 검색',
  })
  searchUniversity(@Query('name') name) {
    return this.exploreSearchService.findUniversityByName(name);
  }

  @Get('admission')
  @Public()
  @ApiOperation({
    summary: '[검색] 전형명으로 검색',
  })
  searchAdmission(@Query('name') name) {
    return this.exploreSearchService.findAdmissionByName(name);
  }

  @Get('recruitment-unit')
  @Public()
  @ApiOperation({
    summary: '[검색] 모집단위명으로 검색',
  })
  searchRecruitmentUnit(@Query('name') name) {
    return this.exploreSearchService.findRecruitUnitByName(name);
  }

  @Get('universities')
  @Public()
  @ApiOperation({
    summary: '[조회] 모든 대학 목록 조회',
  })
  getAllUniversities() {
    return this.exploreSearchService.findAllUniversities();
  }

  @Get('university/:id/admissions')
  @Public()
  @ApiOperation({
    summary: '[조회] 대학 ID로 해당 대학의 모든 전형 조회',
  })
  @ApiParam({ name: 'id', type: 'number', description: '대학 ID' })
  getAdmissionsByUniversityId(@Param('id') id: number) {
    return this.exploreSearchService.findAdmissionsByUniversityId(id);
  }

  @Get('admission/:id/recruitment-units')
  @Public()
  @ApiOperation({
    summary: '[조회] 전형 ID로 해당 전형의 모든 모집단위 조회',
  })
  @ApiParam({ name: 'id', type: 'number', description: '전형 ID' })
  getRecruitmentUnitsByAdmissionId(@Param('id') id: number) {
    return this.exploreSearchService.findRecruitmentUnitsByAdmissionId(id);
  }

  @Get('recruitment-units')
  @Public()
  @ApiOperation({
    summary: '[조회] 여러 모집단위 ID로 수시/정시 비교 조회',
  })
  async getRecruitmentUnitsByIds(@Query('ids') ids: string) {
    const recruitmentIds = ids.split(',').map((id) => parseInt(id, 10));
    return this.exploreSearchService.findRecruitmentUnitsByIds(recruitmentIds);
  }
}
