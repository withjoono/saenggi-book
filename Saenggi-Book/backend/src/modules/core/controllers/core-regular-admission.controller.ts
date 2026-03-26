// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  CreateRegularAdmissionDto,
  UpdateRegularAdmissionDto,
} from '../dtos/regular-admission.dto';
import { CoreRegularAdmissionService } from '../services/core-regular-admission.service';

@ApiTags('regular')
@Controller('core/regular-admission')
export class CoreRegularAdmissionController {
  constructor(private readonly regularAdmissionService: CoreRegularAdmissionService) {}

  @ApiOperation({
    summary: '정시 전형 목록 조회',
    description: '모든 정시 전형(가/나/다군) 목록을 조회합니다. 관리자 전용입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '정시 전형 목록 조회 성공',
  })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Get()
  @Roles(['ROLE_ADMIN'])
  async findAll(): Promise<any[]> {
    return this.regularAdmissionService.findAll();
  }

  @ApiOperation({
    summary: '개별 정시 전형 조회',
    description: '특정 정시 전형의 상세 정보를 조회합니다. 관리자 전용입니다.',
  })
  @ApiParam({ name: 'id', description: '정시 전형 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '정시 전형 조회 성공',
  })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '정시 전형을 찾을 수 없음' })
  @ApiBearerAuth('access-token')
  @Get(':id')
  @Roles(['ROLE_ADMIN'])
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.regularAdmissionService.findOne(id);
  }

  @ApiOperation({
    summary: '[관리자] 정시 전형 추가',
    description: '새로운 정시 전형을 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '정시 전형 추가 성공',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Post()
  @Roles(['ROLE_ADMIN'])
  async create(
    @Body() createRegularAdmissionDto: CreateRegularAdmissionDto,
  ): Promise<any> {
    return this.regularAdmissionService.create(createRegularAdmissionDto);
  }

  @ApiOperation({
    summary: '[관리자] 정시 전형 수정',
    description: '기존 정시 전형 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '정시 전형 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '정시 전형 수정 성공',
  })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '정시 전형을 찾을 수 없음' })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @Roles(['ROLE_ADMIN'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegularAdmissionDto: UpdateRegularAdmissionDto,
  ): Promise<any> {
    return this.regularAdmissionService.update(id, updateRegularAdmissionDto);
  }

  @ApiOperation({
    summary: '[관리자] 정시 전형 삭제',
    description: '정시 전형을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '정시 전형 ID', example: 1 })
  @ApiResponse({ status: 200, description: '정시 전형 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '정시 전형을 찾을 수 없음' })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @Roles(['ROLE_ADMIN'])
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.regularAdmissionService.remove(id);
  }

  @ApiOperation({
    summary: '[관리자] 정시 전형 목록 엑셀 업로드',
    description: '정시 전형 목록을 엑셀 파일로 일괄 업로드합니다.',
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
  @ApiResponse({ status: 200, description: '파일 업로드 및 처리 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Public()
  @Post('upload')
  // @Roles(['ROLE_ADMIN'])
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
    await this.regularAdmissionService.syncWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
