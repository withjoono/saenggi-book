import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NonsulService } from './nonsul.service';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Essay - 논술')
@Controller('nonsul')
@ApiBearerAuth()
export class NonsulController {
  constructor(private readonly nonsulService: NonsulService) {}

  @Get()
  @Public() // 테스트용: 로그인 없이 접근 가능
  @ApiOperation({
    summary: '논술 전형 목록 조회',
    description: '논술 전형 목록과 최저등급을 함께 조회합니다.',
  })
  async getNonsulList(@Query() query: CommonSearchQueryDto) {
    return this.nonsulService.getNonsulListWithLowestGrade(query);
  }

  @Get('universities')
  @ApiOperation({
    summary: '논술 실시 대학 목록',
    description: '논술 전형을 실시하는 대학 목록을 조회합니다.',
  })
  async getEssayUniversities() {
    // TODO: 대학 목록 조회 로직 구현
    return {
      success: true,
      data: [],
      message: '논술 실시 대학 목록',
    };
  }

  @Get('search')
  @ApiOperation({
    summary: '논술 전형 검색',
    description: '대학명, 모집단위로 논술 전형을 검색합니다.',
  })
  async searchEssay(@Query('keyword') keyword: string, @Query('year') year?: string) {
    // TODO: 검색 로직 구현
    return {
      success: true,
      data: [],
      message: `"${keyword}" 검색 결과`,
    };
  }
}
