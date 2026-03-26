// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';

export class AdminSusiComprehensiveResponseDto {
  @ApiProperty({
    description: '수시 학종 통합DB 목록',
  })
  list!: SusiComprehensiveEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
