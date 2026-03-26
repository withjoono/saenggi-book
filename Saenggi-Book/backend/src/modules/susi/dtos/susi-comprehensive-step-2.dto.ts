// @ts-nocheck
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class SusiComprehensiveStep2QueryDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ids: number[];
}

// 비교과 데이터 조회
export class SusiComprehensiveStep2ResponseDto {
  id: SusiComprehensiveEntity['id'];
  type_name: SusiComprehensiveEntity['type_name'];
  university_name: SusiComprehensiveEntity['university_name'];
  university_code: SusiComprehensiveEntity['university_code'];
  recruitment_unit_name: SusiComprehensiveEntity['recruitment_unit_name'];
  department: SusiComprehensiveEntity['department'];

  evaluation_ratios: SusiComprehensiveEntity['evaluation_ratios']; // 3개평가 비중(30:20:50)
  evaluation_code: SusiComprehensiveEntity['evaluation_code']; //3개평가 코드
}
