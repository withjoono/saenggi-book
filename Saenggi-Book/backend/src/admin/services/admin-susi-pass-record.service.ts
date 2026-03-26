// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import * as XLSX from 'xlsx';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminSusiPassRecordService {
  constructor(  ) {}

  // 합불 사례 전체조회 (admin)
  async getAdminRankingPassFail(commonSearchQueryDto: CommonSearchQueryDto) {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.susiPassRecordRepository,
    );

    const queryBuilder = this.susiPassRecordRepository.createQueryBuilder('A');

    if (param.search) {
      queryBuilder.where(param.search);
    }

    if (param.searchSort) {
      queryBuilder.orderBy(param.searchSort.field, param.searchSort.sort);
    }

    queryBuilder.skip((param.page - 1) * param.pageSize).take(param.pageSize);

    const [list, totalCount] = await queryBuilder.getManyAndCount();
    return {
      list: list,
      totalCount,
    };
  }

  async uploadFile(file: Express.Multer.File): Promise<void> {
    await this.susiPassRecordRepository.clear();

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const CHUNK_SIZE = 300; // 청크 사이즈 설정
    let chunk = [];

    try {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const record = new SusiPassRecordEntity();
        record.id = i;
        record.unified_id = (row[0] || '').trim();

        // record.region = (row[1] || '').trim(); 1번 (대학코드)

        record.region = (row[2] || '').trim();
        record.department = (row[3] || '').trim();
        record.university_name = (row[4] || '').trim();
        record.recruitment_unit_name = (row[5] || '').trim();
        record.central_classification = (row[6] || '').trim();
        record.basic_type = (row[7] || '').trim();
        record.type_name = (row[8] || '').trim();

        // record.final_result = (row[9] || '').trim(); 9번 (최저 적용 유무)

        record.first_result = (row[10] || '').trim();
        record.final_result = (row[11] || '').trim();
        record.avg_grade_all = (row[12] || '').trim();
        record.avg_grade_gyss = (row[13] || '').trim();
        record.avg_grade_gysg = (row[14] || '').trim();
        record.avg_grade_gyst_100 = (row[15] || '').trim();
        record.avg_grade_gyst = (row[16] || '').trim();

        chunk.push(record);

        if (chunk.length === CHUNK_SIZE || i === rows.length - 1) {
          await this.susiPassRecordRepository.save(chunk);
          chunk = [];

          // // 배치 처리 후 잠시 대기
          // await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
        }
      }
    } catch (error) {
      console.error('업로드 중 오류 발생:', error);
      throw error;
    } finally {
      // 파일 삭제
      const filePath = path.join(__dirname, file.originalname);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }
}
