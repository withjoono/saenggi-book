export class RecommendTopicDto {
    major: string;
    subject: string;
    taskType: string;
    originalTopic: string;

    // === 서사 연결 컨텍스트 (선택) ===

    /** 스토리라인의 overall_storyline 요약 (학업/진로/공동체 3개 카테고리 모두) */
    storylines?: Array<{
        category: 'academic' | 'career' | 'community';
        summary: string;
    }>;

    /** 스토리라인에서 추출된 핵심 성장 키워드 */
    storylineKeywords?: string[];

    /** 빌드/평가 분석에서 도출된 약점/보완 영역 */
    weaknesses?: string[];

    /** 빌드/평가 분석에서 추천된 관련 활동 제목 목록 */
    suggestedActivities?: string[];

    /** 학생의 현재 학년 */
    currentGrade?: string;
}
