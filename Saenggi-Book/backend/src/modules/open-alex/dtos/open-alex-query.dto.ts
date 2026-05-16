import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ConceptSearchDto {
  @ApiProperty({ description: '검색어 (예: 기후변화, computer science)', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: '개념 수준 0~5 (0=최상위)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  level?: number;

  @ApiProperty({ description: '페이지 번호', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  // 프론트 humps가 camelCase→snake_case 변환하므로 per_page로 수신
  @ApiProperty({ name: 'per_page', description: '페이지당 결과 수 (최대 200)', required: false, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  per_page?: number = 25;
}

export class PaperQueryDto {
  @ApiProperty({ description: '페이지 번호', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ name: 'per_page', description: '페이지당 논문 수 (최대 20)', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  per_page?: number = 10;
}
