// @ts-nocheck
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

enum Major {
  문과 = '문과',
  이과 = '이과',
}

enum AdmissionType {
  가 = '가',
  나 = '나',
  다 = '다',
}

export class CreateRegularAdmissionDto {
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsEnum(Major)
  major: Major;

  @IsNotEmpty()
  @IsEnum(AdmissionType)
  admission_type: AdmissionType;

  @IsNotEmpty()
  @IsString()
  recruitment_name: string;

  @IsNotEmpty()
  @IsString()
  general_field_name: string;

  @IsNotEmpty()
  @IsNumber()
  recruitment_number: number;

  @IsNotEmpty()
  @IsString()
  score_calculation: string;

  @IsNotEmpty()
  @IsString()
  math_choice: string;

  @IsNotEmpty()
  @IsString()
  csat_elements: string;

  @IsNotEmpty()
  @IsString()
  csat_combination: string;

  @IsNotEmpty()
  @IsString()
  csat_required: string;

  @IsNotEmpty()
  @IsString()
  csat_optional: string;

  @IsNotEmpty()
  @IsNumber()
  min_cut: number;

  @IsNotEmpty()
  @IsNumber()
  max_cut: number;

  @IsNotEmpty()
  @IsNumber()
  university_id: number;
}

export class UpdateRegularAdmissionDto {
  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsEnum(Major)
  major?: Major;

  @IsOptional()
  @IsEnum(AdmissionType)
  admission_type?: AdmissionType;

  @IsOptional()
  @IsString()
  recruitment_name?: string;

  @IsOptional()
  @IsString()
  general_field_name?: string;

  @IsOptional()
  @IsNumber()
  recruitment_number?: number;

  @IsOptional()
  @IsString()
  score_calculation?: string;

  @IsOptional()
  @IsString()
  math_choice?: string;

  @IsOptional()
  @IsString()
  csat_elements?: string;

  @IsOptional()
  @IsString()
  csat_combination?: string;

  @IsOptional()
  @IsString()
  csat_required?: string;

  @IsOptional()
  @IsString()
  csat_optional?: string;

  @IsOptional()
  @IsNumber()
  min_cut?: number;

  @IsOptional()
  @IsNumber()
  max_cut?: number;

  @IsOptional()
  @IsNumber()
  university_id?: number;
}
