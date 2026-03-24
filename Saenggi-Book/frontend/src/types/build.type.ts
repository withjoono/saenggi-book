// ==================== 빌드 분석 관련 타입 ====================

import { CompetencyCategory, MaterialItem } from './analysis.type';

// 빌드 분석 요청 DTO
export interface BuildAnalyzeRequestDto {
    targetUniversity: string;
    targetMajor: string;
    currentGrade: string;
    currentSemester: string;
    admissionType?: string;
    materials: MaterialItem[];
}

// Gap 분석 점수
export interface GapScore {
    category: CompetencyCategory;
    label: string;
    current: number;
    target: number;
    gap: number;
    comment: string;
}

// 활동 추천
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

// 로드맵 항목
export interface RoadmapItem {
    semester: string;
    theme: string;
    activities: string[];
    goals: string[];
    isCurrent: boolean;
}

// 빌드 분석 전체 결과
export interface BuildAnalysisResult {
    gapAnalysis: GapScore[];
    recommendations: ActivityRecommendation[];
    roadmap: RoadmapItem[];
    overallScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    analysisDate: string;
}

// 활동 타입 라벨
export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
    club: '🏫 동아리',
    reading: '📚 독서',
    research: '🔬 탐구/소논문',
    volunteer: '🌍 봉사',
    creative: '🎨 창의적체험',
    competition: '🏆 대회',
    other: '📌 기타',
};

// 우선순위 라벨
export const PRIORITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    high: { label: '🔥 높음', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    medium: { label: '⚡ 보통', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    low: { label: '💡 낮음', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
};
