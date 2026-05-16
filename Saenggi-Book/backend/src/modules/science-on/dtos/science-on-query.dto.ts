import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ScienceOnSearchDto {
  @ApiProperty({ description: '검색어 (예: 기후변화, 인공지능)', required: true })
  @IsString()
  query: string;

  @ApiProperty({ description: '페이지 번호', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '페이지당 결과 수 (최대 100)', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  per_page?: number = 10;
}
