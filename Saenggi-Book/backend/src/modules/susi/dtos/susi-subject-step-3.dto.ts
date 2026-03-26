// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class SusiSubjectStep3QueryDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ids: number[];
}

// 비교과 관련 데이터 조회
export class SusiSubjectStep3ResponseDto {
  @ApiProperty({ example: 1 })
  id: SuSiSubjectEntity['id'];

  @ApiProperty({ example: '강서대' })
  university_name: SuSiSubjectEntity['university_name']; // 대학명
  @ApiProperty({ example: '학생부교과' })
  type_name: SuSiSubjectEntity['type_name']; // 전형명
  @ApiProperty({ example: '인문' })
  department: SuSiSubjectEntity['department']; // 계열
  @ApiProperty({ example: '일반' })
  basic_type: SuSiSubjectEntity['basic_type']; // 기본유형

  @ApiProperty({ example: '10' })
  attendance: SuSiSubjectEntity['attendance']; // 출결
  @ApiProperty({ example: '10' })
  volunteer: SuSiSubjectEntity['volunteer']; // 봉사
  @ApiProperty({ example: '10' })
  document_non_academic: SuSiSubjectEntity['document_non_academic']; // '서류(비교과)'
}
