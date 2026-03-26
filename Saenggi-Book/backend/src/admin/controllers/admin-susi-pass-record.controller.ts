import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminSusiPassRecordService } from '../services/admin-susi-pass-record.service';
import { AdminSusiPassRecordResponseDto } from '../dtos/admin-susi-pass-record-response.dto';

@ApiTags('[관리자] 합불 사례 관리(new)')
@Controller('admin/ms/pass-record')
export class AdminSusiPassRecordController {
  constructor(private readonly adminSusiPassRecordService: AdminSusiPassRecordService) {}

  @Get()
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 합불 사례 목록 조회' })
  getAdminSusiPassRecord(
    @Query() commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminSusiPassRecordResponseDto> {
    return this.adminSusiPassRecordService.getAdminRankingPassFail(commonSearchQueryDto);
  }

  @Post('upload')
  @Roles(['ROLE_ADMIN'])
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.adminSusiPassRecordService.uploadFile(file);
  }
}
