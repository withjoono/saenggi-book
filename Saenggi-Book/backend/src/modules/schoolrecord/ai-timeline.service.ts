import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { MaterialItem } from './ai-analysis.service';

// 프론트엔드에서 보내는 데이터 (이미 1차로 로드된 소재들)
export interface GenerateTimelineRequestDto {
    materials: MaterialItem[];
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
    nodes: TimelineNode[];
    edges: TimelineEdge[];
}

export interface TimelineAnalysisResult {
    academic: CompetencyTimeline;
    career: CompetencyTimeline;
    community: CompetencyTimeline;
}

@Injectable()
export class AiTimelineService {
    private readonly logger = new Logger(AiTimelineService.name);
    private openai: OpenAI | null = null;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
            this.logger.log('AI Timeline: OpenAI client initialized');
        } else {
            this.logger.warn('AI Timeline: OPENAI_API_KEY not configured - timeline generation disabled');
        }
    }

    private buildPrompt(dto: GenerateTimelineRequestDto): string {
        const materialsJson = JSON.stringify(
            dto.materials.map((m, index) => {
                // grade 정보 추출 (sources 중 하나에서 가져오기)
                const gradeInfo = m.sources.length > 0 ? m.sources.map(s => `${s.grade}학년`).join(', ') : '전체';
                
                return {
                    id: `m${index}`,
                    title: m.title,
                    summary: m.summary,
                    category: m.category,
                    grade: gradeInfo
                };
            }),
            null,
            2
        );

        return `당신은 대한민국 대학 입학 사정관 관점에서 학생의 생활기록부 역량 서사(Storyline)를 분석하는 전문가입니다.

아래 주어진 학생의 "생기부 추출 소재(Materials)" 목록을 바탕으로, 학업역량(academic), 진로역량(career), 공동체역량(community) 각각에 대한 "서사 타임라인(Timeline) 관계"를 추출해 주세요.

## 지시사항
1. 각 역량(학업, 진로, 공동체)별로 해당 역량을 중심축으로 성장해나가는 서사를 노드(Node)와 엣지(Edge)로 구성하세요.
2. 서사 타임라인은 논리적 발전 과정(예: 호기심/계기 -> 탐구 -> 실생활 적용 -> 융합/심화)에 따라 소재들이 어떻게 연결되는지를 보여주어야 합니다.
3. 특정 역량 타임라인을 만들 때, 다른 카테고리의 소재라도 관련이 있다면 연결 노드로 끌어와 포함시킬 수 있습니다. (예: 진로 타임라인을 구성하는데, 학업 소재인 수학 활동이 논리적 바탕이 되었다면 포함)
4. 모든 소재를 다 연결할 필요는 없습니다. 억지스러운 연결은 피하고 논리적으로 훌륭한 "입시 서사"가 되는 핵심 줄기를 잡아주세요.
5. 노드의 id는 제공된 데이터의 id(m0, m1...)를 그대로 사용하세요.

## 제공된 소재 데이터
${materialsJson}

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "academic": {
    "nodes": [
      { "id": "m0", "materialTitle": "소재 제목", "grade": "1학년", "summary": "활동 요약" }
    ],
    "edges": [
      { "source": "m0", "target": "m2", "reason": "해당 과목에서 생긴 호기심을 다른 과목으로 확장하여 탐구함" }
    ]
  },
  "career": {
    "nodes": [],
    "edges": []
  },
  "community": {
    "nodes": [],
    "edges": []
  }
}

반드시 위 JSON 객체 구조를 완벽하게 준수하여 응답해야 합니다.`;
    }

    async generateTimeline(dto: GenerateTimelineRequestDto): Promise<TimelineAnalysisResult> {
        if (!this.openai) {
            throw new Error('OpenAI API가 설정되지 않았습니다. OPENAI_API_KEY를 확인해주세요.');
        }

        if (!dto.materials || dto.materials.length === 0) {
            return {
                academic: { nodes: [], edges: [] },
                career: { nodes: [], edges: [] },
                community: { nodes: [], edges: [] }
            };
        }

        this.logger.log(`타임라인 분석 요청 - 소재 갯수: ${dto.materials.length}`);

        const prompt = this.buildPrompt(dto);

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 3000,
                temperature: 0.3,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error('AI 분석 응답이 비어있습니다.');

            const parsed = JSON.parse(content);
            
            this.logger.log(`타임라인 분석 완료`);
            
            return {
                academic: parsed.academic || { nodes: [], edges: [] },
                career:   parsed.career   || { nodes: [], edges: [] },
                community: parsed.community || { nodes: [], edges: [] }
            };
        } catch (error) {
            this.logger.error('타임라인 생성 실패:', error);
            throw new Error('타임라인 생성 중 오류가 발생했습니다.');
        }
    }
}
