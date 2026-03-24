// ==================== 학기별 평가 타입 ====================

export type CompetencyCategory = 'academic' | 'career' | 'community' | 'other';

/** 7등급 색상 */
export const GRADE_LEVEL_COLORS: Record<number, string> = {
    1: '#7C3AED', // 보라 — 독보적
    2: '#2563EB', // 파랑 — 매우 강함
    3: '#059669', // 초록 — 강함
    4: '#D97706', // 황색 — 평균 이상
    5: '#EA580C', // 주황 — 보통
    6: '#DC2626', // 빨강 — 약함
    7: '#6B7280', // 회색 — 형식적
};

export const GRADE_LEVEL_LABELS: Record<number, string> = {
    1: '1등급 (독보적)',
    2: '2등급 (매우 강)',
    3: '3등급 (강함)',
    4: '4등급 (평균 이상)',
    5: '5등급 (보통)',
    6: '6등급 (약함)',
    7: '7등급 (형식적)',
};

export const EVAL_COMPETENCY_LABELS: Record<CompetencyCategory, string> = {
    academic: '학업역량',
    career: '진로역량',
    community: '공동체역량',
    other: '기타역량',
};

export const EVAL_COMPETENCY_COLORS: Record<CompetencyCategory, string> = {
    academic: '#3b82f6',
    career: '#8b5cf6',
    community: '#10b981',
    other: '#f59e0b',
};

// ── 소재 ──

export interface EvalMaterialSource {
    type: 'subject' | 'creative' | 'behavior';
    grade: string;
    semester?: string;
    subjectName?: string;
    activityType?: string;
    originalText: string;
}

export interface EvalMaterialItem {
    title: string;
    summary: string;
    category: CompetencyCategory;
    gradeLevel: number;       // 1~7등급
    score: number;             // 7~1점
    sources: EvalMaterialSource[];
    relatedKeywords: string[];
}

// ── 학기별 결과 ──

export interface SemesterEvalResult {
    grade: string;
    semester: string;
    materials: EvalMaterialItem[];
    scores: Record<CompetencyCategory, number>;
    summary: string;
    analysisDate: string;
}

// ── 종합 결과 ──

export interface ComprehensiveEvalResult {
    grade: string;
    materials: EvalMaterialItem[];
    scores: Record<CompetencyCategory, number>;
    totalScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    advice: string[];
    annotations: Array<{
        category: CompetencyCategory;
        comment: string;
        strengths?: string[];
        weaknesses?: string[];
        advice?: string[];
    }>;
    questionScores: Array<{
        questionId: number;
        score: number;
        reason: string;
    }>;
    analysisDate: string;
}

// ── 요청 DTO ──

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
