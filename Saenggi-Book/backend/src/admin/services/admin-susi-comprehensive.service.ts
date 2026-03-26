// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import {
  convertExcelDate,
  convertExcelTime,
  isExcelDate,
  isExcelTime,
} from 'src/common/utils/excel-utils';
import { SusiComprehensiveService } from 'src/modules/susi/services/susi-comprehensive.service';
import { AdminSusiComprehensiveResponseDto } from '../dtos/admin-susi-comprehensive-response.dto';
import { comprehensiveExcelFieldMapping } from '../excel-mapper/comprehensive-excel-field-mapper';

@Injectable()
export class AdminSusiComprehensiveService {
  constructor(private readonly susiComprehensiveService: SusiComprehensiveService) {}

  async getAdminSusiComprehensiveList(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminSusiComprehensiveResponseDto> {
    const { list, totalCount } =
      await this.susiComprehensiveService.getAllSusiComprehensive(commonSearchQueryDto);
    return { list, totalCount };
  }

  async syncDatabaseWithExcel(filePath: string): Promise<void> {
    try {
      await this.susiComprehensiveService.clear();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[1]; // 두번째 시트 (학종)
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      const CHUNK_SIZE = 300; // 청크 사이즈 설정
      let chunk = [];
      let id = 1;
      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i] as Record<string, any>;
        const entity = new SusiComprehensiveEntity();
        entity.id = id;
        ++id;

        for (const [key, value] of Object.entries(row)) {
          const columnName = comprehensiveExcelFieldMapping[key];

          if (columnName && value !== '-') {
            let processedValue: any = value;

            if (columnName === 'interview_date_text' && isExcelDate(value)) {
              processedValue = convertExcelDate(value);
            } else if (columnName === 'interview_time' && isExcelTime(value)) {
              processedValue = convertExcelTime(value);
            } else if (typeof value === 'string') {
              processedValue = value.trim() === '' ? null : value;
            }

            if (
              processedValue === 'none' ||
              processedValue === '#N/A' ||
              (columnName !== 'minimum_academic_standards_applied' && processedValue === 'N')
            ) {
              continue;
            }

            if (columnName === 'minimum_academic_standards_applied') {
              processedValue = processedValue === 'Y' ? 1 : 0;
            }

            // varchar 필드 길이 제한 처리 (엔티티 정의 기반)
            const varcharLimits = {
              unified_id: 50,
              region: 20,
              university_name: 50,
              university_code: 20,
              national_or_private: 10,
              basic_type: 30,
              detailed_type: 100,
              type_name: 100,
              central_classification: 10,
              department: 10,
              recruitment_unit_name: 100,
              large_department: 50,
              medium_department: 50,
              small_department: 50,
              recruitment_number: 30,
              selection_model: 30,
              selection_ratio: 30,
              selection_method: 80,
              cut_50: 50,
              cut_70: 50,
              additional_point: 50,
              additional_point_text: 50,
              evaluation_ratios: 80,
              evaluation_code: 60,
              interview_type: 50,
              interview_resources: 100,
              interview_method: 100,
              interview_evaluation_content: 100,
              interview_date_text: 80,
              interview_time: 20,
              admission_criteria_2024: 120,
              admission_2024_grade: 80,
              admission_2024_converted_score: 80,
              competition_rate_2024: 80,
              replenishment_2024: 80,
              admission_criteria_2023: 50,
              admission_2023_grade: 80,
              admission_2023_converted_score: 80,
              competition_rate_2023: 80,
              replenishment_2023: 80,
              admission_criteria_2022: 50,
              admission_2022_grade: 80,
              competition_rate_2022: 80,
              replenishment_2022: 80,
              admission_2021_grade: 80,
              competition_rate_2021: 80,
              replenishment_2021: 80,
              admission_2020_grade: 80,
              competition_rate_2020: 80,
              replenishment_2020: 80,
              application_notes: 50,
            };
            if (varcharLimits[columnName] && typeof processedValue === 'string') {
              if (processedValue.length > varcharLimits[columnName]) {
                processedValue = processedValue.substring(0, varcharLimits[columnName]);
              }
            }

            // int 타입 필드에 소수점 값이 들어오면 반올림
            const intFields = [
              'year', 'document_rate', 'interview_rate', 'other_rate',
              'step2_step1_score_rate', 'step2_interview_rate', 'step2_other_rate',
              'minimum_academic_standards_applied', 'minimum_korean', 'minimum_math',
              'minimum_math_science_engineering', 'minimum_english', 'minimum_social_studies',
              'minimum_science_studies', 'minimum_calculation_studies', 'minimum_count',
              'minimum_others', 'interview_score_applied',
            ];
            if (intFields.includes(columnName) && typeof processedValue === 'number' && !Number.isInteger(processedValue)) {
              processedValue = Math.round(processedValue);
            }

            entity[columnName] = processedValue;
          }
        }

        chunk.push(entity);

        if (chunk.length === CHUNK_SIZE || i === sheet.length - 1) {
          await this.susiComprehensiveService.insertSusiComprehensive(chunk);
          chunk = [];

          // // 배치 처리 후 잠시 대기
          // await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
        }
      }
    } catch (error) {
      throw error;
    } finally {
      // 파일 삭제
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }
}
