// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';

export class AdminSusiPassRecordResponseDto {
  @ApiProperty({
    description: '합불사례 데이터 조회',
  })
  list!: SusiPassRecordEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
