import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecommendTopicDto } from './dto/recommend-topic.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';

@Injectable()
export class SetukBuilderService {
    private readonly logger = new Logger(SetukBuilderService.name);
    private genAI: GoogleGenerativeAI | null = null;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.logger.log('Setuk Builder: Gemini client initialized');
        } else {
            this.logger.warn('Setuk Builder: GEMINI_API_KEY not configured');
        }
    }

    /**
     * 서사 컨텍스트 섹션을 프롬프트용 텍스트로 구성
     */
    private buildStorylineContext(dto: RecommendTopicDto): string {
        const sections: string[] = [];

        // 스토리라인 요약 (3개 카테고리 모두)
        if (dto.storylines && dto.storylines.length > 0) {
            sections.push('## 이 학생의 발달 서사 (스토리라인)');
            sections.push('아래는 이 학생의 1학년~현재까지의 생기부 기반 발달 서사입니다. 수행평가 주제를 이 서사의 자연스러운 연장선상으로 추천해주세요.\n');
            const categoryLabels: Record<string, string> = {
                academic: '학업역량',
                career: '진로역량',
                community: '공동체역량',
            };
            for (const s of dto.storylines) {
                const label = categoryLabels[s.category] || s.category;
                sections.push(`### [${label}] 서사`);
                sections.push(s.summary + '\n');
            }
        }

        // 성장 키워드
        if (dto.storylineKeywords && dto.storylineKeywords.length > 0) {
            sections.push('## 기존 활동에서 도출된 핵심 키워드');
            sections.push(`이 학생이 기존에 보여준 키워드: ${dto.storylineKeywords.join(', ')}`);
            sections.push('→ 추천 주제는 이 키워드들과 자연스럽게 연결되어야 합니다.\n');
        }

        // 약점/보완 영역
        if (dto.weaknesses && dto.weaknesses.length > 0) {
            sections.push('## 보완이 필요한 영역');
            sections.push(`AI 분석 결과 이 학생에게 부족한 부분: ${dto.weaknesses.join(', ')}`);
            sections.push('→ 추천 주제 중 최소 1개는 이 약점을 자연스럽게 보완할 수 있는 주제여야 합니다.\n');
        }

        // 추천 활동
        if (dto.suggestedActivities && dto.suggestedActivities.length > 0) {
            sections.push('## 빌드업 분석에서 추천된 활동');
            sections.push('이 학생에게 기존에 추천된 활동들입니다. 이 활동들과 연관된 수행평가 주제를 추천해주세요.');
            for (const act of dto.suggestedActivities) {
                sections.push(`- ${act}`);
            }
            sections.push('');
        }

        // 현재 학년
        if (dto.currentGrade) {
            sections.push(`## 현재 학년: ${dto.currentGrade}학년`);
            sections.push(`${dto.currentGrade}학년 수준의 심화도에 맞는 주제를 추천해주세요.\n`);
        }

        return sections.length > 0 ? '\n\n' + sections.join('\n') : '';
    }

    async recommendTopics(dto: RecommendTopicDto): Promise<any> {
        if (!this.genAI) {
            throw new Error('Gemini API is not configured.');
        }

        const hasStorylineContext = !!(
            (dto.storylines && dto.storylines.length > 0) ||
            (dto.storylineKeywords && dto.storylineKeywords.length > 0) ||
            (dto.weaknesses && dto.weaknesses.length > 0)
        );

        const storylineContextBlock = this.buildStorylineContext(dto);

        const prompt = `당신은 대한민국 대학 입학 및 생기부 관리 컨설턴트입니다.
학생이 '${dto.subject}' 과목에서 '${dto.originalTopic}'이라는 기본 주제로 '${dto.taskType}' 과제를 수행해야 합니다.
이 학생의 목표 전공은 '${dto.major}'입니다.
${storylineContextBlock}
${hasStorylineContext
    ? `## 핵심 지침
위의 발달 서사(스토리라인)를 반드시 참고하여, 이 학생의 기존 성장 흐름의 **자연스러운 연장선**에 놓이는 주제를 추천해주세요.
- 기존에 탐구한 소재/키워드와 유기적으로 연결되는 주제
- 약점을 보완하면서도 서사의 일관성을 유지하는 주제
- 입학 사정관이 "이 학생의 활동 흐름이 일관되고 깊이 있다"고 평가할 수 있는 주제

## 추천할 주제 수: 3가지`
    : `학생의 목표 전공(${dto.major})과 수행평가 과목(${dto.subject})의 특성을 융합하여,
고등학생 수준에서 심도 있게 탐구할 수 있는 독창적이고 구체적인 전공 연계 심화 주제 3가지를 추천해주세요.`
}

## 출력 형식 (반드시 이 JSON 배열 형식으로만 응답)
[
  {
    "title": "주제명 (구체적이고 학술적인 톤)",
    "description": "이 주제를 어떻게 탐구하면 좋을지 2-3줄의 방향성 안내",
    "expectedEffect": "이 주제를 세특에 적었을 때 대학 입학 사정관에게 어필되는 역량 (예: 융합사고력, 전공이해도 등)"${hasStorylineContext ? `,
    "storylineConnection": "이 주제가 학생의 기존 발달 서사와 어떻게 자연스럽게 연결되는지 1문장 설명"` : ''}
  }
]`;

        this.logger.log(`세특 주제 추천 요청 - 과목: ${dto.subject}, 전공: ${dto.major}, 서사 컨텍스트: ${hasStorylineContext ? '있음' : '없음'}`);

        const model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-pro',
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        return JSON.parse(text);
    }

    async generateDraft(dto: GenerateDraftDto): Promise<any> {
        if (!this.genAI) {
            throw new Error('Gemini API is not configured.');
        }

        const activitiesText = dto.studentActivities.map(a => `- ${a}`).join('\n');

        const keywordsContext = (dto.storylineKeywords && dto.storylineKeywords.length > 0)
            ? `\n\n## 서사 연결 키워드\n이 학생의 발달 서사에서 도출된 핵심 키워드: ${dto.storylineKeywords.join(', ')}\n→ 아래 세특 초안에 이 키워드들을 자연스럽게 녹여넣어, 입학 사정관이 이 학생의 생기부 서사에서 일관된 성장 흐름을 느낄 수 있도록 작성하세요.`
            : '';

        const prompt = `당신은 고등학교 교사입니다. 학생이 '${dto.selectedTopic}'을 주제로 탐구를 진행했습니다.
학생이 제출한 구체적 활동 내용은 다음과 같습니다:

${activitiesText}
${keywordsContext}

이 내용을 바탕으로 학교생활기록부 세부능력 및 특기사항(세특)에 기재할 수 있는 
3~4문장 분량의 학술적이고 객관적인 평가 기록 초안을 작성해주세요. 
학생의 주도적인 탐구력과 전공적합성이 돋보이도록 작성해야 합니다.
단, 과장되거나 허위 사실 없이 학생이 제시한 활동 내용만을 기반으로 자연스럽게 문맥을 구성하세요.

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "draft": "작성된 세특 초안 텍스트 (줄바꿈 없이 한 문단으로)"
}`;

        const model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-pro',
            generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json',
            },
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        return JSON.parse(text);
    }
}
