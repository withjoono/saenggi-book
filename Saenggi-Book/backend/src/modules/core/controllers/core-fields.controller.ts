// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
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
import { CoreFieldsService } from '../services/core-fields.service';
import {
  CreateGeneralFieldDto,
  CreateMajorFieldDto,
  CreateMidFieldDto,
  CreateMinorFieldDto,
  UpdateGeneralFieldDto,
  UpdateMajorFieldDto,
  UpdateMidFieldDto,
  UpdateMinorFieldDto,
} from '../dtos/fields.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('core')
@Controller('core/fields')
export class CoreFieldsController {
  constructor(private readonly coreFieldsService: CoreFieldsService) {}

  // MajorField endpoints
  @ApiOperation({
    summary: '대계열 목록 조회',
    description: '모든 대계열(인문, 자연, 예체능 등) 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '대계열 목록 조회 성공',
  })
  @ApiBearerAuth('access-token')
  @Get('major')
  getAllMajorFields(): Promise<any[]> {
    return this.coreFieldsService.getAllMajorFields();
  }

  @ApiOperation({
    summary: '대계열 상세 조회',
    description: '특정 대계열의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '대계열 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '대계열 조회 성공',
  })
  @ApiBearerAuth('access-token')
  @Get('major/:id')
  getMajorFieldById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.coreFieldsService.getMajorFieldById(id);
  }

  @ApiOperation({
    summary: '[관리자] 대계열 추가',
  })
  @ApiResponse({ status: 201, description: '대계열 추가 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Post('major')
  @Roles(['ROLE_ADMIN'])
  createMajorField(@Body() createMajorFieldDto: CreateMajorFieldDto): Promise<any> {
    return this.coreFieldsService.createMajorField(createMajorFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 대계열 수정',
  })
  @ApiParam({ name: 'id', description: '대계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '대계열 수정 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Patch('major/:id')
  @Roles(['ROLE_ADMIN'])
  updateMajorField(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMajorFieldDto: UpdateMajorFieldDto,
  ): Promise<any> {
    return this.coreFieldsService.updateMajorField(id, updateMajorFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 대계열 삭제',
  })
  @ApiParam({ name: 'id', description: '대계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '대계열 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Delete('major/:id')
  @Roles(['ROLE_ADMIN'])
  deleteMajorField(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coreFieldsService.deleteMajorField(id);
  }

  // MidField endpoints
  @ApiOperation({
    summary: '중계열 목록 조회',
    description: '모든 중계열 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '중계열 목록 조회 성공' })
  @ApiBearerAuth('access-token')
  @Get('mid')
  getAllMidFields(): Promise<any[]> {
    return this.coreFieldsService.getAllMidFields();
  }

  @ApiOperation({
    summary: '중계열 상세 조회',
  })
  @ApiParam({ name: 'id', description: '중계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '중계열 조회 성공' })
  @ApiBearerAuth('access-token')
  @Get('mid/:id')
  getMidFieldById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.coreFieldsService.getMidFieldById(id);
  }

  @ApiOperation({
    summary: '[관리자] 중계열 추가',
  })
  @ApiResponse({ status: 201, description: '중계열 추가 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Post('mid')
  @Roles(['ROLE_ADMIN'])
  createMidField(@Body() createMidFieldDto: CreateMidFieldDto): Promise<any> {
    return this.coreFieldsService.createMidField(createMidFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 중계열 수정',
  })
  @ApiParam({ name: 'id', description: '중계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '중계열 수정 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Patch('mid/:id')
  @Roles(['ROLE_ADMIN'])
  updateMidField(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMidFieldDto: UpdateMidFieldDto,
  ): Promise<any> {
    return this.coreFieldsService.updateMidField(id, updateMidFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 중계열 삭제',
  })
  @ApiParam({ name: 'id', description: '중계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '중계열 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Delete('mid/:id')
  @Roles(['ROLE_ADMIN'])
  deleteMidField(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coreFieldsService.deleteMidField(id);
  }

  // MinorField endpoints
  @ApiOperation({
    summary: '소계열 목록 조회',
    description: '모든 소계열 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '소계열 목록 조회 성공' })
  @ApiBearerAuth('access-token')
  @Get('minor')
  getAllMinorFields(): Promise<any[]> {
    return this.coreFieldsService.getAllMinorFields();
  }

  @ApiOperation({
    summary: '소계열 상세 조회',
  })
  @ApiParam({ name: 'id', description: '소계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '소계열 조회 성공' })
  @ApiBearerAuth('access-token')
  @Get('minor/:id')
  getMinorFieldById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.coreFieldsService.getMinorFieldById(id);
  }

  @ApiOperation({
    summary: '[관리자] 소계열 추가',
  })
  @ApiResponse({ status: 201, description: '소계열 추가 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Post('minor')
  @Roles(['ROLE_ADMIN'])
  createMinorField(@Body() createMinorFieldDto: CreateMinorFieldDto): Promise<any> {
    return this.coreFieldsService.createMinorField(createMinorFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 소계열 수정',
  })
  @ApiParam({ name: 'id', description: '소계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '소계열 수정 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Patch('minor/:id')
  @Roles(['ROLE_ADMIN'])
  updateMinorField(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMinorFieldDto: UpdateMinorFieldDto,
  ): Promise<any> {
    return this.coreFieldsService.updateMinorField(id, updateMinorFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 소계열 삭제',
  })
  @ApiParam({ name: 'id', description: '소계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '소계열 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Delete('minor/:id')
  @Roles(['ROLE_ADMIN'])
  deleteMinorField(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coreFieldsService.deleteMinorField(id);
  }

  // GeneralField endpoints
  @ApiOperation({
    summary: '일반계열 목록 조회',
    description: '모든 일반계열 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '일반계열 목록 조회 성공' })
  @ApiBearerAuth('access-token')
  @Get('general')
  getAllGeneralFields(): Promise<any[]> {
    return this.coreFieldsService.getAllGeneralFields();
  }

  @ApiOperation({
    summary: '일반계열 상세 조회',
  })
  @ApiParam({ name: 'id', description: '일반계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '일반계열 조회 성공' })
  @ApiBearerAuth('access-token')
  @Get('general/:id')
  getGeneralFieldById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.coreFieldsService.getGeneralFieldById(id);
  }

  @ApiOperation({
    summary: '[관리자] 일반계열 추가',
  })
  @ApiResponse({ status: 201, description: '일반계열 추가 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Post('general')
  @Roles(['ROLE_ADMIN'])
  createGeneralField(
    @Body() createGeneralFieldDto: CreateGeneralFieldDto,
  ): Promise<any> {
    return this.coreFieldsService.createGeneralField(createGeneralFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 일반계열 수정',
  })
  @ApiParam({ name: 'id', description: '일반계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '일반계열 수정 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Patch('general/:id')
  @Roles(['ROLE_ADMIN'])
  updateGeneralField(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGeneralFieldDto: UpdateGeneralFieldDto,
  ): Promise<any> {
    return this.coreFieldsService.updateGeneralField(id, updateGeneralFieldDto);
  }

  @ApiOperation({
    summary: '[관리자] 일반계열 삭제',
  })
  @ApiParam({ name: 'id', description: '일반계열 ID', example: 1 })
  @ApiResponse({ status: 200, description: '일반계열 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth('access-token')
  @Delete('general/:id')
  @Roles(['ROLE_ADMIN'])
  deleteGeneralField(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coreFieldsService.deleteGeneralField(id);
  }

  @ApiOperation({
    summary: '[관리자] 계열 데이터 엑셀 업로드',
    description: '대/중/소 계열 데이터를 엑셀 파일로 일괄 업로드합니다. 기존 데이터는 유지됩니다.',
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
    await this.coreFieldsService.syncFieldsWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
