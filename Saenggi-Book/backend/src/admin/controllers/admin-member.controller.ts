import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminMemberService } from '../services/admin-member.service';
import { AdminMemberResponseDto } from '../dtos/admin-member-repsonse.dto';

@ApiTags('[관리자] 유저 관리')
@Roles(['ROLE_ADMIN'])
@SerializeOptions({
  groups: ['admin'],
})
@Controller('admin/members')
export class AdminMemberController {
  constructor(private readonly adminMemberService: AdminMemberService) {}

  @Get()
  @ApiOperation({ summary: '[관리자] 유저 목록 조회' })
  getAdminMember(
    @Query() commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminMemberResponseDto> {
    return this.adminMemberService.getAllMembers(commonSearchQueryDto);
  }
}
