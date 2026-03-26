// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { AdminSusiSubjectResponseDto } from '../dtos/admin-susi-subject-response.dto';
import {
  convertExcelDate,
  convertExcelTime,
  isExcelDate,
  isExcelTime,
} from 'src/common/utils/excel-utils';
import { SusiSubjectService } from 'src/modules/susi/services/susi-subject.service';
import { subjectExcelFieldMapping } from '../excel-mapper/subject-excel-field-mapper';

@Injectable()
export class AdminSusiSubjectService {
  constructor(private readonly susiSubjectService: SusiSubjectService) {}

  async getAdminSusiSubjectList(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminSusiSubjectResponseDto> {
    const { list, totalCount } =
      await this.susiSubjectService.getAllSusiSubject(commonSearchQueryDto);
    return { list, totalCount };
  }

  async updateGradeCutsFromExcel(filePath: string): Promise<{ success: number; failed: number; notFound: number }> {
    let successCount = 0;
    let failedCount = 0;
    let notFoundCount = 0;

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = '교과'; // 교과 시트
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1, // 배열 형태로 읽기
      });

      console.log(`총 ${sheet.length - 2}개 행 처리 시작...`);

      // 행 2부터 시작 (0: 빈 행, 1: 헤더)
      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i];
        const unifiedId = row[0]; // unified_id (A컬럼)
        const gradeCut50 = row[108]; // 최초컷 (DE컬럼 = 인덱스 108)
        const gradeCut70 = row[109]; // 추합컷 (DF컬럼 = 인덱스 109)

        if (!unifiedId) {
          continue;
        }

        try {
          // 데이터 업데이트
          const result = await this.susiSubjectService.updateGradeCuts(
            unifiedId,
            gradeCut50 !== undefined && gradeCut50 !== null ? gradeCut50.toString() : null,
            gradeCut70 !== undefined && gradeCut70 !== null ? gradeCut70.toString() : null,
          );

          if (result) {
            successCount++;
            if (successCount % 1000 === 0) {
              console.log(`진행 중... ${successCount}개 업데이트 완료`);
            }
          } else {
            notFoundCount++;
          }
        } catch (error) {
          failedCount++;
          console.error(`업데이트 실패 (unified_id: ${unifiedId}):`, error.message);
        }
      }

      console.log('\n업데이트 완료!');
      console.log(`성공: ${successCount}, 실패: ${failedCount}, 찾을 수 없음: ${notFoundCount}`);

      return { success: successCount, failed: failedCount, notFound: notFoundCount };
    } catch (error) {
      console.error('Excel 파일 처리 에러:', error);
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

  async syncDatabaseWithExcel(filePath: string): Promise<void> {
    try {
      await this.susiSubjectService.clear();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // 첫번째 시트 (교과)
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      const CHUNK_SIZE = 300; // 청크 사이즈 설정
      let chunk = [];
      let id = 1;
      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i];
        const entity = new SuSiSubjectEntity();
        entity.id = id;
        entity.interview = 0;
        ++id;

        for (const [key, value] of Object.entries(row)) {
          const columnName = subjectExcelFieldMapping[key];

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
            if (
              (columnName === 'converted_score_total' || columnName === 'converted_score_cut') &&
              typeof processedValue === 'string'
            ) {
              processedValue = null;
            }
            // varchar 필드 길이 제한 처리 (엔티티 정의 기반)
            const varcharLimits = {
              unified_id: 50,
              region: 20,
              university_name: 50,
              university_code: 20,
              national_or_private: 10,
              basic_type: 30,
              detailed_type: 50,
              type_name: 100,
              central_classification: 10,
              department: 10,
              college: 50,
              recruitment_unit_name: 50,
              large_department: 50,
              medium_department: 50,
              small_department: 50,
              recruitment_number: 30,
              selection_model: 30,
              selection_ratio: 30,
              selection_method: 60,
              step2_other_details: 255,
              student_record_utilization_index: 30,
              common_general_reflection_method: 100,
              grade_cut: 50,
              grade_cut_70: 50,
              converted_score_cut: 50,
              non_subject_cut: 50,
              interview_score_applied: 100,
              interview_type: 50,
              interview_resources: 100,
              interview_method: 100,
              interview_evaluation_content: 100,
              interview_date_text: 20,
              interview_time: 20,
              admission_criteria_2024: 50,
              admission_2024_grade: 50,
              admission_2024_converted_score: 60,
              competition_rate_2024: 50,
              replenishment_2024: 10,
              admission_criteria_2023: 50,
              admission_2023_grade: 50,
              admission_2023_converted_score: 10,
              competition_rate_2023: 50,
              replenishment_2023: 10,
              admission_criteria_2022: 50,
              admission_2022_grade: 50,
              competition_rate_2022: 50,
              replenishment_2022: 10,
              admission_2021_grade: 50,
              competition_rate_2021: 50,
              replenishment_2021: 10,
              admission_2020_grade: 50,
              competition_rate_2020: 50,
              replenishment_2020: 10,
              application_notes: 50,
            };
            if (varcharLimits[columnName] && typeof processedValue === 'string') {
              if (processedValue.length > varcharLimits[columnName]) {
                processedValue = processedValue.substring(0, varcharLimits[columnName]);
              }
            }

            // int 타입 필드에 소수점 값이 들어오면 반올림
            const intFields = [
              'curriculum_grade_1', 'curriculum_grade_2', 'curriculum_grade_3',
              'curriculum_grade_4', 'curriculum_grade_5', 'curriculum_grade_6',
              'curriculum_grade_7', 'curriculum_grade_8', 'curriculum_grade_9',
              'curriculum', 'interview', 'attendance', 'volunteer',
              'document_non_academic', 'practical_skills', 'step1_score',
              'step2_others', 'step2_interview', 'first_year_ratio',
              'second_year_ratio', 'third_year_ratio', 'second_third_year_ratio',
              'first_second_third_year_ratio', 'common_general_and_career_integration',
              'common_general_subject_ratio', 'reflected_subject_1_year_korean',
              'reflected_subject_1_year_math', 'reflected_subject_1_year_english',
              'reflected_subject_1_year_science', 'reflected_subject_1_year_social',
              'reflected_subject_1_year_korean_history', 'reflected_subject_1_year_other',
              'number_of_optional_subjects_1', 'total_number_of_top_subjects_1',
              'number_of_top_subjects_per_subject_1', 'reflected_subject_2_3_years_korean',
              'reflected_subject_2_3_years_math', 'reflected_subject_2_3_years_english',
              'reflected_subject_2_3_years_science', 'reflected_subject_2_3_years_social',
              'reflected_subject_2_3_years_korean_history', 'reflected_subject_2_3_years_other',
              'number_of_optional_subjects_2_3', 'total_number_of_top_subjects_2_3',
              'number_of_top_subjects_per_subject_2_3', 'perfect_score',
              'attendance_usage', 'attendance_usage_ratio',
              'absence_1', 'absence_2', 'absence_3', 'absence_4', 'absence_5',
              'absence_6', 'absence_7', 'absence_8', 'absence_9', 'absence_10',
              'absence_11', 'absence_12', 'absence_13', 'absence_14', 'absence_15',
              'absence_16', 'absence_17', 'absence_18', 'absence_19', 'absence_20',
              'career_subject_application', 'career_optional_subject',
              'career_optional_subject_A', 'career_optional_subject_B', 'career_optional_subject_C',
              'A_distribution_ratio', 'B_distribution_ratio', 'C_distribution_ratio',
              'career_subject_ratio', 'career_subject_additional_points',
              'number_of_top_subjects_in_all_career_subjects',
              'number_of_top_subjects_in_career_curriculum',
              'curriculum_reflection_semester', 'curriculum_calculation_formula',
              'minimum_korean', 'minimum_math', 'minimum_math_science_engineering',
              'english', 'social_studies', 'science_studies', 'calculation_studies',
              'minimum_count', 'others', 'additional_points',
            ];
            if (intFields.includes(columnName) && typeof processedValue === 'number' && !Number.isInteger(processedValue)) {
              processedValue = Math.round(processedValue);
            }
            entity[columnName] = processedValue;
          }
        }

        chunk.push(entity);

        if (chunk.length === CHUNK_SIZE || i === sheet.length - 1) {
          await this.susiSubjectService.insertSusiSubjectData(chunk);
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
