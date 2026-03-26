/**
 * Semester Evaluation Controller
 * - POST /schoolrecord/eval/semester — 학기별 세특 평가
 * - POST /schoolrecord/eval/comprehensive — 종합 평가 (세특+창체+행특)
 * - GET  /schoolrecord/eval/history — 내 평가 내역 조회
 */

import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { SemesterEvalService, SemesterEvalRequestDto, ComprehensiveEvalRequestDto } from './semester-eval.service';

@ApiTags('schoolrecord')
@ApiBearerAuth('access-token')
@Controller('schoolrecord')
export class SemesterEvalController {
    constructor(private readonly semesterEvalService: SemesterEvalService) { }

    @Post('eval/semester')
    @ApiOperation({ summary: '학기별 세특 7등급 평가' })
    async evaluateSemester(
        @Body() dto: SemesterEvalRequestDto,
        @CurrentMemberId() memberId: string,
    ) {
        const result = await this.semesterEvalService.evaluateSemester(dto);

        // DB에 결과 저장 (비동기, 실패해도 결과 반환에 영향 없음)
        this.semesterEvalService.saveEvaluation(memberId, 'semester', dto, result).catch(err => {
            console.error('[SemesterEval] DB 저장 실패:', err.message);
        });

        return { success: true, data: result };
    }

    @Post('eval/comprehensive')
    @ApiOperation({ summary: '학년 종합 평가 (세특+창체+행특)' })
    async evaluateComprehensive(
        @Body() dto: ComprehensiveEvalRequestDto,
        @CurrentMemberId() memberId: string,
    ) {
        const result = await this.semesterEvalService.evaluateComprehensive(dto);

        // DB에 결과 저장 (비동기, 실패해도 결과 반환에 영향 없음)
        this.semesterEvalService.saveEvaluation(memberId, 'comprehensive', dto, result).catch(err => {
            console.error('[ComprehensiveEval] DB 저장 실패:', err.message);
        });

        return { success: true, data: result };
    }

    @Get('eval/history')
    @ApiOperation({ summary: '내 AI 평가 내역 조회' })
    async getEvalHistory(@CurrentMemberId() memberId: string) {
        const history = await this.semesterEvalService.getEvalHistory(memberId);
        return { success: true, data: history };
    }
}
