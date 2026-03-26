// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminPayOrderResponseDto {
  @ApiProperty({
    description: '주문 목록',
  })
  list!: PayOrderEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}

export class AdminPayOrderSearchQueryDto {
  @ApiPropertyOptional({
    description: '주문 상태',
    example: 'COMPLETE',
  })
  @IsOptional()
  @IsString()
  orderState?: string;

  @ApiPropertyOptional({
    description: '검색어 (유저 이름, 이메일)',
    example: '강준호',
  })
  @IsOptional()
  @IsString()
  searchWord?: string;

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
