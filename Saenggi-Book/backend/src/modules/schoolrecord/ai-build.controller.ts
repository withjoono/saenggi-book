/**
 * AI Build Analysis Controller
 *
 * 생기부 빌드 분석 엔드포인트
 */

import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiBuildService, BuildAnalyzeRequestDto } from './ai-build.service';

@ApiTags('schoolrecord')
@ApiBearerAuth('access-token')
@Controller('schoolrecord')
export class AiBuildController {
    private readonly logger = new Logger(AiBuildController.name);

    constructor(private readonly aiBuildService: AiBuildService) { }

    /**
     * 생기부 빌드 분석
     * POST /api/schoolrecord/build-analyze
     *
     * 목표 대학/전공 기반으로 Gap 분석 + 활동 추천 + 로드맵을 생성합니다.
     */
    @Post('build-analyze')
    @ApiOperation({ summary: '생기부 빌드 분석 (Gap + 활동 추천 + 로드맵)' })
    async buildAnalyze(@Body() dto: BuildAnalyzeRequestDto) {
        this.logger.log(
            `빌드 분석 요청 - 목표: ${dto.targetUniversity} ${dto.targetMajor}, 소재: ${dto.materials?.length || 0}개`,
        );
        const result = await this.aiBuildService.analyzeBuild(dto);
        return { success: true, data: result };
    }
}
