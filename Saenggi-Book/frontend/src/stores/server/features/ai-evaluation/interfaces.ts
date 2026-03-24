/**
 * AI 사정관 평가 결과 인터페이스
 * (sv_ai_evaluation 테이블 대응)
 */

export interface IAiEvaluationAnnotation {
  category: 'academic' | 'career' | 'community' | 'other';
  comment: string;
  strengths: string[];
  weaknesses: string[];
  advice: string[];
}

export interface IAiEvaluationQuestionScore {
  questionId: number;
  score: number;
  reason: string;
}

export interface IAiEvaluationMaterial {
  title: string;
  summary: string;
  category: 'academic' | 'career' | 'community' | 'other';
  gradeLevel: number;
  score: number;
  relatedKeywords: string[];
  sourceTypes?: string[];
}

export interface IAiEvaluation {
  id: number;
  memberId: string;
  evalType: 'semester' | 'comprehensive';
  grade: string;
  semester: string | null;
  targetSeries: string | null;
  totalScore: number | null;
  scoreAcademic: number;
  scoreCareer: number;
  scoreCommunity: number;
  scoreOther: number;
  summary: string;
  strengths: string[] | null;
  weaknesses: string[] | null;
  advice: string[] | null;
  annotations: IAiEvaluationAnnotation[] | null;
  materials: IAiEvaluationMaterial[] | null;
  questionScores: IAiEvaluationQuestionScore[] | null;
  createdAt: string;
}
