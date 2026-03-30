import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MaterialItem } from './ai-analysis.service';
import { PrismaService } from '../../database/prisma.service';

// 프론트엔드에서 보내는 데이터 (이미 1차로 로드된 소재들)
export interface GenerateTimelineRequestDto {
    materials: MaterialItem[];
    category: 'academic' | 'career' | 'community';
    evaluationId: number | string;
}

export interface TimelineNode {
    id: string;
    materialTitle: string;
    grade: string;
    summary: string;
}

export interface TimelineEdge {
    source: string;
    target: string;
    reason: string;
}

export interface CompetencyTimeline {
    overall_storyline: string;
    nodes: TimelineNode[];
    edges: TimelineEdge[];
}

export interface TimelineAnalysisResult {
    academic?: CompetencyTimeline;
    career?: CompetencyTimeline;
    community?: CompetencyTimeline;
}

@Injectable()
export class AiTimelineService {
    private readonly logger = new Logger(AiTimelineService.name);
    private genAI: GoogleGenerativeAI | null = null;
    private tableVerified = false;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.logger.log('AI Timeline: Gemini client initialized');
        } else {
            this.logger.warn('AI Timeline: GEMINI_API_KEY not configured - timeline generation disabled');
        }
    }

    private buildCategoryPrompt(dto: GenerateTimelineRequestDto, category: string, categoryLabel: string): string {
        const materialsJson = JSON.stringify(
            dto.materials.map((m: any, index) => {
                let gradeInfo = '전체';
                if (m.gradeLevel) {
                    const gradeStr = typeof m.gradeLevel === 'string' ? m.gradeLevel.replace(/[^1-3]/g, '') : m.gradeLevel;
                    if (gradeStr) gradeInfo = `${gradeStr}학년`;
                } else if (m.sources && m.sources.length > 0) {
                    gradeInfo = m.sources.map(s => `${s.grade}학년`).join(', ');
                }

                return {
                    id: `m${index}`,
                    title: m.title,
                    summary: m.summary, // 이 부분은 프론트에서 원문 300자로 보낸 데이터
                    grade: gradeInfo
                };
            }),
            null,
            2
        );

        return `당신은 대한민국 대학 입학 사정관 관점에서 학생의 "생기부 원본 데이터(세특, 창체, 행특 일부)"를 분석하여 [${categoryLabel}] 역량 서사(Storyline)를 추출하는 전문가입니다.

아래 제공된 데이터는 학생의 생기부 3년 치 원본 텍스트 조각들입니다. 이 텍스트들을 모두 주의 깊게 읽고, 오직 **"${categoryLabel}"** 측면에만 집중하여 이 학생이 1학년부터 3학년까지 어떻게 발전했는지 서사(Timeline)를 만들어 주세요.

## 핵심 규칙
1. **반드시 최소 2개 이상의 노드를 생성해야 합니다.** (절대 빈 배열 [] 금지)
2. 제공된 원본 텍스트가 서로 깊게 연결되지 않더라도, 학년이 올라가며 자연스럽게 성장하는 흐름(호기심 -> 탐구 -> 실생활 적용)으로 간주하여 강제로라도 논리적인 서사를 부여하세요.
3. 생기부 내용 중 ${categoryLabel}과 조금이라도 관련이 있는 모든 활동을 끌어오세요. (예: 진로 타임라인인데 수학 세특 활동이 진로와 연관된다면 포함할 것)
4. 노드의 id는 제공된 데이터의 id(m0, m1...)를 그대로 사용하세요.
5. 노드의 summary(요약)에는 해당 원본 텍스트가 [${categoryLabel}] 관점에서 어떤 의미를 가지는지 "1~2문장으로 압축하여" 작성하세요.
6. grade 필드에는 학년을 "1학년", "2학년", "3학년" 형태로 명시하세요.
7. edge의 reason은 입시 사정관 관점에서 두 활동이 어떻게 논리적으로 발전했는지 서술해 주세요.
8. **(중요) overall_storyline 에는 이 학생의 3년 동안의 [${categoryLabel}] 성장 과정을 한 편의 감동적인 평가서처럼 1~2문단 줄글로 작성해 주세요.** 이 과정을 먼저 머릿속으로 정리(Chain of Thought)한 뒤, 노드와 엣지를 생성하세요.

## 제공된 생기부 원본 조각들
${materialsJson}

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "overall_storyline": "이 학생은 1학년 때 ... 하여, 2학년 때는 ... 으로 발전하였고, 3학년 때는 ... 한 모습을 보여준 훌륭한 ${categoryLabel} 역량을 갖춘 인재입니다.",
  "nodes": [
    { "id": "m0", "materialTitle": "수학 세특 등 원본 제목", "grade": "1학년", "summary": "이 활동이 ${categoryLabel} 역량에서 갖는 의미 요약" }
  ],
  "edges": [
    { "source": "m0", "target": "m2", "reason": "해당 과목에서 생긴 호기심을 바탕으로 다음 학년에서 심화 탐구함" }
  ]
}

중요: 반드시 JSON 구조를 완벽하게 유지하고, overall_storyline, nodes, edges 배열을 반드시 채워넣으세요.`;
    }

    async verifyTable() {
        if (this.tableVerified) return;
        try {
            await this.prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "saenggiview"."sv_ai_timeline" (
                "id" BIGSERIAL NOT NULL,
                "evaluation_id" BIGINT NOT NULL,
                "member_id" VARCHAR(30) NOT NULL,
                "category" VARCHAR(20) NOT NULL,
                "overall_storyline" TEXT NOT NULL,
                "nodes" JSONB NOT NULL,
                "edges" JSONB NOT NULL,
                "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "sv_ai_timeline_pkey" PRIMARY KEY ("id")
            )
            `);
            await this.prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_sv_ai_timeline_eval_category" ON "saenggiview"."sv_ai_timeline"("evaluation_id", "category")
            `);
            await this.prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "IDX_sv_ai_timeline_member_id" ON "saenggiview"."sv_ai_timeline"("member_id")
            `);
            this.tableVerified = true;
            this.logger.log('sv_ai_timeline table verified successfully.');
        } catch (e) {
            this.logger.warn('Failed to verify sv_ai_timeline schema: ' + e.message);
        }
    }

    async generateTimeline(dto: GenerateTimelineRequestDto, memberId: string): Promise<CompetencyTimeline> {
        if (!this.genAI) {
            throw new Error('Gemini API가 설정되지 않았습니다. GEMINI_API_KEY를 확인해주세요.');
        }

        if (!dto.materials || dto.materials.length === 0) {
            return { overall_storyline: '', nodes: [], edges: [] };
        }

        await this.verifyTable();

        const evaluationId = BigInt(dto.evaluationId?.toString() || '0');

        // ==== Cache Hit 로직 ====
        if (evaluationId > 0n) {
            try {
                const existing = await this.prisma.sv_ai_timeline.findFirst({
                    where: {
                        evaluation_id: evaluationId,
                        category: dto.category
                    }
                });

                if (existing) {
                    this.logger.log(`[Cache Hit] 타임라인 즉시 반환 - 역량: ${dto.category}`);
                    return {
                        overall_storyline: existing.overall_storyline,
                        nodes: existing.nodes as any,
                        edges: existing.edges as any
                    };
                }
            } catch (e) {} // 테이블 완전 접근 실패 시 패스
        }

        this.logger.log(`타임라인 분석 요청 - 역량: ${dto.category}, 소재 갯수: ${dto.materials.length}`);

        const categories = {
            academic: '학업',
            career: '진로',
            community: '공동체'
        };

        const targetCategoryLabel = categories[dto.category];
        if (!targetCategoryLabel) {
            throw new Error('잘못된 카테고리입니다.');
        }

        const prompt = this.buildCategoryPrompt(dto, dto.category, targetCategoryLabel);
        try {
            const modelInfo = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-pro',
                generationConfig: {
                    maxOutputTokens: 8192,
                    temperature: 0.3,
                    responseMimeType: 'application/json',
                },
            });

            const responseInfo = await modelInfo.generateContent(prompt);
            const content = responseInfo.response.text();
            if (!content) return { overall_storyline: '', nodes: [], edges: [] };

            const cleanedContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanedContent);

            this.logger.log(`[${dto.category}] 타임라인 분석 완료 - ${parsed.nodes?.length || 0}노드`);
            
            const resultTimeline: CompetencyTimeline = {
                overall_storyline: parsed.overall_storyline || '생성된 스토리라인이 없습니다.',
                nodes: parsed.nodes || [],
                edges: parsed.edges || []
            };

            // ==== Cache Miss 이후 저장 (Upsert) ====
            if (evaluationId > 0n && memberId) {
                try {
                    await this.prisma.sv_ai_timeline.upsert({
                        where: {
                            evaluation_id_category: {
                                evaluation_id: evaluationId,
                                category: dto.category
                            }
                        },
                        update: {
                            overall_storyline: resultTimeline.overall_storyline,
                            nodes: resultTimeline.nodes as any,
                            edges: resultTimeline.edges as any
                        },
                        create: {
                            evaluation_id: evaluationId,
                            member_id: memberId,
                            category: dto.category,
                            overall_storyline: resultTimeline.overall_storyline,
                            nodes: resultTimeline.nodes as any,
                            edges: resultTimeline.edges as any
                        }
                    });
                    this.logger.log(`DB 타임라인 캐싱 완료 - 역량: ${dto.category}`);
                } catch (e) {
                    this.logger.warn(`Failed to cache timeline: ${e.message}`);
                }
            }

            return resultTimeline;
        } catch (err) {
            this.logger.error(`[${dto.category}] 타임라인 생성 실패: `, err);
            return { overall_storyline: `AI 분석 중 오류가 발생했습니다.`, nodes: [], edges: [] };
        }
    }
}
