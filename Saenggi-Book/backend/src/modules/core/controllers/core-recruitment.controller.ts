// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CoreRecruitmentUnitService } from '../services/core-recruitment.service';
import { CreateRecruitmentUnitDto, UpdateRecruitmentUnitDto } from '../dtos/recruitment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('core')
@Controller('core/recruitment')
export class CoreRecruitmentController {
  constructor(private readonly recruitmentService: CoreRecruitmentUnitService) {}

  @ApiOperation({
    summary: '전형별 모집단위 목록 조회',
    description: '특정 전형에 속한 모든 모집단위(학과) 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'admission_id',
    description: '전형 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '모집단위 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Get()
  async findAllByAdmission(
    @Query('admission_id', ParseIntPipe) admissionId: number,
  ): Promise<any[]> {
    return this.recruitmentService.findAllByAdmission(admissionId);
  }

  @ApiOperation({
    summary: '개별 모집단위 조회',
    description: '특정 모집단위의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '모집단위 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '모집단위 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '모집단위를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.recruitmentService.findOne(id);
  }

  @ApiOperation({
    summary: '[관리자] 모집단위 추가',
    description: '새로운 모집단위를 등록합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiResponse({
    status: 201,
    description: '모집단위 추가 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Post()
  @Roles(['ROLE_ADMIN'])
  async create(
    @Body() createRecruitmentUnitDto: CreateRecruitmentUnitDto,
  ): Promise<any> {
    return this.recruitmentService.create(createRecruitmentUnitDto);
  }

  @ApiOperation({
    summary: '[관리자] 모집단위 수정',
    description: '기존 모집단위 정보를 수정합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiParam({ name: 'id', description: '모집단위 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '모집단위 수정 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '모집단위를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @Roles(['ROLE_ADMIN'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecruitmentUnitDto: UpdateRecruitmentUnitDto,
  ): Promise<any> {
    return this.recruitmentService.update(id, updateRecruitmentUnitDto);
  }

  @ApiOperation({
    summary: '[관리자] 모집단위 삭제',
    description: '모집단위를 삭제합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiParam({ name: 'id', description: '모집단위 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '모집단위 삭제 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '모집단위를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @Roles(['ROLE_ADMIN'])
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.recruitmentService.remove(id);
  }

  @ApiOperation({
    summary: '[관리자] 모집단위(교과) 목록 엑셀 업로드',
    description: '교과전형 모집단위 목록을 엑셀 파일로 일괄 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 및 처리 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Post('upload/subject')
  @Roles(['ROLE_ADMIN'])
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
  async uploadSubjectFile(@UploadedFile() file: Express.Multer.File) {
    await this.recruitmentService.syncSubjectRecruitmentUnitsWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }

  @ApiOperation({
    summary: '[관리자] 모집단위(학종) 목록 엑셀 업로드',
    description: '학생부종합전형 모집단위 목록을 엑셀 파일로 일괄 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 및 처리 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Post('upload/comprehensive')
  @Roles(['ROLE_ADMIN'])
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
  async uploadComprehensiveFile(@UploadedFile() file: Express.Multer.File) {
    await this.recruitmentService.syncComprehensiveRecruitmentUnitsWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }

  @ApiOperation({
    summary: '[관리자] 모집단위 합불데이터 업로드',
    description: '모집단위별 합격/불합격 데이터를 엑셀 파일로 일괄 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 및 처리 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Post('upload/pass-fail')
  @Roles(['ROLE_ADMIN'])
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
  async uploadPassFailRecordsFile(@UploadedFile() file: Express.Multer.File) {
    await this.recruitmentService.syncPassFailRecordsWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
