/**
 * Semester Evaluation Service — 학기별 세특 평가 (7등급)
 * 
 * 학기별 세특 텍스트를 분석하여 7등급 소재를 추출합니다.
 * - 학기 단위: 세특만 분석
 * - 종합 단위: 세특 + 창체 + 행특 분석 + 점수 합산 + 조언
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PrismaService } from 'src/database/prisma.service';

// ==================== Types ====================

export type CompetencyCategory = 'academic' | 'career' | 'community' | 'other';

export interface EvalMaterialSource {
    type: 'subject' | 'creative' | 'behavior';
    grade: string;
    semester?: string;
    subjectName?: string;
    activityType?: string;
    originalText: string;
}

/** 7등급 소재 */
export interface EvalMaterialItem {
    title: string;
    summary: string;
    category: CompetencyCategory;
    gradeLevel: number;      // 1~7등급 (1=최우수)
    score: number;            // 7~1점 (8-gradeLevel)
    sources: EvalMaterialSource[];
    relatedKeywords: string[]; // 학기 간 연결용 키워드
}

/** 학기별 세특 평가 결과 */
export interface SemesterEvalResult {
    grade: string;
    semester: string;
    materials: EvalMaterialItem[];
    scores: {
        academic: number;
        career: number;
        community: number;
        other: number;
    };
    summary: string;
    analysisDate: string;
}

/** 종합 평가 결과 (1년치) */
export interface ComprehensiveEvalResult {
    grade: string;
    materials: EvalMaterialItem[];
    scores: {
        academic: number;
        career: number;
        community: number;
        other: number;
    };
    totalScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    advice: string[];          // 다음 학기 조언
    annotations: Array<{      // 주석
        category: CompetencyCategory;
        comment: string;
        strengths: string[];
        weaknesses: string[];
        advice: string[];
    }>;
    questionScores: Array<{
        questionId: number;
        score: number;
        reason: string;
    }>;
    analysisDate: string;
}

// ==================== Request DTOs ====================

export interface SemesterEvalRequestDto {
    grade: string;
    semester: string;
    subjectTexts: Array<{ subjectName: string; text: string }>;
}

export interface ComprehensiveEvalRequestDto {
    grade: string;
    targetSeries?: string; // 목표 계열 (예: "자연과학>물리>물리학")
    subjectTexts: Array<{ semester: string; subjectName: string; text: string }>;
    creativeTexts: Array<{ activityType: string; text: string }>;
    behaviorTexts: Array<{ text: string }>;
}

// ==================== Service ====================

