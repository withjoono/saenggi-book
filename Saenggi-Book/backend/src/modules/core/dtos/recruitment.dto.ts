// @ts-nocheck
import { IsString, IsNumber, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecruitmentUnitScoreDto {
  @IsOptional()
  @IsNumber()
  grade_50_cut?: number;

  @IsOptional()
  @IsNumber()
  grade_70_cut?: number;

  @IsOptional()
  @IsNumber()
  convert_50_cut?: number;

  @IsOptional()
  @IsNumber()
  convert_70_cut?: number;

  @IsOptional()
  @IsNumber()
  risk_plus_5?: number;

  @IsOptional()
  @IsNumber()
  risk_plus_4?: number;

  @IsOptional()
  @IsNumber()
  risk_plus_3?: number;

  @IsOptional()
  @IsNumber()
  risk_plus_2?: number;

  @IsOptional()
  @IsNumber()
  risk_plus_1?: number;

  @IsOptional()
  @IsNumber()
  risk_minus_1?: number;

  @IsOptional()
  @IsNumber()
  risk_minus_2?: number;

  @IsOptional()
  @IsNumber()
  risk_minus_3?: number;

  @IsOptional()
  @IsNumber()
  risk_minus_4?: number;

  @IsOptional()
  @IsNumber()
  risk_minus_5?: number;
}

export class UpdateRecruitmentUnitScoreDto extends CreateRecruitmentUnitScoreDto {}

export class CreateRecruitmentUnitMinimumGradeDto {
  @IsEnum(['Y', 'N'])
  is_applied: 'Y' | 'N';

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRecruitmentUnitMinimumGradeDto extends CreateRecruitmentUnitMinimumGradeDto {}

export class CreateRecruitmentUnitInterviewDto {
  @IsNumber()
  is_reflected: number;

  @IsOptional()
  @IsString()
  interview_type?: string;

  @IsOptional()
  @IsString()
  materials_used?: string;

  @IsOptional()
  @IsString()
  interview_process?: string;

  @IsOptional()
  @IsString()
  evaluation_content?: string;

  @IsOptional()
  @IsString()
  interview_date?: string;

  @IsOptional()
  @IsString()
  interview_time?: string;
}

export class UpdateRecruitmentUnitInterviewDto extends CreateRecruitmentUnitInterviewDto {}

export class CreateRecruitmentUnitPreviousResultDto {
  @IsNumber()
  year: number;

  @IsString()
  @IsOptional()
  result_criteria: string;

  @IsOptional()
  @IsNumber()
  grade_cut?: number;

  @IsOptional()
  @IsNumber()
  converted_score_cut?: number;

  @IsOptional()
  @IsNumber()
  competition_ratio?: number;

  @IsOptional()
  @IsNumber()
  recruitment_number?: number;
}

export class UpdateRecruitmentUnitPreviousResultDto extends CreateRecruitmentUnitPreviousResultDto {}

export class CreateRecruitmentUnitDto {
  @IsNumber()
  admission_id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  general_field_id?: number;

  @IsOptional()
  @IsNumber()
  recruitment_number?: number;

  @IsOptional()
  @IsNumber()
  minor_field_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRecruitmentUnitScoreDto)
  scores?: CreateRecruitmentUnitScoreDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRecruitmentUnitMinimumGradeDto)
  minimum_grade?: CreateRecruitmentUnitMinimumGradeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRecruitmentUnitInterviewDto)
  interview?: CreateRecruitmentUnitInterviewDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRecruitmentUnitPreviousResultDto)
  previous_results?: CreateRecruitmentUnitPreviousResultDto[];
}

export class UpdateRecruitmentUnitDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  general_field_id?: number;

  @IsOptional()
  @IsNumber()
  minor_field_id?: number;

  @IsOptional()
  @IsNumber()
  recruitment_number?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRecruitmentUnitScoreDto)
  scores?: UpdateRecruitmentUnitScoreDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRecruitmentUnitMinimumGradeDto)
  minimum_grade?: UpdateRecruitmentUnitMinimumGradeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRecruitmentUnitInterviewDto)
  interview?: UpdateRecruitmentUnitInterviewDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecruitmentUnitPreviousResultDto)
  previous_results?: UpdateRecruitmentUnitPreviousResultDto[];
}
