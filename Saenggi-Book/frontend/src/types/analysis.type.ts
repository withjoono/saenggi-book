// 4대 역량 카테고리
export type CompetencyCategory = 'academic' | 'career' | 'community' | 'other';

// 소재의 근거 원문
export interface MaterialSource {
    type: 'subject' | 'creative' | 'behavior';
    grade: string;
    semester?: string;
    subjectName?: string;
    activityType?: string;
    originalText: string;
}

// 개별 소재
export interface MaterialItem {
    title: string;
    summary: string;
    category: CompetencyCategory;
    severity: 'high' | 'medium' | 'low';
    sources: MaterialSource[];
}

// 전체 분석 결과
export interface SchoolRecordAnalysis {
    materials: MaterialItem[];
    analysisDate: string;
    summary: string;
}

// 분석 요청 DTO (백엔드로 보내는 데이터)
export interface AnalyzeRequestDto {
    subjectTexts: Array<{ grade: string; semester: string; subjectName: string; text: string }>;
    creativeTexts: Array<{ grade: string; activityType: string; text: string }>;
    behaviorTexts: Array<{ grade: string; text: string }>;
}

// 역량별 라벨
export const COMPETENCY_LABELS: Record<CompetencyCategory, string> = {
    academic: '학업역량',
    career: '진로역량',
    community: '공동체역량',
    other: '기타역량',
};

// 역량별 색상
export const COMPETENCY_COLORS: Record<CompetencyCategory, string> = {
    academic: '#3b82f6',
    career: '#8b5cf6',
    community: '#10b981',
    other: '#f59e0b',
};

// 소재 출처 타입 라벨
export const SOURCE_TYPE_LABELS: Record<string, string> = {
    subject: '세특',
    creative: '창체',
    behavior: '행특',
};
