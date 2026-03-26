// @ts-nocheck
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 반영된 과목 상세 정보 DTO
 */
export class ReflectedSubjectDto {
  @ApiProperty({ description: '과목명', example: '국어' })
  subject_name: string;

  @ApiProperty({ description: '교과명', example: '국어' })
  main_subject_name: string;

  @ApiProperty({ description: '학기', example: '1-1' })
  semester: string;

  @ApiProperty({ description: '등급', example: 2 })
  grade: number;

  @ApiProperty({ description: '환산점수', example: 96 })
  converted_score: number;

  @ApiProperty({ description: '단위수', example: 3 })
  unit: number;
}

/**
 * 대학별 환산점수 응답 DTO
 */
export class UniversityScoreResponseDto {
  @ApiProperty({ description: '계산 성공 여부', example: true })
  success: boolean;

  @ApiPropertyOptional({ description: '실패 사유', example: '내신 데이터 부족' })
  failure_reason?: string;

  @ApiProperty({ description: '대학명', example: '서울대학교' })
  university_name: string;

  @ApiPropertyOptional({ description: '적용 연도', example: 2026 })
  year?: number;

  @ApiProperty({ description: '최종 환산점수', example: 985.5 })
  converted_score: number;

  @ApiProperty({ description: '환산점수 만점', example: 1000 })
  max_score: number;

  @ApiProperty({ description: '환산점수 비율 (%)', example: 98.55 })
  score_percentage: number;

  @ApiProperty({ description: '전체 평균 등급', example: 1.8 })
  average_grade: number;

  @ApiPropertyOptional({ description: '1학년 평균 등급', example: 2.1 })
  grade_1_average?: number;

  @ApiPropertyOptional({ description: '2학년 평균 등급', example: 1.7 })
  grade_2_average?: number;

  @ApiPropertyOptional({ description: '3학년 평균 등급', example: 1.5 })
  grade_3_average?: number;

  @ApiProperty({ description: '국어 환산점수', example: 285 })
  korean_score: number;

  @ApiPropertyOptional({ description: '국어 평균 등급', example: 1.5 })
  korean_average_grade?: number;

  @ApiProperty({ description: '영어 환산점수', example: 290 })
  english_score: number;

  @ApiPropertyOptional({ description: '영어 평균 등급', example: 1.3 })
  english_average_grade?: number;

  @ApiProperty({ description: '수학 환산점수', example: 280 })
  math_score: number;

  @ApiPropertyOptional({ description: '수학 평균 등급', example: 1.8 })
  math_average_grade?: number;

  @ApiProperty({ description: '사회 환산점수', example: 95 })
  social_score: number;

  @ApiPropertyOptional({ description: '사회 평균 등급', example: 2.0 })
  social_average_grade?: number;

  @ApiProperty({ description: '과학 환산점수', example: 0 })
  science_score: number;

  @ApiPropertyOptional({ description: '과학 평균 등급', example: null })
  science_average_grade?: number;

  @ApiProperty({ description: '기타 교과 환산점수', example: 25.5 })
  etc_score: number;

  @ApiProperty({ description: '반영된 총 과목 수', example: 35 })
  reflected_subject_count: number;

  @ApiProperty({ description: '반영된 과목 상세 정보', type: [ReflectedSubjectDto] })
  reflected_subjects: ReflectedSubjectDto[];

  @ApiProperty({ description: '출결 점수', example: 10 })
  attendance_score: number;

  @ApiProperty({ description: '봉사 점수', example: 0 })
  volunteer_score: number;
}

/**
 * 모집단위별 환산점수 응답 DTO
 */
export class RecruitmentScoreResponseDto {
  @ApiProperty({ description: '계산 성공 여부', example: true })
  success: boolean;

  @ApiPropertyOptional({ description: '실패 사유' })
  failure_reason?: string;

  @ApiProperty({ description: '수시 모집단위 ID', example: 12345 })
  susi_subject_id: number;

