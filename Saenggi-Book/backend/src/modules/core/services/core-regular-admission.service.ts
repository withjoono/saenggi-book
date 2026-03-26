// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import {
  CreateRegularAdmissionDto,
  UpdateRegularAdmissionDto,
} from '../dtos/regular-admission.dto';

@Injectable()
export class CoreRegularAdmissionService {
  constructor(  ) {}

  async findAll(): Promise<RegularAdmissionEntity[]> {
    return this.regularAdmissionRepository.find({
      relations: ['university'],
    });
  }

  async findOne(id: number): Promise<RegularAdmissionEntity> {
    const admission = await this.regularAdmissionRepository.findOne({
      where: { id },
      relations: ['university'],
    });
    if (!admission) {
      throw new NotFoundException(`Regular Admission with ID ${id} not found`);
    }
    return admission;
  }

  async create(
    createRegularAdmissionDto: CreateRegularAdmissionDto,
  ): Promise<RegularAdmissionEntity> {
    const { university_id, ...admissionData } = createRegularAdmissionDto;
    const university = await this.universityRepository.findOneOrFail({
      where: { id: university_id },
    });

    const admission = this.regularAdmissionRepository.create({
      ...admissionData,
      university,
    });

    return this.regularAdmissionRepository.save(admission);
  }

  async update(
    id: number,
    updateRegularAdmissionDto: UpdateRegularAdmissionDto,
  ): Promise<RegularAdmissionEntity> {
    const admission = await this.findOne(id);
    const { university_id, ...admissionData } = updateRegularAdmissionDto;

    if (university_id) {
      const university = await this.universityRepository.findOneOrFail({
        where: { id: university_id },
      });
      admission.university = university;
    }

    Object.assign(admission, admissionData);
    return this.regularAdmissionRepository.save(admission);
  }

  async remove(id: number): Promise<void> {
    const admission = await this.findOne(id);
    await this.regularAdmissionRepository.remove(admission);
  }

