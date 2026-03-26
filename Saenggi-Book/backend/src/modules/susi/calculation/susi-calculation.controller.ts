// @ts-nocheck
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SusiCalculationService } from './services/susi-calculation.service';
import {
  CalculateKyokwaScoresDto,
  GetKyokwaScoresQueryDto,
  GetRecruitmentScoresQueryDto,
  DeleteKyokwaScoresDto,
} from './dto/calculate-kyokwa-scores.dto';
import {
  CalculateKyokwaScoresResponseDto,
  GetKyokwaScoresResponseDto,
  GetRecruitmentScoresResponseDto,
  UniversityScoreResponseDto,
  RecruitmentScoreResponseDto,
} from './dto/kyokwa-score-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { SnakeToCamelInterceptor } from '../../../common/interceptors/snake-to-camel.interceptor';

interface RequestWithMemberId extends Request {
  memberId: string;
}

@ApiTags('수시 교과전형 환산점수')
@Controller('ms/kyokwa')
@UseGuards(JwtAuthGuard)
@UseInterceptors(SnakeToCamelInterceptor)
@ApiBearerAuth()
export class SusiCalculationController {
  constructor(private readonly calculationService: SusiCalculationService) { }

  /**
   * 교과전형 환산점수 계산 및 저장
   * POST /susi/kyokwa/calculate
   */
  @Post('calculate')
  @ApiOperation({
    summary: '교과전형 환산점수 계산',
    description:
      '사용자의 학생부 내신 데이터를 기반으로 대학별 교과전형 환산점수를 계산하고 저장합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '계산 성공',
    type: CalculateKyokwaScoresResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async calculateScores(
    @Req() req: RequestWithMemberId,
    @Body() dto: CalculateKyokwaScoresDto,
  ): Promise<CalculateKyokwaScoresResponseDto> {
    const memberId = req.memberId;
    return this.calculationService.calculateAndSaveScores(memberId, {
      universityNames: dto.universityNames,
      recalculate: dto.recalculate,
      year: dto.year,
    });
  }

  /**
   * 저장된 대학별 환산점수 조회
   * GET /susi/kyokwa/scores
   */
  @Get('scores')
  @ApiOperation({
    summary: '대학별 환산점수 조회',
    description: '사용자의 저장된 대학별 교과전형 환산점수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: GetKyokwaScoresResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getSavedScores(
    @Req() req: RequestWithMemberId,
    @Query() query: GetKyokwaScoresQueryDto,
  ): Promise<GetKyokwaScoresResponseDto> {
    const memberId = req.memberId;

    let scores = await this.calculationService.getSavedScores(memberId);

    // 대학명 필터
    if (query.universityName) {
      scores = scores.filter((s) => s.university_name === query.universityName);
    }

    // 연도 필터
    if (query.year) {
      scores = scores.filter((s) => s.year === query.year);
    }

    return {
      total: scores.length,
      scores: scores.map((s) => this.mapToUniversityScoreResponse(s)),
    };
  }

  /**
   * 특정 대학 환산점수 조회
   * GET /susi/kyokwa/scores/:universityName
   */
  @Get('scores/:universityName')
  @ApiOperation({
    summary: '특정 대학 환산점수 조회',
    description: '특정 대학의 저장된 교과전형 환산점수를 조회합니다.',
  })
  @ApiParam({ name: 'universityName', description: '대학명' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: UniversityScoreResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '점수 없음' })
  async getSavedScoreByUniversity(
    @Req() req: RequestWithMemberId,
    @Param('universityName') universityName: string,
  ): Promise<UniversityScoreResponseDto | null> {
    const memberId = req.memberId;
    const score = await this.calculationService.getSavedScoreByUniversity(
      memberId,
      decodeURIComponent(universityName),
    );

    if (!score) {
      return null;
    }

    return this.mapToUniversityScoreResponse(score);
  }

  /**
   * 모집단위별 환산점수 조회
   * GET /susi/kyokwa/recruitment-scores
   */
  @Get('recruitment-scores')
  @ApiOperation({
    summary: '모집단위별 환산점수 조회',
    description:
      '사용자의 저장된 모집단위별 환산점수를 조회합니다. 위험도 기준으로 정렬됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: GetRecruitmentScoresResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getRecruitmentScores(
    @Req() req: RequestWithMemberId,
    @Query() query: GetRecruitmentScoresQueryDto,
  ): Promise<GetRecruitmentScoresResponseDto> {
    const memberId = req.memberId;

    let scores = await this.calculationService.getSavedRecruitmentScores(memberId);

    // 필터 적용
    if (query.universityName) {
      scores = scores.filter((s) => s.university_name === query.universityName);
    }
    if (query.basicType) {
      scores = scores.filter((s) => s.basic_type === query.basicType);
    }
    if (query.minRiskScore !== undefined) {
      scores = scores.filter((s) => s.risk_score !== null && s.risk_score >= query.minRiskScore);
    }
    if (query.maxRiskScore !== undefined) {
      scores = scores.filter((s) => s.risk_score !== null && s.risk_score <= query.maxRiskScore);
    }
    if (query.year) {
      scores = scores.filter((s) => s.year === query.year);
    }

    return {
      total: scores.length,
      scores: scores.map((s) => this.mapToRecruitmentScoreResponse(s)),
    };
  }

  /**
   * 환산점수 재계산 (기존 점수 삭제 후 새로 계산)
   * POST /susi/kyokwa/recalculate
   */
  @Post('recalculate')
  @ApiOperation({
    summary: '환산점수 재계산',
    description: '기존 저장된 점수를 삭제하고 내신 데이터로 다시 계산합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '재계산 성공',
    type: CalculateKyokwaScoresResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async recalculateScores(
    @Req() req: RequestWithMemberId,
    @Body() dto: CalculateKyokwaScoresDto,
  ): Promise<CalculateKyokwaScoresResponseDto> {
    const memberId = req.memberId;
    return this.calculationService.calculateAndSaveScores(memberId, {
      universityNames: dto.universityNames,
      recalculate: true,
      year: dto.year,
    });
  }

  /**
   * 저장된 환산점수 삭제
   * DELETE /susi/kyokwa/scores
   */
  @Delete('scores')
  @ApiOperation({
    summary: '저장된 환산점수 삭제',
    description: '사용자의 저장된 교과전형 환산점수를 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async deleteScores(
    @Req() req: RequestWithMemberId,
    @Body() dto: DeleteKyokwaScoresDto,
  ): Promise<{ deleted: boolean }> {
    const memberId = req.memberId;
    await this.calculationService.deleteScores(memberId, dto.universityNames);
    return { deleted: true };
  }

  // ========== Private Mapping Methods ==========

  private mapToUniversityScoreResponse(entity: any): UniversityScoreResponseDto {
    return {
      success: entity.success,
      failure_reason: entity.failure_reason,
      university_name: entity.university_name,
      year: entity.year,
      converted_score: Number(entity.converted_score) || 0,
      max_score: Number(entity.max_score) || 0,
      score_percentage: Number(entity.score_percentage) || 0,
      average_grade: Number(entity.average_grade) || 0,
      grade_1_average: entity.grade_1_average ? Number(entity.grade_1_average) : undefined,
      grade_2_average: entity.grade_2_average ? Number(entity.grade_2_average) : undefined,
      grade_3_average: entity.grade_3_average ? Number(entity.grade_3_average) : undefined,
      korean_score: Number(entity.korean_score) || 0,
      korean_average_grade: entity.korean_average_grade
        ? Number(entity.korean_average_grade)
        : undefined,
      english_score: Number(entity.english_score) || 0,
      english_average_grade: entity.english_average_grade
        ? Number(entity.english_average_grade)
        : undefined,
      math_score: Number(entity.math_score) || 0,
      math_average_grade: entity.math_average_grade
        ? Number(entity.math_average_grade)
        : undefined,
      social_score: Number(entity.social_score) || 0,
      social_average_grade: entity.social_average_grade
        ? Number(entity.social_average_grade)
        : undefined,
      science_score: Number(entity.science_score) || 0,
      science_average_grade: entity.science_average_grade
        ? Number(entity.science_average_grade)
        : undefined,
      etc_score: Number(entity.etc_score) || 0,
      reflected_subject_count: entity.reflected_subject_count || 0,
      reflected_subjects: entity.reflected_subjects || [],
      attendance_score: Number(entity.attendance_score) || 0,
      volunteer_score: Number(entity.volunteer_score) || 0,
    };
  }

  private mapToRecruitmentScoreResponse(entity: any): RecruitmentScoreResponseDto {
    return {
      success: entity.success,
      failure_reason: entity.failure_reason,
      susi_subject_id: entity.susi_subject_id,
      university_name: entity.university_name,
      recruitment_name: entity.recruitment_name,
      type_name: entity.type_name,
      basic_type: entity.basic_type,
      detailed_type: entity.detailed_type,
      department: entity.department,
      year: entity.year,
      converted_score: Number(entity.converted_score) || 0,
      max_score: entity.max_score ? Number(entity.max_score) : undefined,
      score_percentage: entity.score_percentage ? Number(entity.score_percentage) : undefined,
      average_grade: entity.average_grade ? Number(entity.average_grade) : undefined,
      risk_score: entity.risk_score,
      grade_cut_50: entity.grade_cut_50 ? Number(entity.grade_cut_50) : undefined,
      grade_cut_70: entity.grade_cut_70 ? Number(entity.grade_cut_70) : undefined,
      grade_difference: entity.grade_difference ? Number(entity.grade_difference) : undefined,
      last_year_avg_grade: entity.last_year_avg_grade
        ? Number(entity.last_year_avg_grade)
        : undefined,
      last_year_min_grade: entity.last_year_min_grade
        ? Number(entity.last_year_min_grade)
        : undefined,
      last_year_competition_rate: entity.last_year_competition_rate
        ? Number(entity.last_year_competition_rate)
        : undefined,
    };
  }
}
