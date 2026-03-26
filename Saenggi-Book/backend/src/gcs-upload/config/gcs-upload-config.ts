import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import { GcsUploadConfig } from './gcs-upload-config.type';
import { validateConfig } from 'src/common/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  GCS_PROJECT_ID: string;

  @IsString()
  @IsOptional()
  GCS_BUCKET_NAME: string;

  @IsString()
  @IsOptional()
  GCS_KEY_FILENAME: string;

  @IsString()
  @IsOptional()
  GCS_PUBLIC_URL: string;
}

export default registerAs<GcsUploadConfig>('gcsUpload', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    projectId: process.env.GCS_PROJECT_ID,
    bucketName: process.env.GCS_BUCKET_NAME,
    keyFilename: process.env.GCS_KEY_FILENAME,
    publicUrl: process.env.GCS_PUBLIC_URL,
  };
});
