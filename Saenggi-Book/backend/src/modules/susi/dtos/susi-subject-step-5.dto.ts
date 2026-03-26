// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class SusiSubjectStep5QueryDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ids: number[];
}

// 전형일자 데이터 조회
export class SusiSubjectStep5ResponseDto {
  @ApiProperty({ example: 1 })
  id: SuSiSubjectEntity['id'];

  @ApiProperty({ example: '강서대' })
  university_name: SuSiSubjectEntity['university_name']; // 대학명
  @ApiProperty({ example: '학생부교과' })
  type_name: SuSiSubjectEntity['type_name']; // 전형명
  @ApiProperty({ example: '데이터학과' })
  recruitment_unit_name: SuSiSubjectEntity['recruitment_unit_name']; // 모집단위명

  interview_score_applied: SuSiSubjectEntity['interview_score_applied']; // 면접점수반영여부
  interview_type: SuSiSubjectEntity['interview_type']; // 면접유형
  interview_resources: SuSiSubjectEntity['interview_resources']; // 면접시활용자료
  interview_method: SuSiSubjectEntity['interview_method']; // 면접진행방식
  interview_evaluation_content: SuSiSubjectEntity['interview_evaluation_content']; // 면접평가내용

  interview_date_text: SuSiSubjectEntity['interview_date_text']; // 면접날짜TEXT
  interview_time: SuSiSubjectEntity['interview_time']; // 면접시간
}
