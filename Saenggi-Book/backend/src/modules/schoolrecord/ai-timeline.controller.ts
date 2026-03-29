import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiTimelineService, GenerateTimelineRequestDto } from './ai-timeline.service';

@ApiTags('schoolrecord')
@ApiBearerAuth('access-token')
@Controller('schoolrecord')
export class AiTimelineController {
    private readonly logger = new Logger(AiTimelineController.name);

    constructor(private readonly aiTimelineService: AiTimelineService) {}

    /**
     * 생기부 성장 서사 타임라인 분석
     * POST /api/schoolrecord/timeline
     */
    @Post('timeline')
    @ApiOperation({ summary: '생기부 소재 기반 타임라인(서사) 생성' })
    async generateTimeline(@Body() dto: GenerateTimelineRequestDto) {
        this.logger.log(`생기부 소재 타임라인 분석 요청 - 입력 데이터: ${dto.materials?.length || 0}개`);
        const result = await this.aiTimelineService.generateTimeline(dto);
        return { success: true, data: result };
    }
}
