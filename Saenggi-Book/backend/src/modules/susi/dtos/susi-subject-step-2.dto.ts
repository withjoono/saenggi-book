// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class SusiSubjectStep2QueryDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ids: number[];
}

// 최저등급 관련 데이터 조회
export class SusiSubjectStep2ResponseDto {
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
  @ApiProperty({ example: '2: 필수과목, 1:반영, 0: 미반영' })
  minimum_academic_standards_applied: SuSiSubjectEntity['minimum_academic_standards_applied']; // 최저학력기준_반영여부
  @ApiProperty({ example: '최저반영내용 텍스트로 표시' })
  minimum_academic_standards_text: SuSiSubjectEntity['minimum_academic_standards_text']; // 수능최저학력기준TEXT

  @ApiProperty({ example: '2: 필수, 1: 반영, 0: 미반영' })
  minimum_korean: SuSiSubjectEntity['minimum_korean']; // 최저국어
  @ApiProperty({ example: '2: 필수, 1: 반영, 0: 미반영' })
  minimum_math: SuSiSubjectEntity['minimum_math']; // 최저수학
  @ApiProperty({ example: '2: 필수, 1: 반영, 0: 미반영' })
  minimum_math_science_engineering: SuSiSubjectEntity['minimum_math_science_engineering']; // '최저수학(미/기)'
  @ApiProperty({ example: '2: 필수, 1: 반영, 0: 미반영' })
  english: SuSiSubjectEntity['english']; // 영어 (최저?)
  @ApiProperty({ example: '2: 필수, 1: 반영, 0: 미반영' })
  social_studies: SuSiSubjectEntity['social_studies']; // 사탐(최저?)
  @ApiProperty({ example: '2: 필수, 1: 반영, 0: 미반영' })
  science_studies: SuSiSubjectEntity['science_studies']; // 과탐(최저?)
  @ApiProperty({ example: '2: 둘다, 1:탐구 중 높은거 1개, 0: 탐구계산 없음' })
  calculation_studies: SuSiSubjectEntity['calculation_studies']; // 탐계산 (1:탐구 중 높은거 1개, 2: 둘다, 0: 탐구계산 없음)
  @ApiProperty({ example: '3' })
  minimum_count: SuSiSubjectEntity['minimum_count']; // 최저갯수
  @ApiProperty({ example: '10' })
  minimum_sum: SuSiSubjectEntity['minimum_sum']; // 최저합
  @ApiProperty({ example: '5' })
  korean_history: SuSiSubjectEntity['korean_history']; // 한국사 (~이내)
}
