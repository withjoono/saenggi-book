import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GcsUploadService } from './gcs-upload.service';
import { FileUploadController } from './controllers/file-upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FileUploadController],
  providers: [GcsUploadService],
  exports: [GcsUploadService],
})
export class GcsUploadModule {}
