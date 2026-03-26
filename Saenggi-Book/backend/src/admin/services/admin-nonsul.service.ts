import { Injectable } from '@nestjs/common';
import { NonsulService } from 'src/modules/nonsul/nonsul.service';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminNonsulListResponse } from '../dtos/admin-nonsul-list-response.dto';

@Injectable()
export class AdminNonsulService {
  constructor(private readonly nonsulService: NonsulService) {}

  async getAdminNonsulList(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminNonsulListResponse> {
    const { list, totalCount } =
      await this.nonsulService.getNonsulListWithLowestGrade(commonSearchQueryDto);
    return { list, totalCount };
  }
}
