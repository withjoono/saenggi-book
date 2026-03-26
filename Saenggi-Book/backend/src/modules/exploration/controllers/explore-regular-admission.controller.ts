import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { ExploreRegularService } from '../services/explore-regular-admission.service';
import { SnakeToCamelInterceptor } from 'src/common/interceptors/snake-to-camel.interceptor';

@Controller('explore/regular')
@UseInterceptors(SnakeToCamelInterceptor)
export class ExploreRegularController {
  constructor(private readonly exploreRegularService: ExploreRegularService) {}

  @Get('')
  @Public()
  @ApiOperation({
    summary: '[정시 전형 탐색] 정시 전형 탐색',
  })
  exploreRegularAdmissions(@Query('admission_type') admissionType, @Query('year') year) {
    return this.exploreRegularService.getAdmissions(year, admissionType);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '[정시 전형 탐색] 정시 전형 탐색',
  })
  exploreRegularAdmission(@Param('id', ParseIntPipe) admissionId: number) {
    return this.exploreRegularService.getAdmission(admissionId);
  }
}
