import { IsArray, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SchoolRecordAttendanceDetailDto {
  @IsOptional()
  @IsNumber()
  absent_disease: number | null;

  @IsOptional()
  @IsNumber()
  absent_etc: number | null;

  @IsOptional()
  @IsNumber()
  absent_unrecognized: number | null;

  @IsOptional()
  @IsNumber()
  class_days: number | null;

  @IsOptional()
  @IsString()
  etc: string | null;

  @IsOptional()
  @IsString()
  grade: string | null;

  @IsOptional()
  @IsNumber()
  late_disease: number | null;

  @IsOptional()
  @IsNumber()
  late_etc: number | null;

  @IsOptional()
  @IsNumber()
  late_unrecognized: number | null;

  @IsOptional()
  @IsNumber()
  leave_early_disease: number | null;

  @IsOptional()
  @IsNumber()
  leave_early_etc: number | null;

  @IsOptional()
  @IsNumber()
  leave_early_unrecognized: number | null;

  @IsOptional()
  @IsNumber()
  result_disease: number | null;

  @IsOptional()
  @IsNumber()
  result_early_etc: number | null;

  @IsOptional()
  @IsNumber()
  result_unrecognized: number | null;
}

export class SchoolRecordSelectSubjectDto {
  @IsOptional()
  @IsString()
  achievement: string | null;

  @IsOptional()
  @IsString()
  achievementa: string | null;

  @IsOptional()
  @IsString()
  achievementb: string | null;

  @IsOptional()
  @IsString()
  achievementc: string | null;

  @IsOptional()
  @IsString()
  etc: string | null;

  @IsOptional()
  @IsString()
  grade: string | null;

  @IsOptional()
  @IsString()
  main_subject_code: string | null;

  @IsString()
  main_subject_name: string;

  @IsOptional()
  @IsString()
  raw_score: string | null;

  @IsOptional()
  @IsString()
  semester: string | null;

  @IsOptional()
  @IsString()
  students_num: string | null;

  @IsOptional()
  @IsString()
  sub_subject_average: string | null;

  @IsOptional()
  @IsString()
  subject_code: string | null;

  @IsString()
  subject_name: string;

  @IsOptional()
  @IsString()
  unit: string | null;
}

export class SchoolRecordSubjectLearningDto {
  @IsOptional()
  @IsString()
  achievement: string | null;

  @IsOptional()
  @IsString()
  etc: string | null;

  @IsOptional()
  @IsString()
  grade: string | null;

  @IsOptional()
  @IsString()
  main_subject_code: string | null;

  @IsString()
  main_subject_name: string;

  @IsOptional()
  @IsString()
  ranking: string | null;

  @IsOptional()
  @IsString()
  raw_score: string | null;

  @IsOptional()
  @IsString()
  semester: string | null;

  @IsOptional()
  @IsString()
  standard_deviation: string | null;

  @IsOptional()
  @IsString()
  students_num: string | null;

  @IsOptional()
  @IsString()
  sub_subject_average: string | null;

  @IsOptional()
  @IsString()
  subject_code: string | null;

  @IsOptional()
  @IsString()
  subject_name: string | null;

  @IsOptional()
  @IsString()
  unit: string | null;
}

export class EditLifeRecordDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchoolRecordAttendanceDetailDto)
  attendances: SchoolRecordAttendanceDetailDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchoolRecordSubjectLearningDto)
  subjects: SchoolRecordSubjectLearningDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchoolRecordSelectSubjectDto)
  selectSubjects: SchoolRecordSelectSubjectDto[];
}
