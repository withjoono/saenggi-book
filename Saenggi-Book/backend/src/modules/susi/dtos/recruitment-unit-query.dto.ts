import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class RecruitmentUnitQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지당 항목 수', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '대학코드 (예: U001)', example: 'U001' })
  @IsOptional()
  @IsString()
  universityCode?: string;

  @ApiPropertyOptional({ description: '대학명 (부분 검색)', example: 'DGIST' })
  @IsOptional()
  @IsString()
  universityName?: string;

  @ApiPropertyOptional({
    description: '전형타입',
    example: '종합',
    enum: ['종합', '교과', '논술', '실기', '특기자'],
  })
  @IsOptional()
  @IsString()
  admissionType?: string;

  @ApiPropertyOptional({ description: '전형타입코드', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  admissionTypeCode?: number;

  @ApiPropertyOptional({ description: '전형명 (부분 검색)', example: '고른기회전형' })
  @IsOptional()
  @IsString()
  admissionName?: string;

  @ApiPropertyOptional({ description: '모집단위명 (부분 검색)', example: '기초학부' })
  @IsOptional()
  @IsString()
  unitName?: string;

  @ApiPropertyOptional({ description: '지역(광역)', example: '서울' })
  @IsOptional()
  @IsString()
  region?: string;
}
