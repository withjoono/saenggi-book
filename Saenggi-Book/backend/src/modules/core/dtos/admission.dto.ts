// @ts-nocheck
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsEnum, IsOptional, ValidateNested, IsArray } from 'class-validator';

export class CreateAdmissionMethodDto {
  @IsString()
  method_description: string;

  @IsOptional()
  @IsNumber()
  subject_ratio?: number;

  @IsOptional()
  @IsNumber()
  document_ratio?: number;

  @IsOptional()
  @IsNumber()
  interview_ratio?: number;

  @IsOptional()
  @IsNumber()
  practical_ratio?: number;

  @IsOptional()
  @IsString()
  other_details?: string;

  @IsOptional()
  @IsNumber()
  second_stage_first_ratio?: number;

  @IsOptional()
  @IsNumber()
  second_stage_interview_ratio?: number;

  @IsOptional()
  @IsNumber()
  second_stage_other_ratio?: number;

  @IsOptional()
  @IsString()
  second_stage_other_details?: string;

  @IsString()
  eligibility: string;

  @IsOptional()
  @IsString()
  school_record_evaluation_score?: string;

  @IsOptional()
  @IsString()
  school_record_evaluation_elements?: string;
}

export class UpdateAdmissionMethodDto {
  @IsOptional()
  @IsString()
  method_description?: string;

  @IsOptional()
  @IsNumber()
  subject_ratio?: number;

  @IsOptional()
  @IsNumber()
  document_ratio?: number;

  @IsOptional()
  @IsNumber()
  interview_ratio?: number;

  @IsOptional()
  @IsNumber()
  practical_ratio?: number;

  @IsOptional()
  @IsString()
  other_details?: string;

  @IsOptional()
  @IsNumber()
  second_stage_first_ratio?: number;

  @IsOptional()
  @IsNumber()
  second_stage_interview_ratio?: number;

  @IsOptional()
  @IsNumber()
  second_stage_other_ratio?: number;

  @IsOptional()
  @IsString()
  second_stage_other_details?: string;

  @IsOptional()
  @IsString()
  eligibility?: string;

  @IsOptional()
  @IsString()
  school_record_evaluation_score?: string;

  @IsOptional()
  @IsString()
  school_record_evaluation_elements?: string;
}

export class CreateAdmissionDto {
  @IsString()
  name: string;

  @IsNumber()
  year: number;

  @IsEnum(['일반', '특별'])
  basic_type: '일반' | '특별';

  @IsNumber()
  university_id: number;

  @IsNumber()
  category_id: number;

  @ValidateNested()
  @Type(() => CreateAdmissionMethodDto)
  method: CreateAdmissionMethodDto;

  @IsArray()
  @IsNumber({}, { each: true })
  subtype_ids: number[];
}

export class UpdateAdmissionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsEnum(['일반', '특별'])
  basic_type?: '일반' | '특별';

  @IsOptional()
  @IsNumber()
  university_id?: number;

  @IsOptional()
  @IsNumber()
  category_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAdmissionMethodDto)
  method?: UpdateAdmissionMethodDto;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  subtype_ids?: number[];
}
