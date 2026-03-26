/**
 * AI School Record Material Analysis Controller
 *
 * 생기부 AI 소재 분석 엔드포인트
 */

import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiAnalysisService, AnalyzeRequestDto } from './ai-analysis.service';

@ApiTags('schoolrecord')
@ApiBearerAuth('access-token')
@Controller('schoolrecord')
export class AiAnalysisController {
    private readonly logger = new Logger(AiAnalysisController.name);

    constructor(private readonly aiAnalysisService: AiAnalysisService) { }

    /**
     * 생기부 AI 소재 분석
     * POST /api/schoolrecord/analyze
     *
     * 프론트엔드에서 수집한 생기부 텍스트 데이터를 AI로 분석합니다.
     */
    @Post('analyze')
    @ApiOperation({ summary: '생기부 AI 소재 분석' })
    async analyzeSchoolRecord(@Body() dto: AnalyzeRequestDto) {
        this.logger.log(
            `AI 소재 분석 요청 - 세특: ${dto.subjectTexts?.length || 0}, 창체: ${dto.creativeTexts?.length || 0}, 행특: ${dto.behaviorTexts?.length || 0}`,
        );
        const result = await this.aiAnalysisService.analyze(dto);
        return { success: true, data: result };
    }
}
