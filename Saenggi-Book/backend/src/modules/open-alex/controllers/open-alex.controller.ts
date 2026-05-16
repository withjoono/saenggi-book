import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { OpenAlexService } from '../services/open-alex.service';
import { ConceptSearchDto, PaperQueryDto } from '../dtos/open-alex-query.dto';

@ApiTags('OpenAlex - 수행평가 주제 탐색')
@Controller('open-alex')
export class OpenAlexController {
  constructor(private readonly openAlexService: OpenAlexService) {}

  @Public()
  @Get('concepts')
  @ApiOperation({ summary: '주제(Concept) 검색', description: '키워드나 레벨로 학문 주제를 검색합니다' })
  searchConcepts(@Query() dto: ConceptSearchDto) {
    return this.openAlexService.searchConcepts(dto);
  }

  @Public()
  @Get('concepts/:id')
  @ApiOperation({ summary: '주제 상세 조회', description: '특정 주제의 상세 정보 및 연관 개념을 조회합니다' })
  @ApiParam({ name: 'id', example: 'C41008148', description: 'OpenAlex Concept ID (예: C41008148)' })
  getConceptById(@Param('id') id: string) {
    return this.openAlexService.getConceptById(id);
  }

  @Public()
  @Get('concepts/:id/graph')
  @ApiOperation({
    summary: '주제 그래프 데이터',
    description: '특정 주제를 중심으로 상위/연관 개념의 nodes & edges를 반환합니다. Neo4j 또는 그래프 시각화에 활용하세요.',
  })
  @ApiParam({ name: 'id', example: 'C41008148', description: 'OpenAlex Concept ID' })
  getConceptGraph(@Param('id') id: string) {
    return this.openAlexService.getConceptGraph(id);
  }

  @Public()
  @Get('concepts/:id/papers')
  @ApiOperation({ summary: '주제별 논문 목록', description: '특정 주제의 관련 논문을 인용수 순으로 반환합니다.' })
  @ApiParam({ name: 'id', example: 'T12345', description: 'OpenAlex Topic ID' })
  getTopicPapers(@Param('id') id: string, @Query() dto: PaperQueryDto) {
    return this.openAlexService.getTopicPapers(id, dto.page, dto.per_page);
  }
}
