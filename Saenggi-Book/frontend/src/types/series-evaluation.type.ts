/**
 * 계열 적합성 평가 관련 타입 정의
 */

export enum SeriesType {
  HUMANITIES = 'humanities',
  SCIENCE = 'science',
}

/**
 * 대학 레벨 정보
 */
export interface UniversityLevel {
  id: number;
  universityName: string;
  universityCode: string;
  level: number;
}

/**
 * 문과 계열 평가 기준
 */
export interface HumanitiesCriteria {
  id: number;
  level: number;
  universityCategory: string;
  korean: number;
  english: number;
  math: number;
  social: number;
  secondForeignLanguage: number;
  overallGradeRange?: string;
}

/**
 * 이과 계열 평가 기준
 */
export interface ScienceCriteria {
  id: number;
  level: number;
  universityCategory: string;
  statistics: number;
  calculus: number;
  geometry: number;
  aiMath: number;
  physics1: number;
  physics2: number;
  chemistry1: number;
  chemistry2: number;
  biology1: number;
  biology2: number;
  earthScience1: number;
  earthScience2: number;
}

/**
 * 학생 과목 성적
 */
export interface StudentSubjectGrade {
  subjectName: string;
  grade: number;
}

/**
 * 계열 적합성 계산 요청
 */
export interface CalculateSeriesEvaluationRequest {
  universityName: string;
  seriesType: SeriesType;
  middleSeries?: string;
  studentGrades: StudentSubjectGrade[];
}

/**
 * 과목별 평가 결과
 */
export interface SubjectEvaluation {
  subjectName: string;
  studentGrade: number;
  recommendedGrade: number;
  difference: number;
  riskScore: number;
  evaluation: string;
}

/**
 * 필수/권장 과목 수강 여부
 */
export interface SubjectRequirement {
  subjectName: string;
  taken: boolean;
  studentGrade?: number;
  evaluation?: string;
}

/**
 * 계열 적합성 계산 결과
 */
export interface CalculateSeriesEvaluationResponse {
  universityName: string;
  universityLevel: number;
  seriesType: SeriesType;
  totalRiskScore: number;
  overallEvaluation: string;
  subjectEvaluations: SubjectEvaluation[];
  improvementNeeded: string[];
  requiredSubjects?: SubjectRequirement[];
  recommendedSubjects?: SubjectRequirement[];
}