  @ApiProperty({ description: '대학명', example: '서울대학교' })
  university_name: string;

  @ApiProperty({ description: '모집단위명', example: '경영학과' })
  recruitment_name: string;

  @ApiPropertyOptional({ description: '전형명', example: '지역균형전형' })
  type_name?: string;

  @ApiPropertyOptional({ description: '전형 기본 유형', example: '교과' })
  basic_type?: string;

  @ApiPropertyOptional({ description: '전형 세부 유형', example: '일반' })
  detailed_type?: string;

  @ApiPropertyOptional({ description: '계열', example: '인문' })
  department?: string;

  @ApiPropertyOptional({ description: '적용 연도', example: 2026 })
  year?: number;

  @ApiProperty({ description: '환산점수', example: 985.5 })
  converted_score: number;

  @ApiPropertyOptional({ description: '환산점수 만점', example: 1000 })
  max_score?: number;

  @ApiPropertyOptional({ description: '환산점수 비율 (%)', example: 98.55 })
  score_percentage?: number;

  @ApiPropertyOptional({ description: '반영 평균 등급', example: 1.8 })
  average_grade?: number;

  @ApiPropertyOptional({
    description: '위험도 점수 (-15~10, 양수=안전, 음수=위험)',
    example: 3,
  })
  risk_score?: number;

  @ApiPropertyOptional({ description: '50% 등급컷 (작년 합격자 평균)', example: 2.1 })
  grade_cut_50?: number;

  @ApiPropertyOptional({ description: '70% 등급컷 (작년 합격자 상위)', example: 1.8 })
  grade_cut_70?: number;

  @ApiPropertyOptional({ description: '등급 차이 (내 등급 - 컷)', example: -0.3 })
  grade_difference?: number;

  @ApiPropertyOptional({ description: '작년 합격자 평균 등급', example: 2.1 })
  last_year_avg_grade?: number;

  @ApiPropertyOptional({ description: '작년 합격자 최저 등급', example: 2.8 })
  last_year_min_grade?: number;

  @ApiPropertyOptional({ description: '작년 경쟁률', example: 5.2 })
  last_year_competition_rate?: number;
}

/**
 * 환산점수 계산 API 응답 DTO
 */
export class CalculateKyokwaScoresResponseDto {
  @ApiProperty({ description: '성공 여부', example: true })
  success: boolean;

  @ApiProperty({ description: '메시지', example: '50개 대학 환산점수 계산 완료' })
  message: string;

  @ApiProperty({ description: '총 대학 수', example: 50 })
  total_universities: number;

  @ApiProperty({ description: '성공 대학 수', example: 48 })
  success_count: number;

  @ApiProperty({ description: '실패 대학 수', example: 2 })
  failure_count: number;

  @ApiProperty({ description: '대학별 환산점수', type: [UniversityScoreResponseDto] })
  university_scores: UniversityScoreResponseDto[];

  @ApiPropertyOptional({ description: '모집단위별 환산점수', type: [RecruitmentScoreResponseDto] })
  recruitment_scores?: RecruitmentScoreResponseDto[];

  @ApiProperty({ description: '계산 일시', example: '2026-01-20T10:30:00.000Z' })
  calculated_at: Date;
}

/**
 * 환산점수 목록 조회 응답 DTO
 */
export class GetKyokwaScoresResponseDto {
  @ApiProperty({ description: '총 개수', example: 50 })
  total: number;

  @ApiProperty({ description: '대학별 환산점수 목록', type: [UniversityScoreResponseDto] })
  scores: UniversityScoreResponseDto[];
}

/**
 * 모집단위별 점수 목록 조회 응답 DTO
 */
export class GetRecruitmentScoresResponseDto {
  @ApiProperty({ description: '총 개수', example: 500 })
  total: number;

  @ApiProperty({ description: '모집단위별 환산점수 목록', type: [RecruitmentScoreResponseDto] })
  scores: RecruitmentScoreResponseDto[];
}
