import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SeriesEvaluationService } from '../services/series-evaluation.service';
import {
  UniversityLevelResponseDto,
  HumanitiesCriteriaResponseDto,
  ScienceCriteriaResponseDto,
  CalculateSeriesEvaluationRequestDto,
  CalculateSeriesEvaluationResponseDto,
} from '../dto/series-evaluation.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('series-evaluation')
@Controller('series-evaluation')
export class SeriesEvaluationController {
  constructor(
    private readonly seriesEvaluationService: SeriesEvaluationService,
  ) {}

  @Public()
  @Get('universities')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '전체 대학 목록 조회',
    description: '자동완성을 위한 모든 대학 목록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '대학 목록 조회 성공',
    type: [UniversityLevelResponseDto],
  })
  async getAllUniversities() {
    return await this.seriesEvaluationService.getAllUniversities();
  }

  @Public()
  @Get('university-level/:universityName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '대학 레벨 조회',
    description: '대학명으로 해당 대학의 레벨 정보 조회',
  })
  @ApiParam({
    name: 'universityName',
    description: '대학명',
    example: '서울대학교',
  })
  @ApiResponse({
    status: 200,
    description: '대학 레벨 조회 성공',
    type: UniversityLevelResponseDto,
  })
  @ApiResponse({ status: 404, description: '대학을 찾을 수 없음' })
  async getUniversityLevel(@Param('universityName') universityName: string) {
    return await this.seriesEvaluationService.getUniversityLevel(
      universityName,
    );
  }

  @Public()
  @Get('criteria/humanities/:level')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '문과 계열 평가 기준 조회',
    description: '레벨별 문과 계열 평가 기준 조회',
  })
  @ApiParam({ name: 'level', description: '대학 레벨 (1-7)', example: 7 })
  @ApiResponse({
    status: 200,
    description: '문과 평가 기준 조회 성공',
    type: HumanitiesCriteriaResponseDto,
  })
  @ApiResponse({ status: 404, description: '평가 기준을 찾을 수 없음' })
  async getHumanitiesCriteria(@Param('level') level: number) {
    return await this.seriesEvaluationService.getHumanitiesCriteria(
      Number(level),
    );
  }

  @Public()
  @Get('criteria/science/:level')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '이과 계열 평가 기준 조회',
    description: '레벨별 이과 계열 평가 기준 조회',
  })
  @ApiParam({ name: 'level', description: '대학 레벨 (1-7)', example: 7 })
  @ApiResponse({
    status: 200,
    description: '이과 평가 기준 조회 성공',
    type: ScienceCriteriaResponseDto,
  })
  @ApiResponse({ status: 404, description: '평가 기준을 찾을 수 없음' })
  async getScienceCriteria(@Param('level') level: number) {
    return await this.seriesEvaluationService.getScienceCriteria(Number(level));
  }

  @Public()
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '계열 적합성 계산',
    description:
      '대학명, 계열 타입, 학생 성적을 기반으로 계열 적합성을 계산합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '계열 적합성 계산 성공',
    type: CalculateSeriesEvaluationResponseDto,
  })
  @ApiResponse({ status: 404, description: '대학 또는 평가 기준을 찾을 수 없음' })
  async calculateSeriesEvaluation(
    @Body() dto: CalculateSeriesEvaluationRequestDto,
  ) {
    return await this.seriesEvaluationService.calculateSeriesEvaluation(dto);
  }
}
