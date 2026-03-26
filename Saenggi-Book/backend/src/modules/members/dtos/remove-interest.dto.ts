import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class RemoveInterestDto {
  @IsString()
  targetTable:
    | 'susi_comprehensive_tb'
    | 'susi_subject_tb'
    | 'early_subject'
    | 'early_comprehensive';

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  targetIds: number[];
}
