// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class SusiComprehensiveStep4QueryDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ids: number[];
}

// 전형일자 데이터 조회
export class SusiComprehensiveStep4ResponseDto {
  @ApiProperty({ example: 1 })
  id: SusiComprehensiveEntity['id'];

  @ApiProperty({ example: '강서대' })
  university_name: SusiComprehensiveEntity['university_name']; // 대학명
  @ApiProperty({ example: '학생부교과' })
  type_name: SusiComprehensiveEntity['type_name']; // 전형명
  @ApiProperty({ example: '데이터학과' })
  recruitment_unit_name: SusiComprehensiveEntity['recruitment_unit_name']; // 모집단위명

  interview_score_applied: SusiComprehensiveEntity['interview_score_applied']; // 면접점수반영여부
  interview_type: SusiComprehensiveEntity['interview_type']; // 면접유형
  interview_resources: SusiComprehensiveEntity['interview_resources']; // 면접시활용자료
  interview_method: SusiComprehensiveEntity['interview_method']; // 면접진행방식
  interview_evaluation_content: SusiComprehensiveEntity['interview_evaluation_content']; // 면접평가내용

  interview_date_text: SusiComprehensiveEntity['interview_date_text']; // 면접날짜TEXT
  interview_time: SusiComprehensiveEntity['interview_time']; // 면접시간
}
