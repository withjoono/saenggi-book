import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SeriesType {
  HUMANITIES = 'humanities',
  SCIENCE = 'science',
}

/**
 * 대학 레벨 조회 응답
 */
export class UniversityLevelResponseDto {
  @ApiProperty({ description: '대학 ID' })
  id: number;

  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '대학 코드' })
  universityCode: string;

  @ApiProperty({ description: '대학 레벨 (1-7)', example: 7 })
  level: number;
}

/**
 * 문과 계열 평가 기준 응답
 */
export class HumanitiesCriteriaResponseDto {
  @ApiProperty({ description: '레벨', example: 7 })
  level: number;

  @ApiProperty({ description: '대학 범례', example: '의치한약수,서울' })
  universityCategory: string;

  @ApiProperty({ description: '국어 권장 등급', example: 1.3 })
  korean: number;

  @ApiProperty({ description: '영어 권장 등급', example: 1.3 })
  english: number;

  @ApiProperty({ description: '수학 권장 등급', example: 1.3 })
  math: number;

  @ApiProperty({ description: '사회 권장 등급', example: 1.3 })
  social: number;

  @ApiProperty({ description: '제2외국어 권장 등급', example: 1.3 })
  secondForeignLanguage: number;

  @ApiProperty({
    description: '전체 등급 범위',
    example: '1.0-2.5',
    nullable: true,
  })
  overallGradeRange?: string;
}

/**
 * 이과 계열 평가 기준 응답
 */
export class ScienceCriteriaResponseDto {
  @ApiProperty({ description: '레벨', example: 7 })
  level: number;

  @ApiProperty({ description: '대학 범례', example: '의치한약수,서울' })
  universityCategory: string;

  @ApiProperty({ description: '확률과 통계 권장 등급', example: 1.0 })
  statistics: number;

  @ApiProperty({ description: '미적분 권장 등급', example: 1.0 })
  calculus: number;

  @ApiProperty({ description: '기하 권장 등급', example: 1.0 })
  geometry: number;

  @ApiProperty({ description: '인공지능 수학 권장 등급', example: 1.0 })
  aiMath: number;

  @ApiProperty({ description: '물리Ⅰ 권장 등급', example: 1.0 })
  physics1: number;

  @ApiProperty({ description: '물리Ⅱ 권장 등급', example: 1.0 })
  physics2: number;

  @ApiProperty({ description: '화학Ⅰ 권장 등급', example: 1.0 })
  chemistry1: number;

  @ApiProperty({ description: '화학Ⅱ 권장 등급', example: 1.0 })
  chemistry2: number;

  @ApiProperty({ description: '생명과학Ⅰ 권장 등급', example: 1.0 })
  biology1: number;

  @ApiProperty({ description: '생명과학Ⅱ 권장 등급', example: 1.0 })
  biology2: number;

  @ApiProperty({ description: '지구과학Ⅰ 권장 등급', example: 1.0 })
  earthScience1: number;

  @ApiProperty({ description: '지구과학Ⅱ 권장 등급', example: 1.0 })
  earthScience2: number;
}

/**
 * 학생 과목 성적
 */
export class StudentSubjectGradeDto {
  @ApiProperty({ description: '과목명', example: '미적분' })
  @IsString()
  subjectName: string;

  @ApiProperty({ description: '등급', example: 2.0 })
  @IsNumber()
  grade: number;
}

/**
 * 계열 적합성 계산 요청
 */
export class CalculateSeriesEvaluationRequestDto {
  @ApiProperty({ description: '대학명', example: '서울대학교' })
  @IsString()
  universityName: string;

  @ApiProperty({
    description: '계열 타입',
    enum: SeriesType,
    example: SeriesType.SCIENCE,
  })
  @IsEnum(SeriesType)
  seriesType: SeriesType;

  @ApiProperty({
    description: '중계열',
    example: '의약',
    required: false,
  })
  @IsOptional()
  @IsString()
  middleSeries?: string;

  @ApiProperty({
    description: '학생 과목 성적 목록',
    type: [StudentSubjectGradeDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentSubjectGradeDto)
  studentGrades: StudentSubjectGradeDto[];
}

/**
 * 교과별 평가 결과 (참조교과용)
 */
export class SubjectEvaluationDto {
  @ApiProperty({ description: '교과명' })
  subjectName: string;

  @ApiProperty({ description: '학생 평균 등급' })
  studentGrade: number;

  @ApiProperty({ description: '권장 등급' })
  recommendedGrade: number;

  @ApiProperty({ description: '차이 (학생 등급 - 권장 등급)' })
  difference: number;

  @ApiProperty({ description: '위험도 (0-100)' })
  riskScore: number;

  @ApiProperty({ description: '평가 (우수/적합/주의/위험)' })
  evaluation: string;
}

/**
 * 필수/권장 과목 수강 여부
 */
export class SubjectRequirementDto {
  @ApiProperty({ description: '과목명' })
  subjectName: string;

  @ApiProperty({ description: '수강 여부' })
  taken: boolean;

  @ApiProperty({ description: '학생 등급 (수강한 경우)', nullable: true })
  studentGrade?: number;

  @ApiProperty({ description: '평가 (우수/적합/주의/위험)', nullable: true })
  evaluation?: string;
}

/**
 * 계열 적합성 계산 결과
 */
export class CalculateSeriesEvaluationResponseDto {
  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '대학 레벨' })
  universityLevel: number;

  @ApiProperty({ description: '계열 타입' })
  seriesType: SeriesType;

  @ApiProperty({ description: '총 위험도 점수 (0-100)' })
  totalRiskScore: number;

  @ApiProperty({ description: '총 평가 (안전/주의/위험)' })
  overallEvaluation: string;

  @ApiProperty({ description: '과목별 평가 결과 (참조교과)', type: [SubjectEvaluationDto] })
  subjectEvaluations: SubjectEvaluationDto[];

  @ApiProperty({ description: '개선 필요 과목 목록' })
  improvementNeeded: string[];

  @ApiProperty({
    description: '필수 과목 요구사항',
    type: [SubjectRequirementDto],
    nullable: true,
  })
  requiredSubjects?: SubjectRequirementDto[];

  @ApiProperty({
    description: '권장 과목 요구사항',
    type: [SubjectRequirementDto],
    nullable: true,
  })
  recommendedSubjects?: SubjectRequirementDto[];
}
