/**
 * AI-based School Record Build Analysis Service
 *
 * 학생의 목표 대학/전공에 맞춰 생기부 역량 Gap 분석,
 * 비교과 활동 추천, 학기별 로드맵을 생성합니다.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CompetencyCategory, MaterialItem } from './ai-analysis.service';

// ==================== Types ====================

export interface BuildAnalyzeRequestDto {
    targetUniversity: string;
    targetMajor: string;
    currentGrade: string; // '1' | '2' | '3'
    currentSemester: string; // '1' | '2'
    admissionType?: string; // '학종' | '교과' | '논술' 등
    materials: MaterialItem[];
}

export interface GapScore {
    category: CompetencyCategory;
    label: string;
    current: number; // 0-100
    target: number; // 0-100
    gap: number; // target - current
    comment: string;
}

export interface ActivityRecommendation {
    title: string;
    description: string;
    category: CompetencyCategory;
    priority: 'high' | 'medium' | 'low';
    type: 'club' | 'reading' | 'research' | 'volunteer' | 'creative' | 'competition' | 'other';
    expectedKeywords: string[];
    estimatedDuration: string;
    tip: string;
}

export interface RoadmapItem {
    semester: string; // 예: '1학년 2학기', '2학년 1학기'
    theme: string;
    activities: string[];
    goals: string[];
    isCurrent: boolean;
}

export interface BuildAnalysisResult {
    gapAnalysis: GapScore[];
    recommendations: ActivityRecommendation[];
    roadmap: RoadmapItem[];
    overallScore: number; // 0-100
    summary: string;
    strengths: string[];
    weaknesses: string[];
    analysisDate: string;
}

// ==================== Service ====================

@Injectable()
export class AiBuildService {
    private readonly logger = new Logger(AiBuildService.name);
    private openai: OpenAI | null = null;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
            this.logger.log('AI Build: OpenAI client initialized');
        } else {
            this.logger.warn('AI Build: OPENAI_API_KEY not configured - build analysis disabled');
        }
    }

    /**
     * 빌드 분석 프롬프트 생성
     */
    private buildPrompt(dto: BuildAnalyzeRequestDto): string {
        // 현재 소재 요약
        let materialsData = '';
        if (dto.materials.length > 0) {
            materialsData = dto.materials
                .map(
                    (m, i) =>
                        `[${i}] ${m.title} (${m.category}, 어필강도: ${m.severity})\n   요약: ${m.summary}`,
                )
                .join('\n');
        } else {
            materialsData = '(아직 분석된 소재가 없습니다)';
        }

        return `당신은 대한민국 대학 입시 전문 컨설턴트입니다.
학생의 현재 생기부 소재 분석 결과와 목표 대학/전공을 비교하여,
역량 Gap 분석, 비교과 활동 추천, 학기별 로드맵을 제시해주세요.

## 학생 정보
- 목표 대학: ${dto.targetUniversity}
- 목표 전공: ${dto.targetMajor}
- 현재 학년/학기: ${dto.currentGrade}학년 ${dto.currentSemester}학기
- 지원 전형: ${dto.admissionType || '학종(학생부종합전형)'}

## 현재 생기부 소재 분석 결과 (4대 역량별)
${materialsData}

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "gapAnalysis": [
    {
      "category": "academic | career | community | other 중 하나",
      "label": "학업역량 | 진로역량 | 공동체역량 | 기타역량",
      "current": 0~100 사이 점수 (현재 수준),
      "target": 0~100 사이 점수 (목표 대학 합격에 필요한 수준),
      "gap": target - current,
      "comment": "해당 역량에 대한 구체적 평가 코멘트"
    }
  ],
  "recommendations": [
    {
      "title": "추천 활동 제목",
      "description": "구체적인 활동 설명 (2-3문장)",
      "category": "academic | career | community | other 중 하나",
      "priority": "high | medium | low",
      "type": "club | reading | research | volunteer | creative | competition | other 중 하나",
      "expectedKeywords": ["생기부에 기록될 수 있는 키워드 목록"],
      "estimatedDuration": "예상 소요 기간 (예: 1학기, 3개월 등)",
      "tip": "활동을 더 효과적으로 수행하기 위한 팁"
    }
  ],
  "roadmap": [
    {
      "semester": "X학년 X학기",
      "theme": "이번 학기 핵심 테마",
      "activities": ["이번 학기에 수행할 핵심 활동 목록"],
      "goals": ["이번 학기 달성 목표"],
      "isCurrent": true/false (현재 학기인지 여부)
    }
  ],
  "overallScore": 0~100 사이의 현재 종합 준비도 점수,
  "summary": "전체 빌드 분석 한줄 요약",
  "strengths": ["현재 생기부의 강점 목록 (2-3개)"],
  "weaknesses": ["현재 생기부에서 보완이 필요한 점 (2-3개)"]
}

## 분석 지침
1. gapAnalysis는 반드시 4대 역량(academic, career, community, other) 모두 포함
2. recommendations는 5~10개, 우선순위 높은 것부터 정렬
3. roadmap은 현재 학기부터 3학년 1학기까지 (이미 지난 학기는 제외)
4. 목표 대학/전공의 특성을 반영하여 맞춤형 추천
   - 예: 공학→실험/연구 강조, 인문→독서/글쓰기 강조, 예체능→포트폴리오 강조
5. 현실적이고 교내에서 실행 가능한 활동 위주로 추천
6. expectedKeywords는 실제 생기부 세특/행특에 기록될 수 있는 표현
7. type 분류: club(동아리), reading(독서), research(탐구/소논문), volunteer(봉사), creative(창의적체험), competition(대회), other(기타)
8. overallScore는 해당 목표 대학에 대한 현재 준비도를 0~100으로 평가`;
    }

    /**
     * 메인 빌드 분석 메서드
     */
    async analyzeBuild(dto: BuildAnalyzeRequestDto): Promise<BuildAnalysisResult> {
        if (!this.openai) {
            throw new Error('OpenAI API가 설정되지 않았습니다. OPENAI_API_KEY를 확인해주세요.');
        }

        if (!dto.targetUniversity || !dto.targetMajor) {
            throw new Error('목표 대학과 전공을 입력해주세요.');
        }

        this.logger.log(
            `빌드 분석 시작 - 목표: ${dto.targetUniversity} ${dto.targetMajor}, 소재: ${dto.materials.length}개`,
        );

        const prompt = this.buildPrompt(dto);

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 8192,
            temperature: 0.4,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('AI 빌드 분석 응답이 비어있습니다.');
        }

        let parsed: any;
        try {
            parsed = JSON.parse(content);
        } catch {
            this.logger.error('AI 빌드 분석 응답 JSON 파싱 실패');
            throw new Error('AI 빌드 분석 결과를 파싱할 수 없습니다.');
        }

        // Validate & normalize
        const validCategories: CompetencyCategory[] = ['academic', 'career', 'community', 'other'];
        const categoryLabels: Record<CompetencyCategory, string> = {
            academic: '학업역량',
            career: '진로역량',
            community: '공동체역량',
            other: '기타역량',
        };

        const gapAnalysis: GapScore[] = (parsed.gapAnalysis || []).map((g: any) => {
            const cat = validCategories.includes(g.category) ? g.category : 'other';
            return {
                category: cat,
                label: g.label || categoryLabels[cat],
                current: Math.min(100, Math.max(0, Number(g.current) || 0)),
                target: Math.min(100, Math.max(0, Number(g.target) || 0)),
                gap: Number(g.gap) || 0,
                comment: g.comment || '',
            };
        });

        // Ensure all 4 categories exist
        for (const cat of validCategories) {
            if (!gapAnalysis.find((g) => g.category === cat)) {
                gapAnalysis.push({
                    category: cat,
                    label: categoryLabels[cat],
                    current: 0,
                    target: 50,
                    gap: 50,
                    comment: '데이터 부족으로 정확한 평가가 어렵습니다.',
                });
            }
        }

        const validPriorities = ['high', 'medium', 'low'];
        const validTypes = [
            'club',
            'reading',
            'research',
            'volunteer',
            'creative',
            'competition',
            'other',
        ];

        const recommendations: ActivityRecommendation[] = (parsed.recommendations || []).map(
            (r: any) => ({
                title: r.title || '활동 추천',
                description: r.description || '',
                category: validCategories.includes(r.category) ? r.category : 'other',
                priority: validPriorities.includes(r.priority) ? r.priority : 'medium',
                type: validTypes.includes(r.type) ? r.type : 'other',
                expectedKeywords: Array.isArray(r.expectedKeywords) ? r.expectedKeywords : [],
                estimatedDuration: r.estimatedDuration || '',
                tip: r.tip || '',
            }),
        );

        const roadmap: RoadmapItem[] = (parsed.roadmap || []).map((r: any) => ({
            semester: r.semester || '',
            theme: r.theme || '',
            activities: Array.isArray(r.activities) ? r.activities : [],
            goals: Array.isArray(r.goals) ? r.goals : [],
            isCurrent: !!r.isCurrent,
        }));

        const result: BuildAnalysisResult = {
            gapAnalysis,
            recommendations,
            roadmap,
            overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore) || 0)),
            summary: parsed.summary || '빌드 분석 완료',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
            analysisDate: new Date().toISOString(),
        };

        this.logger.log(
            `빌드 분석 완료 - Gap: ${gapAnalysis.length}, 추천: ${recommendations.length}, 로드맵: ${roadmap.length}`,
        );

        return result;
    }
}
