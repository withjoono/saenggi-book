import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminSusiFormulaService } from '../services/admin-susi-formula.service';

@ApiTags('관리자 - 수시 환산공식')
@Controller('admin/ms/formula')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ROLE_ADMIN'])
@ApiBearerAuth()
export class AdminSusiFormulaController {
  constructor(private readonly adminSusiFormulaService: AdminSusiFormulaService) { }

  /**
   * 환산 공식 엑셀 업로드
   * POST /admin/susi/formula/import
   */
  @Post('import')
  @ApiOperation({
    summary: '수시 환산 공식 엑셀 업로드',
    description:
      '대학별 교과전형 환산 공식이 담긴 엑셀 파일을 업로드합니다.\n\n' +
      '**엑셀 필수 컬럼:**\n' +
      '- 대학명 (university_name)\n' +
      '- 학년별 반영비율 (grade_1_ratio, grade_2_ratio, grade_3_ratio)\n' +
      '- 교과별 반영비율 (korean_ratio, english_ratio, math_ratio, social_ratio, science_ratio)\n' +
      '- 등급별 환산점수 (1등급환산 ~ 9등급환산 또는 grade_1 ~ grade_9)\n\n' +
      '**선택 컬럼:**\n' +
      '- 대학코드, 반영학기, 만점, 출결점수, 봉사점수, 비고 등',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '환산 공식 엑셀 파일',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '.xlsx 형식 파일',
        },
        year: {
          type: 'integer',
          description: '적용 연도 (기본값: 2026)',
          default: 2026,
        },
      },
    },
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '적용 연도',
  })
  @ApiResponse({
    status: 200,
    description: '업로드 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', example: 50 },
        failed: { type: 'number', example: 2 },
        errors: { type: 'array', items: { type: 'string' }, example: ['행 5: 대학명 누락'] },
      },
    },
  })
  @ApiResponse({ status: 400, description: '파일 형식 오류' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `susi-formula-${uniqueSuffix}.xlsx`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          !file.originalname.match(/\.(xlsx|xls)$/) &&
          !file.mimetype.includes('spreadsheet')
        ) {
          return cb(new BadRequestException('엑셀 파일만 업로드 가능합니다.'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async importFormulas(
    @UploadedFile() file: Express.Multer.File,
    @Query('year') year?: number,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    return this.adminSusiFormulaService.importFormulasFromExcel(
      file.path,
      year ? Number(year) : 2026,
    );
  }

  /**
   * 저장된 환산 공식 목록 조회
   * GET /admin/susi/formula/list
   */
  @Get('list')
  @ApiOperation({
    summary: '환산 공식 목록 조회',
    description: '저장된 대학별 환산 공식 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '적용 연도 필터',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 50 },
        formulas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              university_name: { type: 'string' },
              year: { type: 'number' },
              grade_1_ratio: { type: 'number' },
              korean_ratio: { type: 'number' },
              max_score: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getFormulaList(
    @Query('year') year?: number,
  ): Promise<{ total: number; formulas: any[] }> {
    const formulas = await this.adminSusiFormulaService.getFormulaList(
      year ? Number(year) : undefined,
    );
    return {
      total: formulas.length,
      formulas,
    };
  }

  /**
   * 캐시 리로드
   * POST /admin/susi/formula/reload-cache
   */
  @Post('reload-cache')
  @ApiOperation({
    summary: '환산 공식 캐시 리로드',
    description: 'DB에서 환산 공식 데이터를 다시 로드하여 메모리 캐시를 갱신합니다.',
  })
  @ApiResponse({ status: 200, description: '리로드 성공' })
  async reloadCache(): Promise<{ message: string }> {
    await this.adminSusiFormulaService.reloadCache();
    return { message: '환산 공식 캐시가 리로드되었습니다.' };
  }
}
