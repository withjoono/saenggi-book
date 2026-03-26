/**
 * 수시 교과/학종 데이터 업로드 스크립트
 *
 * 실행: npx ts-node upload-susi-data.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AdminSusiSubjectService } from './src/admin/services/admin-susi-subject.service';
import { AdminSusiComprehensiveService } from './src/admin/services/admin-susi-comprehensive.service';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const originalFile = path.join(__dirname, 'uploads', '교과 학종 out 240823.xlsx');
  const tempDir = path.join(__dirname, 'uploads', 'temp');

  // temp 디렉토리 생성
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log('=== 수시 데이터 업로드 시작 ===');
  console.log('원본 파일:', originalFile);

  try {
    // 교과 업로드용 복사본
    const subjectFile = path.join(tempDir, 'subject_temp.xlsx');
    fs.copyFileSync(originalFile, subjectFile);

    console.log('\n[1/2] 교과 데이터 업로드 중...');
    const subjectService = app.get(AdminSusiSubjectService);
    await subjectService.syncDatabaseWithExcel(subjectFile);
    console.log('✓ 교과 데이터 업로드 완료');

    // 학종 업로드용 복사본
    const comprehensiveFile = path.join(tempDir, 'comprehensive_temp.xlsx');
    fs.copyFileSync(originalFile, comprehensiveFile);

    console.log('\n[2/2] 학종 데이터 업로드 중...');
    const comprehensiveService = app.get(AdminSusiComprehensiveService);
    await comprehensiveService.syncDatabaseWithExcel(comprehensiveFile);
    console.log('✓ 학종 데이터 업로드 완료');

    console.log('\n=== 모든 데이터 업로드 완료 ===');
  } catch (error) {
    console.error('업로드 실패:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
