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

    async recommendTopics(dto: RecommendTopicDto): Promise<any> {
        if (!this.genAI) {
            throw new Error('Gemini API is not configured.');
        }

        const prompt = `당신은 대한민국 대학 입학 및 생기부 관리 컨설턴트입니다.
학생이 '${dto.subject}' 과목에서 '${dto.originalTopic}'이라는 기본 주제로 '${dto.taskType}' 과제를 수행해야 합니다.
이 학생의 목표 전공은 '${dto.major}'입니다.

학생의 목표 전공(${dto.major})과 수행평가 과목(${dto.subject})의 특성을 융합하여,
고등학생 수준에서 심도 있게 탐구할 수 있는 독창적이고 구체적인 전공 연계 심화 주제 3가지를 추천해주세요.

## 출력 형식 (반드시 이 JSON 배열 형식으로만 응답)
[
  {
    "title": "주제명 (구체적이고 학술적인 톤)",
    "description": "이 주제를 어떻게 탐구하면 좋을지 2-3줄의 방향성 안내",
    "expectedEffect": "이 주제를 세특에 적었을 때 대학 입학 사정관에게 어필되는 역량 (예: 융합사고력, 전공이해도 등)"
  }
]`;

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

        const prompt = `당신은 고등학교 교사입니다. 학생이 '${dto.selectedTopic}'을 주제로 탐구를 진행했습니다.
학생이 제출한 구체적 활동 내용은 다음과 같습니다:

${activitiesText}

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
