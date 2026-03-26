import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage, Bucket } from '@google-cloud/storage';
import { AllConfigType } from 'src/config/config.type';
import * as path from 'path';

@Injectable()
export class GcsUploadService {
  private readonly logger = new Logger(GcsUploadService.name);
  private storage: Storage;
  private bucket: Bucket;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService<AllConfigType>) {
    const gcsConfig = this.configService.get('gcsUpload', { infer: true });

    if (!gcsConfig?.projectId || !gcsConfig?.bucketName) {
      this.logger.warn(
        'GCS configuration is incomplete. File upload functionality will be disabled.',
      );
      return;
    }

    try {
      const storageOptions: any = {
        projectId: gcsConfig.projectId,
      };

      // 키 파일이 제공된 경우에만 추가
      if (gcsConfig.keyFilename) {
        storageOptions.keyFilename = gcsConfig.keyFilename;
      }

      this.storage = new Storage(storageOptions);
      this.bucketName = gcsConfig.bucketName;
      this.bucket = this.storage.bucket(this.bucketName);
      this.publicUrl = gcsConfig.publicUrl || `https://storage.googleapis.com/${this.bucketName}`;

      this.logger.log(`GCS Upload Service initialized with bucket: ${this.bucketName}`);
    } catch (error) {
      this.logger.error('Failed to initialize GCS Upload Service', error);
      throw error;
    }
  }

  /**
   * 파일을 GCS에 업로드합니다
   * @param file - 업로드할 파일 (Multer.File)
   * @param destination - 저장 경로 (선택사항)
   * @returns 업로드된 파일의 공개 URL
   */
  async uploadFile(file: Express.Multer.File, destination?: string): Promise<string> {
    if (!this.bucket) {
      throw new Error('GCS is not properly configured');
    }

    try {
      // 파일명 생성: timestamp_originalname
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      const filename = `${timestamp}_${basename}${ext}`;

      // 저장 경로 설정
      const filePath = destination ? `${destination}/${filename}` : filename;

      const blob = this.bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          this.logger.error('Upload error:', err);
          reject(err);
        });

        blobStream.on('finish', async () => {
          // 파일을 공개로 설정
          await blob.makePublic();

          const publicUrl = `${this.publicUrl}/${filePath}`;
          this.logger.log(`File uploaded successfully: ${publicUrl}`);
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error('Failed to upload file to GCS', error);
      throw error;
    }
  }

  /**
   * 여러 파일을 GCS에 업로드합니다
   * @param files - 업로드할 파일 배열
   * @param destination - 저장 경로 (선택사항)
   * @returns 업로드된 파일들의 공개 URL 배열
   */
  async uploadFiles(files: Express.Multer.File[], destination?: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, destination));
    return Promise.all(uploadPromises);
  }

  /**
   * GCS에서 파일을 삭제합니다
   * @param fileUrl - 삭제할 파일의 URL 또는 경로
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.bucket) {
      throw new Error('GCS is not properly configured');
    }

    try {
      // URL에서 파일 경로 추출
      const filePath = fileUrl.replace(`${this.publicUrl}/`, '');
      const file = this.bucket.file(filePath);

      await file.delete();
      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to delete file from GCS', error);
      throw error;
    }
  }

  /**
   * 파일이 존재하는지 확인합니다
   * @param fileUrl - 확인할 파일의 URL 또는 경로
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    if (!this.bucket) {
      throw new Error('GCS is not properly configured');
    }

    try {
      const filePath = fileUrl.replace(`${this.publicUrl}/`, '');
      const file = this.bucket.file(filePath);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      this.logger.error('Failed to check file existence', error);
      return false;
    }
  }
}
