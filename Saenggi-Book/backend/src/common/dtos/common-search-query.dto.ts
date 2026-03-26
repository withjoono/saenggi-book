import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CommonSearchQueryDto {
  @ApiPropertyOptional({
    description: "검색조건(',' 단위로 분리)",
    example: 'nickname, email',
  })
  @IsOptional()
  @IsString()
  searchKey?: string;

  @ApiPropertyOptional({
    description: '검색어',
    example: '입력한 검색어',
  })
  @IsOptional()
  @IsString()
  searchWord?: string;

  @ApiPropertyOptional({
    description: '검색 정렬 필터(정렬항목, 정렬기준)',
    example: '{ "field": "email", "sort": "ASC" }',
  })
  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  })
  searchSort?: Record<string, string>;

  @ApiPropertyOptional({
    description: '현재페이지',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: '페이지크기',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number;
}
