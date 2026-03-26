/**
 * AI-based School Record Material Analysis Service
 *
 * 프론트엔드에서 전달받은 생기부 텍스트를 OpenAI로 분석하여
 * 4대 역량(학업, 진로, 공동체, 기타)별 소재를 추출합니다.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

// ==================== Types ====================

export type CompetencyCategory = 'academic' | 'career' | 'community' | 'other';

export interface MaterialSource {
    type: 'subject' | 'creative' | 'behavior';
    grade: string;
    semester?: string;
    subjectName?: string;
    activityType?: string;
    originalText: string;
}

export interface MaterialItem {
    title: string;
    summary: string;
    category: CompetencyCategory;
    severity: 'high' | 'medium' | 'low';
    sources: MaterialSource[];
}

export interface SchoolRecordAnalysis {
    materials: MaterialItem[];
    analysisDate: string;
    summary: string;
}

// 프론트엔드에서 보내는 요청 DTO
export interface AnalyzeRequestDto {
    subjectTexts: Array<{ grade: string; semester: string; subjectName: string; text: string }>;
    creativeTexts: Array<{ grade: string; activityType: string; text: string }>;
    behaviorTexts: Array<{ grade: string; text: string }>;
}

// ==================== Service ====================

@Injectable()
export class AiAnalysisService {
    private readonly logger = new Logger(AiAnalysisService.name);
    private openai: OpenAI | null = null;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
            this.logger.log('AI Analysis: OpenAI client initialized');
        } else {
            this.logger.warn('AI Analysis: OPENAI_API_KEY not configured - analysis disabled');
        }
    }

    /**
     * 프롬프트 생성
     */
    private buildAnalysisPrompt(dto: AnalyzeRequestDto): string {
        let inputData = '';

        if (dto.subjectTexts.length > 0) {
            inputData += '=== 세부능력 및 특기사항 (세특) ===\n';
            for (const s of dto.subjectTexts) {
                inputData += `[${s.grade}학년 ${s.semester}학기 / ${s.subjectName}]\n${s.text}\n\n`;
            }
        }

        if (dto.creativeTexts.length > 0) {
            inputData += '=== 창의적 체험활동 (창체) ===\n';
            for (const c of dto.creativeTexts) {
                inputData += `[${c.grade}학년 / ${c.activityType}]\n${c.text}\n\n`;
            }
        }

        if (dto.behaviorTexts.length > 0) {
            inputData += '=== 행동특성 및 종합의견 (행특) ===\n';
            for (const b of dto.behaviorTexts) {
                inputData += `[${b.grade}학년]\n${b.text}\n\n`;
            }
        }

        return `당신은 대한민국 대학 입학 사정관 관점에서 학생의 생활기록부(생기부)를 분석하는 전문가입니다.

아래의 생기부 데이터를 분석하여 학생의 핵심 소재(어필 포인트)를 4대 역량 카테고리로 분류하여 추출해주세요.

## 4대 역량 카테고리
- academic (학업역량): 교과 학습 능력, 탐구 활동, 연구 능력, 실험 설계 등
- career (진로역량): 진로 관련 활동, 전공 적합성, 관심 분야 탐색 등
- community (공동체역량): 리더십, 협업, 봉사, 갈등 해결, 의사소통 등
- other (기타역량): 창의성, 자기주도성, 예술적 감각, 독서, 도전정신 등

## 분석 대상 데이터
${inputData}

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "materials": [
    {
      "title": "소재 제목 (예: 리더십, 실험 설계 능력, 환경 보호 활동 등)",
      "summary": "AI가 작성한 1-2줄 요약 설명",
      "category": "academic | career | community | other 중 하나",
      "severity": "high | medium | low (입시 어필 강도: high=매우 강함, medium=보통, low=약함)",
      "sourceIndices": [0, 2, 5]
    }
  ],
  "summary": "전체 생기부를 통해 보이는 학생의 핵심 특성 한줄 요약"
}

## 주의사항
1. 소재는 5~15개 사이로 추출합니다.
2. sourceIndices는 아래 원문 인덱스 목록에서의 번호입니다.
3. 하나의 소재에 여러 원문이 근거가 될 수 있습니다.
4. severity는 입시에서 어필 강도를 의미합니다:
   - high: 독보적이고 차별화된 활동/성과
   - medium: 꾸준하고 의미 있는 활동
   - low: 일반적이거나 보편적인 활동
5. 각 카테고리에 최소 1개 이상의 소재가 있어야 합니다.

## 원문 인덱스 목록
${this.buildSourceIndex(dto)}`;
    }

    /**
     * 원문 인덱스 생성
     */
    private buildSourceIndex(dto: AnalyzeRequestDto): string {
        let idx = 0;
        let result = '';

        for (const s of dto.subjectTexts) {
            result += `[${idx}] 세특 / ${s.grade}학년 ${s.semester}학기 / ${s.subjectName}\n`;
            idx++;
        }
        for (const c of dto.creativeTexts) {
            result += `[${idx}] 창체 / ${c.grade}학년 / ${c.activityType}\n`;
            idx++;
        }
        for (const b of dto.behaviorTexts) {
            result += `[${idx}] 행특 / ${b.grade}학년\n`;
            idx++;
        }

        return result;
    }

    /**
     * sourceIndices → MaterialSource[] 변환
     */
    private mapSources(sourceIndices: number[], dto: AnalyzeRequestDto): MaterialSource[] {
        const allSources: MaterialSource[] = [];

        for (const s of dto.subjectTexts) {
            allSources.push({
                type: 'subject',
                grade: s.grade,
                semester: s.semester,
                subjectName: s.subjectName,
                originalText: s.text,
            });
        }
        for (const c of dto.creativeTexts) {
            allSources.push({
                type: 'creative',
                grade: c.grade,
                activityType: c.activityType,
                originalText: c.text,
            });
        }
        for (const b of dto.behaviorTexts) {
            allSources.push({
                type: 'behavior',
                grade: b.grade,
                originalText: b.text,
            });
        }

        return sourceIndices
            .filter((i) => i >= 0 && i < allSources.length)
            .map((i) => allSources[i]);
    }

    /**
     * 메인 분석 메서드
     */
    async analyze(dto: AnalyzeRequestDto): Promise<SchoolRecordAnalysis> {
        if (!this.openai) {
            throw new Error('OpenAI API가 설정되지 않았습니다. OPENAI_API_KEY를 확인해주세요.');
        }

        const totalTexts = dto.subjectTexts.length + dto.creativeTexts.length + dto.behaviorTexts.length;
        if (totalTexts === 0) {
            throw new Error('분석할 생기부 텍스트 데이터가 없습니다.');
        }

        this.logger.log(
            `분석 시작 - 세특: ${dto.subjectTexts.length}, 창체: ${dto.creativeTexts.length}, 행특: ${dto.behaviorTexts.length}`,
        );

        const prompt = this.buildAnalysisPrompt(dto);

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4096,
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('AI 분석 응답이 비어있습니다.');
        }

        let parsed: any;
        try {
            parsed = JSON.parse(content);
        } catch {
            this.logger.error('AI 응답 JSON 파싱 실패');
            throw new Error('AI 분석 결과를 파싱할 수 없습니다.');
        }

        const materials: MaterialItem[] = (parsed.materials || []).map((m: any) => ({
            title: m.title || '소재',
            summary: m.summary || '',
            category: (['academic', 'career', 'community', 'other'].includes(m.category)
                ? m.category
                : 'other') as CompetencyCategory,
            severity: (['high', 'medium', 'low'].includes(m.severity) ? m.severity : 'medium') as
                | 'high'
                | 'medium'
                | 'low',
            sources: this.mapSources(m.sourceIndices || [], dto),
        }));

        this.logger.log(`분석 완료 - ${materials.length}개 소재 추출`);

        return {
            materials,
            analysisDate: new Date().toISOString(),
            summary: parsed.summary || '분석 완료',
        };
    }
}
