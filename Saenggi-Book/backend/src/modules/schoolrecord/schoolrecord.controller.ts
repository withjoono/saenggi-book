import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { SchoolRecordService } from './schoolrecord.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SchoolRecordHtmlParserService } from './parsers/html-parser.service';
import { AiPdfParserService } from './parsers/ai-pdf-parser.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('schoolrecord')
@ApiBearerAuth('access-token')
@Controller('schoolrecord')
export class SchoolRecordController {
  constructor(
    private readonly schoolRecordService: SchoolRecordService,
    private readonly htmlParserService: SchoolRecordHtmlParserService,
    private readonly aiPdfParserService: AiPdfParserService,
  ) { }

  @Get('files')
  @Roles(['ROLE_ADMIN'])
  async getAllSchoolRecordFiles(@Query() paginationDto: PaginationDto & { searchKey?: string }) {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;
    const { searchKey } = paginationDto;
    const skip = (page - 1) * limit;

    const [files, total] = await this.schoolRecordService.getMemberUploadFiles(
      skip,
      limit,
      searchKey,
    );

    return {
      files,
      total,
      page,
      limit,
    };
  }

  /*
  @Post('upload/pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSchoolRecordPdf(
    @UploadedFile() file: Express.Multer.File,
    @CurrentMemberId() memberId: string,
  ) {
    const uploadedFileUrl = await this.schoolRecordService.uploadSchoolRecordPdf(memberId, file);
    return { url: uploadedFileUrl };
  }
  */

  @Get('access')
  @Roles(['ROLE_ADMIN'])
  async getFileAccess(@Query('fileKey') fileKey: string) {
    const signedUrl = await this.schoolRecordService.getSchoolRecordFile(fileKey);
    return { signedUrl };
  }

  /*
  @Delete(':schoolRecordId')
  @Roles(['ROLE_ADMIN'])
  async deleteSchoolRecord(@Param('schoolRecordId') schoolRecordId: string) {
    return this.schoolRecordService.deleteSchoolRecordById(schoolRecordId);
  }
  */

  /**
   * HTML 형식 학생부 파싱 (재학생용 - NEIS에서 다운로드)
   */
  /*
  // ====================================================================
  // [Hub DB 이전] HTML/PDF 파싱은 Hub 백엔드(localhost:4000)에서 처리
  // MySanggibu 백엔드는 읽기 전용으로만 생기부 데이터를 사용합니다.
  // ====================================================================

  @Post('parse/html')
  @ApiOperation({ summary: 'HTML 학생부 파싱 (재학생용)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'NEIS에서 다운로드한 HTML 파일',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseHtmlSchoolRecord(
    @UploadedFile() file: Express.Multer.File,
    @CurrentMemberId() memberId: string,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    if (!file.mimetype.includes('html') && !file.originalname.endsWith('.html')) {
      throw new BadRequestException('HTML 파일만 업로드 가능합니다.');
    }

    const htmlContent = file.buffer.toString('utf-8');
    const result = this.htmlParserService.parseAll(htmlContent);

    return {
      memberId: Number(memberId),
      subjectLearningsCount: result.subjectLearnings.length,
      selectSubjectsCount: result.selectSubjects.length,
      volunteersCount: result.volunteers.length,
      data: result,
    };
  }
  */

  /**
   * PDF 형식 학생부 파싱 (졸업생용)
   * - AI(GPT)로 PDF 파싱 후 자동으로 DB에 저장
   */
  /*
  @Post('parse/pdf')
  @ApiOperation({ summary: 'PDF 학생부 파싱 및 저장 (졸업생용)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '졸업생 학생부 PDF 파일',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async parsePdfSchoolRecord(
    @UploadedFile() file: Express.Multer.File,
    @CurrentMemberId() memberId: string,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('PDF 파일만 업로드 가능합니다.');
    }

    // AI 기반 파서 사용 (OpenAI GPT)
    const result = await this.aiPdfParserService.parse(file.buffer);

    // 파싱 결과를 DB에 저장
    await this.schoolRecordService.saveParsedPdfData(memberId, result);

    return {
      memberId: Number(memberId),
      subjectLearningsCount: result.subjectLearnings.length,
      selectSubjectsCount: result.selectSubjects.length,
      data: result,
    };
  }
  */
}
