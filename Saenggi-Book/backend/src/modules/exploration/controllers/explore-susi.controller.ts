import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ExploreSusiKyokwaService } from '../services/explore-susi-kyokwa.service';
import { ApiOperation } from '@nestjs/swagger';
import { ExploreIdsQueryDto } from '../dtos/explore.dto';
import { ExploreSusiJonghapService } from '../services/explore-susi-jonghap.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('explore/ms')
export class ExploreSusiController {
  constructor(
    private readonly exploreSusiKyokwaService: ExploreSusiKyokwaService,
    private readonly exploreSusiJonghapService: ExploreSusiJonghapService,
  ) { }

  @Get('kyokwa/step-1')
  @Public()
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-1',
  })
  exploreSubjectStep1(
    @Query('basic_type') basicType,
    @Query('year') year,
    @Query('category') category?: string,
    @Query('subtype_ids') subtypeIds?: string,
  ) {
    const subtypeIdArray = subtypeIds
      ? subtypeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];
    return this.exploreSusiKyokwaService.getStep1(year, basicType, category, subtypeIdArray);
  }

  @Get('kyokwa/step-2')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-2',
  })
  exploreKyokwaStep2(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreSusiKyokwaService.getStep2(dto.ids);
  }

  @Get('kyokwa/step-3')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-3',
  })
  exploreKyokwaStep3(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreSusiKyokwaService.getStep3(dto.ids);
  }

  @Get('kyokwa/step-4')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-4',
  })
  exploreKyokwaStep4(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreSusiKyokwaService.getStep4(dto.ids);
  }

  @Get('kyokwa/step-5')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-5',
  })
  exploreKyokwaStep5(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreSusiKyokwaService.getStep5(dto.ids);
  }

  @Get('kyokwa/detail/:recruitmentUnitId')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 상세조회',
  })
  exploreKyokwaDetail(@Param('recruitmentUnitId', ParseIntPipe) recruitmentUnitId: number) {
    return this.exploreSusiKyokwaService.getDetail(recruitmentUnitId);
  }

  @Get('jonghap/step-1')
  @Public()
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-1',
  })
  exploreComprehensiveStep1(
    @Query('basic_type') basicType,
    @Query('year') year,
    @Query('minorFieldId') minorFieldId,
    @Query('subtype_ids') subtypeIds?: string,
  ) {
    const subtypeIdArray = subtypeIds
      ? subtypeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];
    return this.exploreSusiJonghapService.getStep1(year, basicType, minorFieldId, subtypeIdArray);
  }

  @Get('jonghap/step-2')
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-2',
  })
  exploreJonghapStep2(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreSusiJonghapService.getStep2(dto.ids);
  }

  @Get('jonghap/step-3')
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-3',
  })
  exploreJonghapStep3(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreSusiJonghapService.getStep3(dto.ids);
  }

  @Get('jonghap/step-4')
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-4',
  })
  exploreJonghapStep4(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreSusiJonghapService.getStep4(dto.ids);
  }

  @Get('jonghap/detail/:recruitmentUnitId')
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 상세조회',
  })
  exploreJonghapDetail(@Param('recruitmentUnitId', ParseIntPipe) recruitmentUnitId: number) {
    return this.exploreSusiJonghapService.getDetail(recruitmentUnitId);
  }
}
