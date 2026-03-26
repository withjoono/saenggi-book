// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminNonsulListResponse } from 'src/admin/dtos/admin-nonsul-list-response.dto';

@Injectable()
export class NonsulService {
  constructor(  ) {}

  async getNonsulListWithLowestGrade(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminNonsulListResponse> {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.nonsulListRepository,
    );

    console.log('param:', JSON.stringify(param, null, 2));

    // 기본값 설정
    const page = param.page || 1;
    const pageSize = param.pageSize || 100;
    const offset = (page - 1) * pageSize;

    console.log('page:', page, 'pageSize:', pageSize, 'offset:', offset);

    // 스프링과 일치시키기 위해 원시 sql문 방식 사용
    let sqlQuery = `
      SELECT A.*
           , B.content
           , B.lowest_cal
           , B.lowest_count
           , B.lowest_english
           , B.lowest_history
           , B.lowest_korean
           , B.lowest_math
           , B.lowest_migi
           , B.lowest_science
           , B.lowest_society
           , B.lowest_sum
           , B.lowest_use
      FROM essay_list_tb A
      LEFT JOIN essay_lowest_grade_list_tb B ON A.id = B.essay_id
    `;

    if (param.search) {
      sqlQuery += ` WHERE ${param.search}`;
    }

    if (param.searchSort) {
      sqlQuery += ` ORDER BY ${param.searchSort.field} ${param.searchSort.sort}`;
    }

    sqlQuery += ` LIMIT ${pageSize} OFFSET ${offset}`;

    const list = await this.nonsulListRepository.query(sqlQuery);

    let countQuery = `
      SELECT COUNT(A.id) as totalCount
      FROM essay_list_tb A
      LEFT JOIN essay_lowest_grade_list_tb B ON A.id = B.essay_id
    `;

    if (param.search) {
      countQuery += ` WHERE ${param.search}`;
    }

    const result = await this.nonsulListRepository.query(countQuery);
    const totalCount = result[0].totalCount;

    return {
      list: list as (NonsulListEntity & NonsulLowestGradeListEntity)[],
      totalCount,
    };
  }
}
