// @ts-nocheck
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 환산점수 계산 요청 DTO
 */
export class CalculateKyokwaScoresDto {
  @ApiPropertyOptional({
    description: '특정 대학만 계산 (지정하지 않으면 모든 대학)',
    example: ['서울대학교', '연세대학교', '고려대학교'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  universityNames?: string[];

  @ApiPropertyOptional({
    description: '기존 점수 삭제 후 재계산 여부',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  recalculate?: boolean;

  @ApiPropertyOptional({
    description: '적용 연도',
    example: 2026,
    default: 2026,
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2030)
  @Type(() => Number)
  year?: number;
}

/**
 * 환산점수 조회 쿼리 DTO
 */
export class GetKyokwaScoresQueryDto {
  @ApiPropertyOptional({
    description: '대학명 필터',
    example: '서울대학교',
  })
  @IsOptional()
  @IsString()
  universityName?: string;

  @ApiPropertyOptional({
    description: '적용 연도',
    example: 2026,
    default: 2026,
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2030)
  @Type(() => Number)
  year?: number;
}

/**
 * 모집단위별 점수 조회 쿼리 DTO
 */
export class GetRecruitmentScoresQueryDto {
  @ApiPropertyOptional({
    description: '대학명 필터',
    example: '서울대학교',
  })
  @IsOptional()
  @IsString()
  universityName?: string;

  @ApiPropertyOptional({
    description: '전형 기본 유형 필터 (교과, 학종)',
    example: '교과',
  })
  @IsOptional()
  @IsString()
  basicType?: string;

  @ApiPropertyOptional({
    description: '위험도 최소값 필터',
    example: -5,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  minRiskScore?: number;

  @ApiPropertyOptional({
    description: '위험도 최대값 필터',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxRiskScore?: number;

  @ApiPropertyOptional({
    description: '적용 연도',
    example: 2026,
    default: 2026,
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2030)
  @Type(() => Number)
  year?: number;
}

/**
 * 점수 삭제 요청 DTO
 */
export class DeleteKyokwaScoresDto {
  @ApiPropertyOptional({
    description: '특정 대학만 삭제 (지정하지 않으면 모든 대학)',
    example: ['서울대학교'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  universityNames?: string[];
}
