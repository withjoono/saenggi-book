// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

@Injectable()
export class SubjectCodesService {
  constructor(  ) {}

  async findAll(): Promise<SubjectCodeListEntity[]> {
    return await this.subjectCodeRepository.find();
  }

  async syncDatabaseWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 기존 데이터 삭제
      await queryRunner.manager.clear(SubjectCodeListEntity);

      // 엑셀 파일 읽기
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      const CHUNK_SIZE = 300;
      let chunk = [];

      for (let i = 1; i < sheet.length; i++) {
        const row = sheet[i];

        const subjectCode = new SubjectCodeListEntity();
        subjectCode.main_subject_code = row['B'];
        subjectCode.main_subject_name = row['A'].replace(/\s+/g, '');
        subjectCode.subject_code = row['G'];
        subjectCode.subject_name = row['E'].replace(/\s+/g, '');
        subjectCode.type = row['I'] === '석차등급' ? 0 : 1;
        subjectCode.course_type = this.getCourseType(row['C']);
        subjectCode.is_required = row['H'] === '0';

        chunk.push(subjectCode);

        if (chunk.length === CHUNK_SIZE || i === sheet.length - 1) {
          await queryRunner.manager.save(SubjectCodeListEntity, chunk);
          chunk = [];
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('데이터 동기화 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
      // 파일 삭제
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }

  private getCourseType(typeString: string): number {
    switch (typeString) {
      case '공통과목':
        return 0;
      case '일반선택':
        return 1;
      case '진로선택':
        return 2;
      case '전문 교과Ⅰ':
        return 3;
      case '전문 교과Ⅱ':
        return 4;
      default:
        return 0; // 기본값으로 공통과목 설정
    }
  }
}
