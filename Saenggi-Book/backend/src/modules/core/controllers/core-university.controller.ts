// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
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
import { CoreUniversityService } from '../services/core-university.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateUniversityDto, UpdateUniversityDto } from '../dtos/university.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('core')
@Controller('core/universities')
export class CoreUniversityController {
  constructor(private readonly universityService: CoreUniversityService) {}

  @ApiOperation({
    summary: '대학 목록 조회',
    description: '모든 대학 목록을 페이지네이션과 함께 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '대학 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Get()
  async findAll(@Query() query: PaginationDto): Promise<{
    universities: UniversityEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { universities, total } = await this.universityService.findAll(query);
    return {
      universities,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  @ApiOperation({
    summary: '대학 상세 조회',
    description: '특정 대학의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '대학 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '대학 상세 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '대학을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.universityService.findOne(id);
  }

  @ApiOperation({
    summary: '[관리자] 대학 추가',
    description: '새로운 대학을 등록합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiResponse({
    status: 201,
    description: '대학 추가 성공',
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
  async create(@Body() dto: CreateUniversityDto): Promise<any> {
    return this.universityService.create(dto);
  }

  @ApiOperation({
    summary: '[관리자] 대학 수정',
    description: '기존 대학 정보를 수정합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiParam({ name: 'id', description: '대학 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '대학 수정 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '대학을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @Roles(['ROLE_ADMIN'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUniversityDto,
  ): Promise<any> {
    return this.universityService.update(id, dto);
  }

  @ApiOperation({
    summary: '[관리자] 대학 삭제',
    description: '대학을 삭제합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiParam({ name: 'id', description: '대학 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '대학 삭제 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '대학을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @Roles(['ROLE_ADMIN'])
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.universityService.remove(id);
  }

  @ApiOperation({
    summary: '[관리자] 대학 목록 엑셀 업로드',
    description: '엑셀 파일로 대학 목록을 일괄 업로드합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 엑셀 파일 (.xlsx)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 및 처리 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 파일 형식',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiBearerAuth('access-token')
  @Post('upload')
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
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.universityService.syncUniversitiesWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
