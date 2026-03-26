// @ts-nocheck
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  ParseIntPipe,
  Param,
  Body,
  Patch,
  Delete,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CoreAdmissionService } from '../services/core-admission.service';
import { CreateAdmissionDto, UpdateAdmissionDto } from '../dtos/admission.dto';

@ApiTags('core')
@Controller('core/admission')
export class CoreAdmissionController {
  constructor(private readonly admissionService: CoreAdmissionService) {}

  @ApiOperation({
    summary: '대학별 전형 목록 조회',
    description: '특정 대학의 모든 전형(교과, 학종 등) 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'university_id',
    description: '대학 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '전형 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Get()
  async findAllByUniversity(
    @Query('university_id', ParseIntPipe) universityId: number,
  ): Promise<any[]> {
    return this.admissionService.findAllByUniversity(universityId);
  }

  @ApiOperation({
    summary: '개별 전형 조회',
    description: '특정 전형의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '전형 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '전형을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.admissionService.findOne(id);
  }

  @ApiOperation({
    summary: '[관리자] 전형 추가',
    description: '새로운 전형을 등록합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiResponse({
    status: 201,
    description: '전형 추가 성공',
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
  async create(@Body() createAdmissionDto: CreateAdmissionDto): Promise<any> {
    return this.admissionService.create(createAdmissionDto);
  }

  @ApiOperation({
    summary: '[관리자] 전형 수정',
    description: '기존 전형 정보를 수정합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiParam({ name: 'id', description: '전형 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 수정 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '전형을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @Roles(['ROLE_ADMIN'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdmissionDto: UpdateAdmissionDto,
  ): Promise<any> {
    return this.admissionService.update(id, updateAdmissionDto);
  }

  @ApiOperation({
    summary: '[관리자] 전형 삭제',
    description: '전형을 삭제합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiParam({ name: 'id', description: '전형 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 삭제 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '전형을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @Roles(['ROLE_ADMIN'])
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.admissionService.remove(id);
  }

  @ApiOperation({
    summary: '[관리자] 대학 전형(교과) 목록 엑셀 업로드',
    description: '교과전형 목록을 엑셀 파일로 일괄 업로드합니다.',
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
    await this.admissionService.syncSubjectAdmissionsWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }

  @ApiOperation({
    summary: '[관리자] 대학 전형(학종) 목록 엑셀 업로드',
    description: '학생부종합전형 목록을 엑셀 파일로 일괄 업로드합니다.',
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
    await this.admissionService.syncComprehensiveAdmissionsWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
