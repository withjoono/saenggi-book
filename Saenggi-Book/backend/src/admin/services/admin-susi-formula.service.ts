// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { SusiFormulaDataService } from '../../modules/susi/calculation/services/susi-formula-data.service';
import { SusiCalculationFormulaEntity } from '../../database/entities/susi/susi-calculation-formula.entity';

/**
 * 관리자용 수시 교과전형 환산 공식 엑셀 업로드 서비스
 *
 * 엑셀 구조:
 * - 시트: 100점만점체계, 1000점만점체계, 기타확인필요
 * - 컬럼: No, 대학명, 1등급, 2등급, ..., 9등급, 만점
 */
@Injectable()
export class AdminSusiFormulaService {
  private readonly logger = new Logger(AdminSusiFormulaService.name);

  constructor(private readonly formulaDataService: SusiFormulaDataService) {}

  /**
   * 엑셀 파일에서 환산 공식 데이터 업로드
   * @param filePath 엑셀 파일 경로
   * @param year 적용 연도
   */
  async importFormulasFromExcel(
    filePath: string,
    year: number = 2026,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      const workbook = XLSX.readFile(filePath);

      // 처리할 시트 목록 (100점만점체계, 1000점만점체계)
      const sheetsToProcess = ['100점만점체계', '1000점만점체계'];

      for (const sheetName of sheetsToProcess) {
        if (!workbook.SheetNames.includes(sheetName)) {
          this.logger.warn(`시트 "${sheetName}"를 찾을 수 없습니다.`);
          continue;
        }

        const sheet = workbook.Sheets[sheetName];
        // 헤더가 3번째 행(index 2)에 있으므로 range 옵션 사용
        const data = XLSX.utils.sheet_to_json(sheet, { range: 2 }) as Record<string, any>[];

        this.logger.log(`\n=== ${sheetName} 시트 처리 시작 (${data.length}개 행) ===`);

        for (let i = 0; i < data.length; i++) {
          const row = data[i];

          try {
            const formula = this.parseSimpleExcelRow(row, year, sheetName);

            if (!formula.university_name) {
              continue; // 대학명 없는 행은 스킵 (빈 행)
            }

            await this.formulaDataService.saveFormula(formula);
            successCount++;

            if (successCount % 20 === 0) {
              this.logger.log(`진행 중... ${successCount}개 저장 완료`);
            }
          } catch (error) {
            failedCount++;
            const errorMsg = `[${sheetName}] 행 ${i + 4}: ${error.message}`;
            errors.push(errorMsg);
            this.logger.error(errorMsg);
          }
        }
      }

      // 캐시 리로드
      await this.formulaDataService.reloadData();

      this.logger.log('\n업로드 완료!');
      this.logger.log(`성공: ${successCount}, 실패: ${failedCount}`);

      return { success: successCount, failed: failedCount, errors };
    } catch (error) {
      this.logger.error('Excel 파일 처리 에러:', error);
      throw error;
    } finally {
      // 파일 삭제
      fs.unlink(filePath, (err) => {
        if (err) {
          this.logger.error(`파일 삭제 실패: ${filePath}`, err);
        }
      });
    }
  }

  /**
   * 간단한 엑셀 행 파싱 (등급별 환산점수 테이블만 포함)
   * 컬럼: No, 대학명, 1등급, 2등급, ..., 9등급, 만점
   */
  private parseSimpleExcelRow(
    row: Record<string, any>,
    year: number,
    sheetName: string,
  ): Partial<SusiCalculationFormulaEntity> {
    const universityName = row['대학명']?.toString()?.trim();

    if (!universityName) {
      return { university_name: null };
    }

    // 등급별 환산점수 파싱
    const gradeConversionTable: Record<string, number> = {};
    for (let grade = 1; grade <= 9; grade++) {
      const key = `${grade}등급`;
      const value = row[key];
      if (value !== undefined && value !== null && value !== '' && value !== '-') {
        gradeConversionTable[String(grade)] = parseFloat(value) || 0;
      }
    }

    // 만점 파싱
    let maxScore = 1000; // 기본값
    const maxScoreValue = row['만점'];
    if (maxScoreValue && maxScoreValue !== '-') {
      const parsed = parseFloat(maxScoreValue);
      if (!isNaN(parsed) && parsed > 0) {
        maxScore = parsed;
      } else if (sheetName === '100점만점체계') {
        maxScore = 100;
      }
    } else if (sheetName === '100점만점체계') {
      maxScore = 100;
    }

    return {
      year,
      university_name: universityName,
      grade_conversion_table: gradeConversionTable,
      max_score: maxScore,
      // 기본값 설정 (학년별/교과별 반영비율은 추후 업데이트 필요)
      grade_1_ratio: 0,
      grade_2_ratio: 0,
      grade_3_ratio: 100, // 기본적으로 3학년 100% 반영
      korean_ratio: 25,
      english_ratio: 25,
      math_ratio: 25,
      science_ratio: 25,
      social_ratio: 0,
      etc_ratio: 0,
      is_active: true,
      remarks: `시트: ${sheetName}`,
    };
  }

  /**
   * 상세 엑셀 행 파싱 (학년별/교과별 반영비율 포함 - 추후 사용)
   * 컬럼명은 엑셀 헤더와 매핑됨
   */
  private parseDetailedExcelRow(
    row: Record<string, any>,
    year: number,
  ): Partial<SusiCalculationFormulaEntity> {
    const formula: Partial<SusiCalculationFormulaEntity> = {
      year,
      university_name: this.getString(row, '대학명', row['university_name']),
      university_code: this.getString(row, '대학코드', row['university_code']),
      reflection_semesters: this.getString(row, '반영학기', row['reflection_semesters']),
      grade_1_ratio: this.getNumber(row, '1학년반영비율', row['grade_1_ratio']),
      grade_2_ratio: this.getNumber(row, '2학년반영비율', row['grade_2_ratio']),
      grade_3_ratio: this.getNumber(row, '3학년반영비율', row['grade_3_ratio']),
      korean_ratio: this.getNumber(row, '국어반영비율', row['korean_ratio']),
      english_ratio: this.getNumber(row, '영어반영비율', row['english_ratio']),
      math_ratio: this.getNumber(row, '수학반영비율', row['math_ratio']),
      social_ratio: this.getNumber(row, '사회반영비율', row['social_ratio']),
      science_ratio: this.getNumber(row, '과학반영비율', row['science_ratio']),
      etc_ratio: this.getNumber(row, '기타반영비율', row['etc_ratio']),
      reflection_subject_count: this.getNumber(row, '반영과목수', row['reflection_subject_count']),
      reflection_subject_detail: this.getString(row, '반영교과상세', row['reflection_subject_detail']),
      grade_conversion_table: this.parseGradeConversionTable(row),
      career_subject_conversion: this.getString(row, '진로선택과목환산', row['career_subject_conversion']),
      career_grade_conversion_table: this.parseCareerConversionTable(row),
      attendance_score: this.getNumber(row, '출결점수', row['attendance_score']),
      attendance_deduction_rule: this.getString(row, '출결감점기준', row['attendance_deduction_rule']),
      volunteer_score: this.getNumber(row, '봉사점수', row['volunteer_score']),
      volunteer_rule: this.getString(row, '봉사기준', row['volunteer_rule']),
      max_score: this.getNumber(row, '만점', row['max_score']) || 1000,
      remarks: this.getString(row, '비고', row['remarks']),
      is_active: true,
    };

    return formula;
  }

  /**
   * 등급별 환산점수 테이블 파싱 (상세 엑셀용)
   */
  private parseGradeConversionTable(row: Record<string, any>): Record<string, number> | null {
    const table: Record<string, number> = {};

    for (let grade = 1; grade <= 9; grade++) {
      const value =
        row[`${grade}등급환산`] ||
        row[`${grade}등급`] ||
        row[`grade_${grade}`];
      if (value !== undefined && value !== null && value !== '' && value !== '-') {
        table[String(grade)] = parseFloat(value) || 0;
      }
    }

    if (Object.keys(table).length === 0) {
      return {
        '1': 100, '2': 96, '3': 89, '4': 77,
        '5': 60, '6': 40, '7': 23, '8': 11, '9': 4,
      };
    }

    return table;
  }

  /**
   * 진로선택과목 환산 테이블 파싱
   */
  private parseCareerConversionTable(row: Record<string, any>): Record<string, number> | null {
    const table: Record<string, number> = {};

    const aScore = row['A성취도환산'] || row['career_a'] || row['진로A'];
    const bScore = row['B성취도환산'] || row['career_b'] || row['진로B'];
    const cScore = row['C성취도환산'] || row['career_c'] || row['진로C'];

    if (aScore !== undefined && aScore !== null) table['A'] = parseFloat(aScore) || 0;
    if (bScore !== undefined && bScore !== null) table['B'] = parseFloat(bScore) || 0;
    if (cScore !== undefined && cScore !== null) table['C'] = parseFloat(cScore) || 0;

    return Object.keys(table).length > 0 ? table : null;
  }

  private getString(row: Record<string, any>, ...keys: (string | undefined)[]): string | null {
    for (const key of keys) {
      if (!key) continue;
      const value = row[key];
      if (value !== undefined && value !== null && value !== '' && value !== '-') {
        return String(value).trim();
      }
    }
    return null;
  }

  private getNumber(row: Record<string, any>, ...keys: (string | undefined)[]): number {
    for (const key of keys) {
      if (!key) continue;
      const value = row[key];
      if (value !== undefined && value !== null && value !== '' && value !== '-') {
        const num = parseFloat(value);
        if (!isNaN(num)) return num;
      }
    }
    return 0;
  }

  /**
   * 저장된 환산 공식 목록 조회
   */
  async getFormulaList(year?: number): Promise<SusiCalculationFormulaEntity[]> {
    // formulaDataService의 getAllFormulas를 통해 조회
    const formulas = await this.formulaDataService.getAllFormulas(year);
    return formulas as unknown as SusiCalculationFormulaEntity[];
  }

  /**
   * 캐시 리로드
   */
  async reloadCache(): Promise<void> {
    await this.formulaDataService.reloadData();
  }
}
