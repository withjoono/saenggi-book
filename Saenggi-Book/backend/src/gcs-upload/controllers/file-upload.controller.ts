import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { GcsUploadService } from '../gcs-upload.service';

@ApiTags('File Upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly gcsUploadService: GcsUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '단일 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        destination: {
          type: 'string',
          description: '저장 경로 (선택사항)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '파일이 성공적으로 업로드되었습니다',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://storage.googleapis.com/bucket-name/path/to/file.jpg',
        },
      },
    },
  })
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('destination') destination?: string,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 제공되지 않았습니다');
    }

    const url = await this.gcsUploadService.uploadFile(file, destination);
    return { url };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // 최대 10개 파일
  @ApiOperation({ summary: '여러 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        destination: {
          type: 'string',
          description: '저장 경로 (선택사항)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '파일들이 성공적으로 업로드되었습니다',
    schema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: [
            'https://storage.googleapis.com/bucket-name/path/to/file1.jpg',
            'https://storage.googleapis.com/bucket-name/path/to/file2.jpg',
          ],
        },
      },
    },
  })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('destination') destination?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('파일이 제공되지 않았습니다');
    }

    const urls = await this.gcsUploadService.uploadFiles(files, destination);
    return { urls };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '파일 삭제' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileUrl: {
          type: 'string',
          description: '삭제할 파일의 URL',
          example: 'https://storage.googleapis.com/bucket-name/path/to/file.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: '파일이 성공적으로 삭제되었습니다',
  })
  async deleteFile(@Body('fileUrl') fileUrl: string) {
    if (!fileUrl) {
      throw new BadRequestException('파일 URL이 제공되지 않았습니다');
    }

    await this.gcsUploadService.deleteFile(fileUrl);
  }
}
