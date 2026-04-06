export interface RecommendTopicRequestDto {
    major: string;
    subject: string;
    taskType: string;
    originalTopic: string;

    // === 서사 연결 컨텍스트 (선택) ===
    storylines?: Array<{
        category: 'academic' | 'career' | 'community';
        summary: string;
    }>;
    storylineKeywords?: string[];
    weaknesses?: string[];
    suggestedActivities?: string[];
    currentGrade?: string;
}

export interface RecommendedTopic {
    title: string;
    description: string;
    expectedEffect: string;
    /** 서사 컨텍스트가 있을 때만 반환되는 서사 연결 설명 */
    storylineConnection?: string;
}

export interface GenerateDraftRequestDto {
    selectedTopic: string;
    studentActivities: string[];
    /** 서사 연결 키워드 */
    storylineKeywords?: string[];
}

export interface GenerateDraftResponse {
    draft: string;
}

import { EvalMaterialItem } from "./evaluation.type";

/** SetukWizard에 전달하는 서사 컨텍스트 */
export interface StorylineContext {
    /** 선택한 평가 결과 ID */
    evaluationId: number;
    /** 평가 결과 요약 */
    evaluationSummary: string;
    /** 대상 계열 */
    targetSeries?: string;
    /** 3개 카테고리별 스토리라인 요약 */
    storylines: Array<{
        category: 'academic' | 'career' | 'community';
        summary: string;
    }>;
    /** 스토리라인에서 추출된 핵심 성장 키워드 */
    storylineKeywords: string[];
    /** 약점 */
    weaknesses: string[];
    /** 개선 조언 */
    advice: string[];
    /** 추천 활동 */
    suggestedActivities: string[];
    /** 학생의 현재 학년 */
    currentGrade?: string;
    /** 소재 트리 데이터 (역량별 소재 목록) */
    materials?: EvalMaterialItem[];
}
