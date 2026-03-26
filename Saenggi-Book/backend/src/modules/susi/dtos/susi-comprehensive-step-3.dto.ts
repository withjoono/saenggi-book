// @ts-nocheck
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class SusiComprehensiveStep3QueryDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ids: number[];
}

// 교과/비교과 데이터 조회
export class SusiComprehensiveStep3ResponseDto {
  id: SusiComprehensiveEntity['id'];
  type_name: SusiComprehensiveEntity['type_name'];
  university_name: SusiComprehensiveEntity['university_name'];
  university_code: SusiComprehensiveEntity['university_code'];
  recruitment_unit_name: SusiComprehensiveEntity['recruitment_unit_name'];
  department: SusiComprehensiveEntity['department'];

  minimum_academic_standards_applied: SusiComprehensiveEntity['minimum_academic_standards_applied']; // 최저학력기준_반영여부
  minimum_academic_standards_text: SusiComprehensiveEntity['minimum_academic_standards_text']; // 수능최저학력기준TEXT
  minimum_korean: SusiComprehensiveEntity['minimum_korean']; // 최저국어
  minimum_math: SusiComprehensiveEntity['minimum_math']; // 최저수학
  minimum_math_science_engineering: SusiComprehensiveEntity['minimum_math_science_engineering']; // '최저수학(미/기)'
  minimum_english: SusiComprehensiveEntity['minimum_english']; // 영어
  minimum_social_studies: SusiComprehensiveEntity['minimum_social_studies']; // 사탐
  minimum_science_studies: SusiComprehensiveEntity['minimum_science_studies']; // 과탐
  minimum_calculation_studies: SusiComprehensiveEntity['minimum_calculation_studies']; // 탐계산
  minimum_count: SusiComprehensiveEntity['minimum_count']; // 최저갯수
  minimum_sum: SusiComprehensiveEntity['minimum_sum']; // '최저합'
  minimum_korean_history: SusiComprehensiveEntity['minimum_korean_history']; // '한국사'
  minimum_others: SusiComprehensiveEntity['minimum_others']; // 그외
  minimum_others_details: SusiComprehensiveEntity['minimum_others_details']; // 그외상세
}
