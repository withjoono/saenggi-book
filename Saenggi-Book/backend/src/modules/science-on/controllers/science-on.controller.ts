import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { ScienceOnService } from '../services/science-on.service';
import { ScienceOnSearchDto } from '../dtos/science-on-query.dto';

@ApiTags('ScienceON - 한국 학술 논문 검색')
@Controller('science-on')
export class ScienceOnController {
  constructor(private readonly scienceOnService: ScienceOnService) {}

  @Public()
  @Get('articles')
  @ApiOperation({
    summary: '한국 학술 논문 검색',
    description: 'KISTI Science ON에서 한국어 키워드로 학술 논문을 검색합니다.',
  })
  searchArticles(@Query() dto: ScienceOnSearchDto) {
    return this.scienceOnService.searchArticles(dto);
  }

  @Public()
  @Get('articles/:cn')
  @ApiOperation({
    summary: '논문 상세 조회',
    description: 'CN(논문 고유번호)으로 Science ON 논문 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'cn', description: 'Science ON 논문 CN (예: JAKO202312345678)', example: 'JAKO202312345678' })
  getArticleDetail(@Param('cn') cn: string) {
    return this.scienceOnService.getArticleDetail(cn);
  }
}
