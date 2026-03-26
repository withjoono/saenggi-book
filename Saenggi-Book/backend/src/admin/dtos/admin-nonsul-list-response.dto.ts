// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';

export class AdminNonsulListResponse {
  @ApiProperty({
    description: '논술 통합 DB 목록',
  })
  list!: (NonsulListEntity & NonsulLowestGradeListEntity)[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
