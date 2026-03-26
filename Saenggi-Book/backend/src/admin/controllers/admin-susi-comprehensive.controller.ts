import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminSusiComprehensiveService } from '../services/admin-susi-comprehensive.service';
import { AdminSusiComprehensiveResponseDto } from '../dtos/admin-susi-comprehensive-response.dto';

@ApiTags('[관리자] 수시 학종 통합DB')
@Controller('admin/ms/comprehensive')
export class AdminSusiComprehensiveController {
  constructor(private readonly adminSusiComprehensiveService: AdminSusiComprehensiveService) {}

  @Get()
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 수시 학종 통합DB 목록 조회' })
  @ApiQuery({
    name: 'searchKey',
    required: false,
    description: "검색 조건(',' 단위로 분리)",
    type: String,
    example: 'nickname, email',
  })
  @ApiQuery({
    name: 'searchWord',
    required: false,
    description: '검색어',
    type: String,
    example: '입력한 검색어',
  })
  @ApiQuery({
    name: 'searchSort',
    required: false,
    description: '검색 정렬 필터(정렬 항목, 정렬 기준)',
    type: String,
    example: '{"field": "email", "sort": "asc"}',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '현재 페이지',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '페이지 크기',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: AdminSusiComprehensiveResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getAdminEarlydComprehensiveList(
    @Query() commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminSusiComprehensiveResponseDto> {
    return this.adminSusiComprehensiveService.getAdminSusiComprehensiveList(commonSearchQueryDto);
  }

  @Post('upload')
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 수시 학종 통합DB 엑셀 파일 업로드' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.adminSusiComprehensiveService.syncDatabaseWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
