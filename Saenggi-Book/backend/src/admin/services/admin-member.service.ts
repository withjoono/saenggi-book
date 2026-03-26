// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminMemberResponseDto } from '../dtos/admin-member-repsonse.dto';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';

@Injectable()
export class AdminMemberService {
  constructor(  ) {}

  async getAllMembers(commonSearchQueryDto: CommonSearchQueryDto): Promise<AdminMemberResponseDto> {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.memberRepository,
    );

    const queryBuilder = this.memberRepository.createQueryBuilder('A');

    if (param.search) {
      queryBuilder.where(param.search);
    }

    if (param.searchSort) {
      queryBuilder.orderBy(param.searchSort.field, param.searchSort.sort);
    }

    queryBuilder.skip((param.page - 1) * param.pageSize).take(param.pageSize);

    const [list, totalCount] = await queryBuilder.getManyAndCount();
    return {
      list: list,
      totalCount,
    };
  }
}
