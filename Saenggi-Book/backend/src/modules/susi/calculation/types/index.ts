// @ts-nocheck
/**
 * 수시 교과전형 환산점수 계산 타입 정의
 */

// ========== 환산 공식 타입 ==========

/**
 * 대학별 환산 공식
 */
export interface CalculationFormula {
  id: number;
  year: number;
  university_name: string;
  university_code?: string;

  // 반영 학기
  reflection_semesters?: string;

  // 학년별 반영비율
  grade_1_ratio: number;
  grade_2_ratio: number;
  grade_3_ratio: number;

  // 교과별 반영비율
  korean_ratio: number;
  english_ratio: number;
  math_ratio: number;
  social_ratio: number;
  science_ratio: number;
  etc_ratio: number;

  // 반영 과목 수
  reflection_subject_count?: number;
  reflection_subject_detail?: string;

  // 등급별 환산점수 테이블
  grade_conversion_table?: Record<string, number>;

  // 진로선택과목 환산 방식
  career_subject_conversion?: string;
  career_grade_conversion_table?: Record<string, number>;

  // 출결/봉사
  attendance_score: number;
  volunteer_score: number;

  // 만점
  max_score: number;

  // 비고
  remarks?: string;
  is_active: boolean;
}

// ========== 사용자 내신 데이터 타입 ==========

/**
 * 학생부 과목 성적 (sv_subject_learning에서 조회)
 */
export interface SubjectGrade {
  id: number;
  subject_name: string;
  main_subject_name: string; // 교과명 (국어, 수학, 영어 등)
  semester: string; // 1-1, 1-2, 2-1, 2-2, 3-1, 3-2
  grade: string; // 등급 (1-9)
  unit: string; // 단위수
  raw_score?: string;
  ranking?: string;
  students_num?: string;
  standard_deviation?: string;
  sub_subject_average?: string;
  achievement?: string; // 진로선택과목 성취도 (A, B, C)
}

/**
 * 학년별로 그룹화된 성적 데이터
 */
export interface GradesByYear {
  year1: SubjectGrade[];
  year2: SubjectGrade[];
  year3: SubjectGrade[];
}

/**
 * 교과별로 그룹화된 성적 데이터
 */
export interface GradesBySubject {
  korean: SubjectGrade[]; // 국어
  english: SubjectGrade[]; // 영어
  math: SubjectGrade[]; // 수학
  social: SubjectGrade[]; // 사회
  science: SubjectGrade[]; // 과학
  etc: SubjectGrade[]; // 기타 (제2외국어, 한문 등)
}

/**
 * 사용자 내신 데이터 전체 (그룹화 포함)
 */
export interface MemberGradeData {
  memberId: string | number;
  grades: SubjectGrade[];
  byYear: GradesByYear;
  bySubject: GradesBySubject;
}

// ========== 계산 결과 타입 ==========

/**
 * 반영된 과목 상세 정보
 */
export interface ReflectedSubjectInfo {
  subject_name: string;
  main_subject_name: string;
  semester: string;
  grade: number;
  converted_score: number;
  unit: number;
}

/**
 * 대학별 환산점수 계산 결과
 */
export interface UniversityCalculatedScore {
  success: boolean;
  failure_reason?: string;

  university_name: string;
  year?: number;

  // 환산점수
  converted_score: number;
  max_score: number;
  score_percentage: number;

  // 평균 등급
  average_grade: number;
  grade_1_average?: number;
  grade_2_average?: number;
  grade_3_average?: number;

  // 교과별 점수
  korean_score: number;
  korean_average_grade?: number;
  english_score: number;
  english_average_grade?: number;
  math_score: number;
  math_average_grade?: number;
  social_score: number;
  social_average_grade?: number;
  science_score: number;
  science_average_grade?: number;
  etc_score: number;

  // 반영 과목 정보
  reflected_subject_count: number;
  reflected_subjects: ReflectedSubjectInfo[];

  // 출결/봉사
  attendance_score: number;
  volunteer_score: number;
}

/**
 * 모집단위별 환산점수 계산 결과
 */
export interface RecruitmentScoreResult {
  success: boolean;
  failure_reason?: string;

  susi_subject_id: number;
  university_name: string;
  recruitment_name: string;
  type_name?: string;
  basic_type?: string;
  detailed_type?: string;
  department?: string;
  year?: number;

  // 환산점수
  converted_score: number;
  max_score?: number;
  score_percentage?: number;

  // 평균 등급
  average_grade?: number;

  // 위험도 및 등급컷
  risk_score?: number;
  grade_cut_50?: number;
  grade_cut_70?: number;
  grade_difference?: number;

  // 작년 입시결과
  last_year_avg_grade?: number;
  last_year_min_grade?: number;
  last_year_competition_rate?: number;
}

// ========== API 응답 타입 ==========

/**
 * 환산점수 계산 API 응답
 */
export interface CalculateScoresResponse {
  success: boolean;
  message: string;
  total_universities: number;
  success_count: number;
  failure_count: number;
  university_scores: UniversityCalculatedScore[];
  recruitment_scores?: RecruitmentScoreResult[];
  calculated_at: Date;
}

// ========== 교과명 매핑 ==========

/**
 * 학생부 교과명 → 시스템 교과 분류 매핑
 */
export const SUBJECT_CATEGORY_MAP: Record<string, keyof GradesBySubject> = {
  국어: 'korean',
  영어: 'english',
  수학: 'math',
  사회: 'social',
  역사: 'social',
  도덕: 'social',
  윤리: 'social',
  한국사: 'social',
  과학: 'science',
  물리학: 'science',
  화학: 'science',
  생명과학: 'science',
  지구과학: 'science',
  '제2외국어': 'etc',
  한문: 'etc',
  교양: 'etc',
  기술가정: 'etc',
  정보: 'etc',
  체육: 'etc',
  음악: 'etc',
  미술: 'etc',
};

/**
 * 학기 → 학년 변환
 */
export function getSemesterYear(semester: string): 1 | 2 | 3 | null {
  if (!semester) return null;
  const match = semester.match(/^(\d)/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  if (year >= 1 && year <= 3) return year as 1 | 2 | 3;
  return null;
}

/**
 * 교과명으로 교과 분류 찾기
 */
export function getSubjectCategory(mainSubjectName: string): keyof GradesBySubject {
  if (!mainSubjectName) return 'etc';

  // 정확히 일치하는 경우
  if (SUBJECT_CATEGORY_MAP[mainSubjectName]) {
    return SUBJECT_CATEGORY_MAP[mainSubjectName];
  }

  // 부분 일치 확인
  const lowerName = mainSubjectName.toLowerCase();
  for (const [key, category] of Object.entries(SUBJECT_CATEGORY_MAP)) {
    if (lowerName.includes(key.toLowerCase())) {
      return category;
    }
  }

  return 'etc';
}
