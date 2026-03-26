import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminSusiSubjectService } from '../services/admin-susi-subject.service';
import { AdminSusiSubjectResponseDto } from '../dtos/admin-susi-subject-response.dto';

@ApiTags('[관리자] 수시 교과 통합DB')
@Controller('admin/ms/subject')
export class AdminSusiSubjectController {
  constructor(private readonly adminSusiSubjectService: AdminSusiSubjectService) { }

  @Get()
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 수시 교과 통합DB 목록 조회' })
  getAdminEarlydSubjectList(
    @Query() commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminSusiSubjectResponseDto> {
    return this.adminSusiSubjectService.getAdminSusiSubjectList(commonSearchQueryDto);
  }

  @Post('upload')
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 수시 교과 통합DB 엑셀 파일 업로드' })
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
    await this.adminSusiSubjectService.syncDatabaseWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }

  @Post('update-grade-cuts')
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 수시 교과 50%컷, 70%컷 업데이트' })
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
  async updateGradeCuts(@UploadedFile() file: Express.Multer.File) {
    const result = await this.adminSusiSubjectService.updateGradeCutsFromExcel(file.path);
    return {
      message: 'Grade cuts updated successfully',
      ...result,
    };
  }
}
