import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddInterestDto {
  @IsString()
  targetTable: 'susi_comprehensive_tb' | 'susi_subject_tb';

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  targetIds: number[];

  @IsNumber()
  @IsOptional()
  evaluation_id?: number;
}