@Injectable()
export class SemesterEvalService {
    private readonly logger = new Logger(SemesterEvalService.name);
    private geminiModel: GenerativeModel | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            this.logger.log('Gemini client initialized for SemesterEvalService');
        } else {
            this.logger.warn('GEMINI_API_KEY not configured - evaluation disabled');
        }
    }

    // ── 학기별 세특 평가 ──

    private buildSemesterPrompt(dto: SemesterEvalRequestDto): string {
        let inputData = '';
        dto.subjectTexts.forEach((s, i) => {
            inputData += `[${i}] ${dto.grade}학년 ${dto.semester}학기 / ${s.subjectName}\n${s.text}\n\n`;
        });

        return `당신은 대한민국 대학 입학 사정관 관점에서 학생의 세부능력 및 특기사항(세특)을 평가하는 전문가입니다.

아래의 ${dto.grade}학년 ${dto.semester}학기 세특 데이터를 분석하여, 핵심 소재를 7등급으로 평가해주세요.

## 7등급 평가 기준
- 1등급(7점): 독보적·차별화된 핵심 소재, 심층적 탐구와 성과
- 2등급(6점): 매우 강한 어필 포인트, 전공 적합성 높음
- 3등급(5점): 강한 어필 포인트, 꾸준한 노력 드러남
- 4등급(4점): 평균 이상, 의미 있는 활동
- 5등급(3점): 보통 수준, 일반적 활동
- 6등급(2점): 약한 소재, 구체성 부족
- 7등급(1점): 형식적·일반적 기술

## 4대 역량 카테고리
- academic: 학업역량 (교과 학습, 탐구, 연구, 실험)
- career: 진로역량 (진로 탐색, 전공 적합성)
- community: 공동체역량 (리더십, 협업, 봉사, 소통)
- other: 기타역량 (창의성, 자기주도성, 독서, 도전)

## 세특 데이터
${inputData}

## 출력 형식 (반드시 JSON으로만 응답)
{
  "materials": [
    {
      "title": "소재 제목",
      "summary": "1-2줄 요약 설명",
      "category": "academic|career|community|other",
      "gradeLevel": 1~7,
      "relatedKeywords": ["키워드1", "키워드2"],
      "sourceIndices": [0, 2]
    }
  ],
  "summary": "이 학기 세특의 전체 한줄 특징 요약"
}

## 주의사항
1. 소재는 3~10개 추출
2. sourceIndices는 위 데이터의 [번호]
3. 각 카테고리 최소 1개 소재
4. relatedKeywords는 학기 간 연결에 사용됨 (예: "리더십", "데이터분석", "환경")`;
    }

    async evaluateSemester(dto: SemesterEvalRequestDto): Promise<SemesterEvalResult> {
        if (!this.geminiModel) {
            throw new Error('Gemini API key not configured');
        }

        if (dto.subjectTexts.length === 0) {
            throw new Error('세특 데이터가 없습니다.');
        }

        this.logger.log(`[SemesterEval] ${dto.grade}학년 ${dto.semester}학기 분석 시작 (${dto.subjectTexts.length}개 과목)`);

        const prompt = this.buildSemesterPrompt(dto);

        const response = await this.geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
            },
        });

        const content = response.response.text();
        if (!content) throw new Error('AI 응답이 비어있습니다.');

        const parsed = JSON.parse(content);

        // sourceIndices → EvalMaterialSource[] 변환
        const materials: EvalMaterialItem[] = (parsed.materials || []).map((m: any) => ({
            title: m.title,
            summary: m.summary,
            category: m.category as CompetencyCategory,
            gradeLevel: Math.max(1, Math.min(7, m.gradeLevel || 4)),
            score: 8 - Math.max(1, Math.min(7, m.gradeLevel || 4)),
            relatedKeywords: m.relatedKeywords || [],
            sources: (m.sourceIndices || []).map((idx: number) => {
                const src = dto.subjectTexts[idx];
                if (!src) return null;
                return {
                    type: 'subject' as const,
                    grade: dto.grade,
                    semester: dto.semester,
                    subjectName: src.subjectName,
                    originalText: src.text,
                };
            }).filter(Boolean),
        }));

        // 영역별 점수 합산
        const scores = { academic: 0, career: 0, community: 0, other: 0 };
        materials.forEach(m => {
            scores[m.category] += m.score;
        });

        return {
            grade: dto.grade,
            semester: dto.semester,
            materials,
            scores,
            summary: parsed.summary || '',
            analysisDate: new Date().toISOString(),
        };
    }

    // ── 종합 평가 (세특 + 창체 + 행특) ──

    private buildComprehensivePrompt(dto: ComprehensiveEvalRequestDto): string {
        let inputData = '';
        let idx = 0;

        if (dto.subjectTexts.length > 0) {
            inputData += '=== 세부능력 및 특기사항 (세특) ===\n';
            for (const s of dto.subjectTexts) {
                inputData += `[${idx}] ${dto.grade}학년 ${s.semester}학기 / ${s.subjectName}\n${s.text}\n\n`;
                idx++;
            }
        }

        if (dto.creativeTexts.length > 0) {
            inputData += '=== 창의적 체험활동 (창체) ===\n';
            for (const c of dto.creativeTexts) {
                inputData += `[${idx}] ${dto.grade}학년 / ${c.activityType}\n${c.text}\n\n`;
                idx++;
            }
        }

        if (dto.behaviorTexts.length > 0) {
            inputData += '=== 행동특성 및 종합의견 (행특) ===\n';
            for (const b of dto.behaviorTexts) {
                inputData += `[${idx}] ${dto.grade}학년\n${b.text}\n\n`;
                idx++;
            }
        }

        const seriesContext = dto.targetSeries
            ? `\n\n## 목표 계열\n학생의 목표 계열은 「${dto.targetSeries}」입니다. 이 계열의 관점에서 전공 적합성을 중점 평가해주세요. 해당 계열에서 요구하는 역량과 소재가 생기부에 어떻게 드러나는지를 분석하고, 계열 적합성에 대한 조언도 포함해주세요.`
            : '';

        return `당신은 대한민국 대학 입학 사정관 관점에서 학생의 생기부를 종합 평가하는 전문가입니다.

아래의 ${dto.grade}학년 전체(세특 + 창체 + 행특) 데이터를 종합 분석하여:
1. 핵심 소재를 7등급으로 평가
2. 40개 세부 평가항목에 대해 각각 1~7점 채점
3. 4대 역량별 점수와 주석(코멘트)
4. 강점/약점/개선 조언을 제공해주세요.${seriesContext}

## 7등급 평가 기준
- 1점: 형식적·일반적 기술
- 2점: 약한 소재, 구체성 부족
- 3점: 보통 수준, 일반적 활동
- 4점: 평균 이상, 의미 있는 활동
- 5점: 강한 어필 포인트, 꾸준한 노력 드러남
- 6점: 매우 강한 어필 포인트, 전공 적합성 높음
- 7점: 독보적·차별화된 핵심 소재, 심층적 탐구와 성과

## 40개 세부 평가 질문
[진로역량]
Q1: 전공(계열)과 관련된 과목을 적절하게 선택하고, 이수한 과목은 얼마나 되는가?
Q2: 전공(계열)과 관련된 과목을 이수하기 위하여 추가적인 노력을 하였는가?
Q3: 전공(계열)과 관련된 교과의 성취수준은 적절한가?
Q4: 진로와학(반)지도/선택과목 교육 학습단계(위계)에 따른 이수현황은?
Q5: 전공(계열)관련 과목에서 전공에 대한 관심과 이해가 드러나 있는가?
Q6: 전공 분야에 대한 궁금증이나 학업 관련 관심이 있는가?
Q7: 전공 분야나 관련 과목에서 적극적이고 구체적인 노력과 활동을 하였는가?

[학업역량]
Q8: 대학 수학에 필요한 기본 교과목의 교과성적은 적절한가?
Q9: 학기별/학년별 성적의 추이는 어떠한가?
Q10: 성취동기와 목표의식을 가지고 자발적으로 학습하려는 의지가 있는가?
Q11: 새로운 지식을 회득하기 위해 자기주도적으로 노력하고 있는가?
Q12: 교과 수업에 적극적으로 참여해 수업 내용을 이해하려는 태도와 열정이 있는가?
Q13: 교과와 각종 탐구활동 등을 통해 지식을 확장하려고 노력하고 있는가?
Q14: 교과와 각종 탐구활동에서 구체적인 성과를 보이고 있는가?
Q15: 교내 활동에서 학문에 대한 열의와 지적 관심이 드러나고 있는가?

[공동체역량]
Q16: 단체 활동 과정에서 서로 돕고 함께 행동하는 모습이 보이는가?
Q17: 구성원들과 협력을 통하여 공동의 과제를 수행하고 완성한 경험이 있는가?
Q18: 타인의 의견에 공감하고 수용하는 태도를 보이며, 자신의 정보와 생각을 잘 전달하는가?
Q19: 학교생활 속에서 나눔을 생활화한 경험이 있는가?
Q20: 타인을 위하여 양보하거나 배려를 실천한 구체적 경험이 있는가?
Q21: 상대를 이해하고 존중하는 노력을 기울이고 있는가?
Q22: 교내 활동에서 자신이 맡은 역할에 최선을 다하려고 노력한 경험이 있는가?
Q23: 자신이 속한 공동체가 정한 규칙과 규정을 준수하고 있는가?
Q24: 공동체의 목표를 달성하기 위해 계획하고 실행을 주도한 경험이 있는가?
Q25: 구성원들의 인정과 신뢰를 바탕으로 참여를 이끌어내고 조율한 경험이 있는가?

[기타역량]
Q26: 교내 다양한 활동에서 주도적, 적극적으로 활동을 수행하는가?
Q27: 새로운 과제를 주도적으로 만들고 성과를 내었는가?
Q28: 기존에 경험한 내용을 바탕으로 스스로 외연을 확장하려고 노력하였는가?
Q29: 자율, 동아리, 봉사, 진로활동 등 체험활동을 통해 다양한 경험을 쌓았는가?
Q30: 독서활동을 통해 다양한 영역에서 지식과 문화적 소양을 쌓았는가?
Q31: 예체능 영역에서 적극적이고 성실하게 참여하였는가?
Q32: 자신의 목표를 위해 도전한 경험을 통해 성취한 적이 있는가?
Q33: 교내 행동 과정에서 창의적인 발상을 통해 일을 진행한 경험이 있는가?
Q34: 교내 활동 과정에서 나타나는 문제점을 적극적으로 해결하기 위해 노력하였는가?
Q35: 주어진 교육환경을 극복하거나 충분히 활용한 경험이 있는가?
Q36: 교직에 대한 흥미와 관심이 드러나는가?
Q37: 교직 수행을 위한 다양한 경험이 있는가?
Q38: 교직 활동을 위한 리더십 및 자기주도성이 있는가?
Q39: 다문화 역량, 글로벌 역량이 드러나는가?
Q40: 범지구적 공동체 문제에 관심을 가지고 문제 해결에 참여하고자 하는가?

## 4대 역량 카테고리
- academic: 학업역량 (Q8~Q15)
- career: 진로역량 (Q1~Q7)
- community: 공동체역량 (Q16~Q25)
- other: 기타역량 (Q26~Q40)

## 분석 대상 데이터
${inputData}

## 출력 형식 (반드시 JSON으로만 응답)
{
  "materials": [
    {
      "title": "소재 제목",
      "summary": "1-2줄 요약",
      "category": "academic|career|community|other",
      "gradeLevel": 1~7,
      "relatedKeywords": ["키워드1", "키워드2"],
      "sourceIndices": [0, 3, 5],
      "sourceType": "subject|creative|behavior"
    }
  ],
  "questionScores": [
    { "questionId": 1, "score": 5, "reason": "생기부에서 드러나는 근거를 한줄로" },
    { "questionId": 2, "score": 3, "reason": "..." }
  ],
  "summary": "종합 생기부 한줄 평가",
  "strengths": ["강점1", "강점2"],
  "weaknesses": ["약점1", "약점2"],
  "advice": ["다음 학기 조언1", "조언2", "조언3"],
  "annotations": [
    { "category": "academic", "comment": "학업역량 코멘트", "strengths": ["강점"], "weaknesses": ["약점"], "advice": ["조언"] },
    { "category": "career", "comment": "진로역량 코멘트", "strengths": ["강점"], "weaknesses": ["약점"], "advice": ["조언"] },
    { "category": "community", "comment": "공동체역량 코멘트", "strengths": ["강점"], "weaknesses": ["약점"], "advice": ["조언"] },
    { "category": "other", "comment": "기타역량 코멘트", "strengths": ["강점"], "weaknesses": ["약점"], "advice": ["조언"] }
  ]
}

## 주의사항
1. 소재는 5~15개 추출 (세특, 창체, 행특을 모두 포함)
2. sourceIndices는 위 데이터의 [번호]
3. 각 카테고리 최소 1개 소재
4. questionScores 배열은 반드시 Q1~Q40 총 40개 항목이어야 합니다
5. 각 질문에 대해 생기부에서 근거를 찾아 1~7점 채점하고, 근거가 없으면 1점 부여
6. reason은 생기부에서 해당 점수를 부여한 근거를 간결하게 작성
7. annotations는 4대 역량 각각에 대한 종합 주석 (역량별 강점/약점/조언 포함)
8. 상위 strengths/weaknesses/advice는 전체 종합, annotations 안의 것은 해당 역량에 한정
9. advice에는 점수가 낮은 항목을 개선하기 위한 구체적 생기부 작성 전략을 포함`;
    }

    async evaluateComprehensive(dto: ComprehensiveEvalRequestDto): Promise<ComprehensiveEvalResult> {
        if (!this.geminiModel) {
            throw new Error('Gemini API key not configured');
        }

        const totalTexts = dto.subjectTexts.length + dto.creativeTexts.length + dto.behaviorTexts.length;
        if (totalTexts === 0) {
            throw new Error('분석할 데이터가 없습니다.');
        }

        this.logger.log(`[ComprehensiveEval] ${dto.grade}학년 종합 분석 시작 (세특:${dto.subjectTexts.length}, 창체:${dto.creativeTexts.length}, 행특:${dto.behaviorTexts.length})`);

        const prompt = this.buildComprehensivePrompt(dto);

        const response = await this.geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
            },
        });

        const content = response.response.text();
        if (!content) throw new Error('AI 응답이 비어있습니다.');

        const parsed = JSON.parse(content);

        // 원문 인덱스 매핑용 배열 구성
        const allSources: EvalMaterialSource[] = [];
        for (const s of dto.subjectTexts) {
            allSources.push({ type: 'subject', grade: dto.grade, semester: s.semester, subjectName: s.subjectName, originalText: s.text });
        }
        for (const c of dto.creativeTexts) {
            allSources.push({ type: 'creative', grade: dto.grade, activityType: c.activityType, originalText: c.text });
        }
        for (const b of dto.behaviorTexts) {
            allSources.push({ type: 'behavior', grade: dto.grade, originalText: b.text });
        }

        const materials: EvalMaterialItem[] = (parsed.materials || []).map((m: any) => ({
            title: m.title,
            summary: m.summary,
            category: m.category as CompetencyCategory,
            gradeLevel: Math.max(1, Math.min(7, m.gradeLevel || 4)),
            score: 8 - Math.max(1, Math.min(7, m.gradeLevel || 4)),
            relatedKeywords: m.relatedKeywords || [],
            sources: (m.sourceIndices || []).map((idx: number) => allSources[idx]).filter(Boolean),
        }));

        const scores = { academic: 0, career: 0, community: 0, other: 0 };
        materials.forEach(m => { scores[m.category] += m.score; });

        const totalScore = scores.academic + scores.career + scores.community + scores.other;

        return {
            grade: dto.grade,
            materials,
            scores,
            totalScore,
            summary: parsed.summary || '',
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            advice: parsed.advice || [],
            annotations: (parsed.annotations || []).map((a: any) => ({
                category: a.category as CompetencyCategory,
                comment: a.comment,
                strengths: a.strengths || [],
                weaknesses: a.weaknesses || [],
                advice: a.advice || [],
            })),
            questionScores: (parsed.questionScores || parsed.question_scores || []).map((q: any) => ({
                questionId: q.questionId ?? q.question_id,
                score: Math.max(1, Math.min(7, q.score || 1)),
                reason: q.reason || '',
            })),
            analysisDate: new Date().toISOString(),
        };
    }

    // ── DB 저장 / 조회 ──

    /**
     * 평가 결과를 DB에 저장
     */
    async saveEvaluation(
        memberId: string,
        evalType: 'semester' | 'comprehensive',
        dto: SemesterEvalRequestDto | ComprehensiveEvalRequestDto,
        result: SemesterEvalResult | ComprehensiveEvalResult,
    ): Promise<void> {
        try {
            // materials에서 originalText 제거 (DB 용량 절약)
            const materialsForDb = (result.materials || []).map(m => ({
                title: m.title,
                summary: m.summary,
                category: m.category,
                gradeLevel: m.gradeLevel,
                score: m.score,
                relatedKeywords: m.relatedKeywords,
                sourceTypes: m.sources.map(s => s.type),
            }));

            const comprehensiveResult = result as ComprehensiveEvalResult;
            const semesterDto = dto as SemesterEvalRequestDto;
            const comprehensiveDto = dto as ComprehensiveEvalRequestDto;

            await this.prisma.sv_ai_evaluation.create({
                data: {
                    member_id: memberId,
                    eval_type: evalType,
                    grade: result.grade,
                    semester: evalType === 'semester' ? semesterDto.semester : null,
                    target_series: evalType === 'comprehensive' ? comprehensiveDto.targetSeries || null : null,
                    total_score: comprehensiveResult.totalScore ?? null,
                    score_academic: result.scores.academic,
                    score_career: result.scores.career,
                    score_community: result.scores.community,
                    score_other: result.scores.other,
                    summary: result.summary || '',
                    strengths: comprehensiveResult.strengths ?? null,
                    weaknesses: comprehensiveResult.weaknesses ?? null,
                    advice: comprehensiveResult.advice ?? null,
                    annotations: comprehensiveResult.annotations ?? null,
                    materials: materialsForDb,
                    question_scores: comprehensiveResult.questionScores ?? null,
                },
            });

            this.logger.log(`[SaveEval] ${evalType} 평가 저장 완료 (member: ${memberId}, grade: ${result.grade})`);
        } catch (error) {
            this.logger.error(`[SaveEval] DB 저장 실패: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 회원의 평가 내역 조회 (최신순 20개)
     */
    async getEvalHistory(memberId: string) {
        return this.prisma.sv_ai_evaluation.findMany({
            where: { member_id: memberId },
            orderBy: { created_at: 'desc' },
            take: 20,
        });
    }
}
