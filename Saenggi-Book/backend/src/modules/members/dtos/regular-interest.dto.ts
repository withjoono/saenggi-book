import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class AddRegularInterestDto {
  @IsString()
  admissionType: '가' | '나' | '다';

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  targetIds: number[];
}

export class RemoveRegularInterestDto {
  @IsString()
  admissionType: '가' | '나' | '다';

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  targetIds: number[];
}