  async syncWithExcel(filePath: string): Promise<void> {
    const YEAR = 2026; // 2026학년도 정시
    const queryRunner = this.regularAdmissionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(RegularAdmissionEntity, { year: YEAR });
      await queryRunner.manager.delete(RegularAdmissionPreviousResultEntity, {
        year: YEAR,
      });

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 'A' });

      let _errorCount = 0;

      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        // const universityCode = row['CG'];  // 구버전 (84번 컬럼)
        const universityCode = row['CI']; // 2024-12-19 수정: 대학코드는 CI(86번)에 있음
        const universityRegion = row['A'];
        const universityName = row['B'];
        const year = YEAR;
        const admissionName = (row['C'] || '').trim();
        const admissionType = (row['D'] || '').trim();
        const generalFieldName = (row['E'] || '').trim();
        const detailedFields = (row['F'] || '').trim();
        const recruitmentNumber = parseInt(row['H']) || 0;
        const recruitmentName = (row['G'] || '').trim();
        const selection_method = (row['I'] || '').trim();
        // 선발 방식
        const csatRatio = (row['J'] + '' || '').trim();
        const schoolRecordRatio = (row['K'] + '' || '').trim();
        const interviewRatio = (row['L'] + '' || '').trim();
        const otherRatio = (row['M'] + '' || '').trim();
        const scoreCalculation = (row['CD'] || '').trim();
        // const scoreCalculation = (row['CE'] || '').trim();
        const csatElements = (row['N'] + '' || '').trim();
        const csatCombination = (row['O'] + '' || '').trim();
        const csatRequired = (row['P'] + '' || '').trim();
        const csatOptional = (row['O'] + '' || '').trim();
        const totalScore = row['CE'] !== 'N' ? parseInt(row['CE'] || '0') : 0;
        // const totalScore = row['CF'] !== 'N' ? parseInt(row['CF'] || '0') : 0;
        const researchSubjectCount = row['R'] !== 'N' ? parseInt(row['R'] || '0') : 0;
        const korean_reflection_score =
          row['S'] !== 'N' ? parseFloat(parseFloat(row['S'] || '0').toFixed(5)) : 0;
        const math_reflection_score =
          row['T'] !== 'N' ? parseFloat(parseFloat(row['T'] || '0').toFixed(5)) : 0;
        const research_reflection_score =
          row['V'] !== 'N' ? parseFloat(parseFloat(row['V'] || '0').toFixed(5)) : 0;
        const english_reflection_score =
          row['U'] !== 'N' ? parseFloat(parseFloat(row['U'] || '0').toFixed(5)) : 0;
        const korean_history_reflection_score =
          row['W'] !== 'N' ? parseFloat(parseFloat(row['W'] || '0').toFixed(5)) : 0;
        const second_foreign_language_reflection_score =
          row['X'] !== 'N' ? parseFloat(parseFloat(row['X'] || '0').toFixed(5)) : 0;
        const minCut = parseFloat(parseFloat(row['BD'] || '0').toFixed(5));
        const minCutPercent = parseFloat(parseFloat(row['BE'] || '0').toFixed(5));
        const maxCut = parseFloat(parseFloat(row['BF'] || '0').toFixed(5));
        const maxCutPercent = parseFloat(parseFloat(row['BG'] || '0').toFixed(5));
        const risk_plus_5 = parseFloat(parseFloat(row['BH'] || '0').toFixed(5));
        const risk_plus_4 = parseFloat(parseFloat(row['BI'] || '0').toFixed(5));
        const risk_plus_3 = parseFloat(parseFloat(row['BJ'] || '0').toFixed(5));
        const risk_plus_2 = parseFloat(parseFloat(row['BK'] || '0').toFixed(5));
        const risk_plus_1 = parseFloat(parseFloat(row['BL'] || '0').toFixed(5));
        const risk_minus_1 = parseFloat(parseFloat(row['BM'] || '0').toFixed(5));
        const risk_minus_2 = parseFloat(parseFloat(row['BN'] || '0').toFixed(5));
        const risk_minus_3 = parseFloat(parseFloat(row['BO'] || '0').toFixed(5));
        const risk_minus_4 = parseFloat(parseFloat(row['BP'] || '0').toFixed(5));
        const risk_minus_5 = parseFloat(parseFloat(row['BQ'] || '0').toFixed(5));
        const initial_cumulative_percentile = parseFloat(parseFloat(row['BE'] || '0').toFixed(5));
        const additional_cumulative_percentile = parseFloat(
          parseFloat(row['BG'] || '0').toFixed(5),
        );
        const korean_elective_subject = row['Y'] || '';
        const math_elective_subject = row['Z'] || '';
        const math_probability_statistics_additional_points = row['AA'] || '';
        const math_calculus_additional_points = row['AB'] || '';
        const math_geometry_additional_points = row['AC'] || '';
        const research_type = row['AD'] || '';
        const research_social_additional_points = row['AE'] || '';
        const research_science_additional_points = row['AF'] || '';
        const math_research_selection = row['AG'] || '';
        const english_application_criteria = row['AH'] || '';
        const english_grade_1_score = row['AI'] || '';
        const english_grade_2_score = row['AJ'] || '';
        const english_grade_3_score = row['AK'] || '';
        const english_grade_4_score = row['AL'] || '';
        const english_grade_5_score = row['AM'] || '';
        const english_grade_6_score = row['AN'] || '';
        const english_grade_7_score = row['AO'] || '';
        const english_grade_8_score = row['AP'] || '';
        const english_grade_9_score = row['AQ'] || '';
        const english_minimum_criteria = row['AR'] || '';
        const korean_history_application_criteria = row['AS'] || '';
        const korean_history_grade_1_score = row['AT'] || '';
        const korean_history_grade_2_score = row['AU'] || '';
        const korean_history_grade_3_score = row['AV'] || '';
        const korean_history_grade_4_score = row['AW'] || '';
        const korean_history_grade_5_score = row['AX'] || '';
        const korean_history_grade_6_score = row['AY'] || '';
        const korean_history_grade_7_score = row['AZ'] || '';
        const korean_history_grade_8_score = row['BA'] || '';
        const korean_history_grade_9_score = row['BB'] || '';
        const korean_history_minimum_criteria = row['BC'] || '';

        if (universityCode === 'N') {
          ++_errorCount;
          continue;
        }

        let university = await this.universityRepository.findOne({
          where: { code: universityCode },
        });
        if (!university) {
          university = await this.universityRepository.save(
            this.universityRepository.create({
              code: universityCode,
              name: universityName,
              region: universityRegion,
              establishment_type: '',
            }),
          );
        }

        const newAdmission = this.regularAdmissionRepository.create({
          university,
          year,
          admission_name: admissionName,
          admission_type: admissionType,
          general_field_name: generalFieldName,
          detailed_fields: detailedFields,
          recruitment_number: recruitmentNumber,
          recruitment_name: recruitmentName,
          selection_method,
          csat_ratio: csatRatio,
          school_record_ratio: schoolRecordRatio,
          interview_ratio: interviewRatio,
          other_ratio: otherRatio,
          score_calculation: scoreCalculation,
          csat_elements: csatElements,
          csat_combination: csatCombination,
          csat_required: csatRequired,
          csat_optional: csatOptional,
          total_score: totalScore,
          research_subject_count: researchSubjectCount,
          korean_reflection_score,
          math_reflection_score,
          research_reflection_score,
          min_cut: minCut,
          min_cut_percent: minCutPercent,
          max_cut: maxCut,
          max_cut_percent: maxCutPercent,
          risk_plus_5,
          risk_plus_4,
          risk_plus_3,
          risk_plus_2,
          risk_plus_1,
          risk_minus_1,
          risk_minus_2,
          risk_minus_3,
          risk_minus_4,
          risk_minus_5,
          initial_cumulative_percentile,
          additional_cumulative_percentile,
          english_reflection_score,
          korean_history_reflection_score,
          second_foreign_language_reflection_score,
          korean_elective_subject,
          math_elective_subject,
          math_calculus_additional_points,
          math_probability_statistics_additional_points,
          math_geometry_additional_points,
          research_type,
          research_social_additional_points,
          research_science_additional_points,
          math_research_selection,
          english_application_criteria,
          english_grade_1_score,
          english_grade_2_score,
          english_grade_3_score,
          english_grade_4_score,
          english_grade_5_score,
          english_grade_6_score,
          english_grade_7_score,
          english_grade_8_score,
          english_grade_9_score,
          english_minimum_criteria,
          korean_history_application_criteria,
          korean_history_grade_1_score,
          korean_history_grade_2_score,
          korean_history_grade_3_score,
          korean_history_grade_4_score,
          korean_history_grade_5_score,
          korean_history_grade_6_score,
          korean_history_grade_7_score,
          korean_history_grade_8_score,
          korean_history_grade_9_score,
          korean_history_minimum_criteria,
        });

        await queryRunner.manager.save(RegularAdmissionEntity, newAdmission);

        // 과거 입학 결과 추가 (2024-12-19 수정: 컬럼 +2 조정)
        // 대학코드가 CI(86)이므로, 2025입결은 CJ(87)부터 시작
        const previousResults = [
          {
            // 2025 입결 (컬럼 87-94: CJ~CQ)
            year: 2025,
            recruitment_number: parseInt(row['CJ']) || null, // 87: 모집인원(최종)
            competition_ratio: parseFloat(row['CK'] || '0') || null, // 88: 경쟁률
            additional_pass_rank: parseInt(row['CL']) || null, // 89: 충원합격순위
            min_cut: parseFloat(row['CM'] || '0') || null, // 90: 환산점수 50%컷
            max_cut: parseFloat(row['CN'] || '0') || null, // 91: 환산점수 70%컷
            converted_score_total: parseFloat(row['CO'] || '0') || null, // 92: 환산점수총점
            percentile_50: parseFloat(row['CP'] || '0') || null, // 93: 백분위 50%컷
            percentile_70: parseFloat(row['CQ'] || '0') || null, // 94: 백분위 70%컷
            percent: null, // 기존 필드 유지 (누백 - 새 포맷에서는 사용 안함)
          },
          {
            // 2024 입결 (컬럼 95-102: CR~CY)
            year: 2024,
            recruitment_number: parseInt(row['CR']) || null, // 95: 모집인원(최종)
            competition_ratio: parseFloat(row['CS'] || '0') || null, // 96: 경쟁률
            additional_pass_rank: parseInt(row['CT']) || null, // 97: 충원합격순위
            min_cut: parseFloat(row['CU'] || '0') || null, // 98: 환산점수 50%컷
            max_cut: parseFloat(row['CV'] || '0') || null, // 99: 환산점수 70%컷
            converted_score_total: parseFloat(row['CW'] || '0') || null, // 100: 환산점수총점
            percentile_50: parseFloat(row['CX'] || '0') || null, // 101: 백분위 50%컷
            percentile_70: parseFloat(row['CY'] || '0') || null, // 102: 백분위 70%컷
            percent: null, // 기존 필드 유지
          },
          {
            // 2023 입결 (컬럼 103-110: CZ~DG)
            year: 2023,
            recruitment_number: parseInt(row['CZ']) || null, // 103: 모집인원(최종)
            competition_ratio: parseFloat(row['DA'] || '0') || null, // 104: 경쟁률
            additional_pass_rank: parseInt(row['DB']) || null, // 105: 충원합격순위
            min_cut: parseFloat(row['DC'] || '0') || null, // 106: 환산점수 50%컷
            max_cut: parseFloat(row['DD'] || '0') || null, // 107: 환산점수 70%컷
            converted_score_total: parseFloat(row['DE'] || '0') || null, // 108: 환산점수총점
            percentile_50: parseFloat(row['DF'] || '0') || null, // 109: 백분위 50%컷
            percentile_70: parseFloat(row['DG'] || '0') || null, // 110: 백분위 70%컷
            percent: null, // 기존 필드 유지
          },
        ];

        if (previousResults.length > 0) {
          for (const result of previousResults) {
            const previousResult = this.regularAdmissionPreviousResultRepository.create({
              ...result,
              regular_admission: newAdmission,
            });
            await queryRunner.manager.save(RegularAdmissionPreviousResultEntity, previousResult);
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('정시 전형 데이터 동기화 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
      fs.unlinkSync(filePath);
    }
  }
}
