// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { CreateRecruitmentUnitDto, UpdateRecruitmentUnitDto } from '../dtos/recruitment.dto';
import { parseFloatWithPrecision } from 'src/common/utils/excel-utils';

@Injectable()
export class CoreRecruitmentUnitService {
  constructor(  ) {}

  async findAllByAdmission(admissionId: number): Promise<RecruitmentUnitEntity[]> {
    return this.recruitmentUnitRepository.find({
      where: { admission: { id: admissionId } },
      relations: [
        'admission',
        'general_field',
        'minor_field',
        'scores',
        'minimum_grade',
        'interview',
        'previous_results',
        'minor_field.mid_field',
        'minor_field.mid_field.major_field',
      ],
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<RecruitmentUnitEntity> {
    const recruitmentUnit = await this.recruitmentUnitRepository.findOne({
      where: { id },
      relations: [
        'admission',
        'general_field',
        'minor_field',
        'scores',
        'minimum_grade',
        'interview',
        'previous_results',
      ],
    });
    if (!recruitmentUnit) {
      throw new NotFoundException(`Recruitment unit with ID ${id} not found`);
    }
    return recruitmentUnit;
  }

  async create(createRecruitmentUnitDto: CreateRecruitmentUnitDto): Promise<RecruitmentUnitEntity> {
    const {
      admission_id,
      general_field_id,
      minor_field_id,
      scores,
      interview,
      minimum_grade,
      previous_results,
      ...recruitmentUnitData
    } = createRecruitmentUnitDto;

    const admission = await this.admissionRepository.findOneOrFail({
      where: { id: admission_id },
    });
    const generalField = general_field_id
      ? await this.generalFieldRepository.findOneOrFail({
          where: { id: general_field_id },
        })
      : null;
    const minorField = minor_field_id
      ? await this.minorFieldRepository.findOneOrFail({
          where: { id: minor_field_id },
        })
      : null;

    const recruitmentUnit = this.recruitmentUnitRepository.create({
      ...recruitmentUnitData,
      admission,
      general_field: generalField,
      minor_field: minorField,
    });

    await this.recruitmentUnitRepository.save(recruitmentUnit);

    if (scores) {
      const recruitmentUnitScore = this.recruitmentUnitScoreRepository.create({
        ...scores,
        recruitmentUnit,
      });
      await this.recruitmentUnitScoreRepository.save(recruitmentUnitScore);
    }
    // src/modules/core/services/core-recruitment.service.ts

    if (interview) {
      const recruitmentUnitInterview = this.recruitmentUnitInterviewRepository.create({
        ...interview,
        is_reflected: !!interview.is_reflected, // 이 부분을 수정하세요
        recruitment_unit: recruitmentUnit,
      });
      await this.recruitmentUnitInterviewRepository.save(recruitmentUnitInterview);
    }

    if (minimum_grade) {
      const recruitmentUnitMinimum = this.recruitmentUnitMinimumRepository.create({
        ...minimum_grade,
        recruitmentUnit,
      });
      await this.recruitmentUnitMinimumRepository.save(recruitmentUnitMinimum);
    }
    if (previous_results) {
      await this.recruitmentUnitPreviousResultRepository.save(
        previous_results.map((n) =>
          this.recruitmentUnitPreviousResultRepository.create({
            ...n,
            recruitment_unit: recruitmentUnit,
          }),
        ),
      );
    }

    return this.findOne(recruitmentUnit.id);
  }

  async update(
    id: number,
    updateRecruitmentUnitDto: UpdateRecruitmentUnitDto,
  ): Promise<RecruitmentUnitEntity> {
    const recruitmentUnit = await this.findOne(id);
    const {
      general_field_id,
      minor_field_id,
      scores,
      interview,
      previous_results,
      minimum_grade,
      ...recruitmentUnitData
    } = updateRecruitmentUnitDto;

    if (general_field_id) {
      const generalField = await this.generalFieldRepository.findOneOrFail({
        where: { id: general_field_id },
      });
      recruitmentUnit.general_field = generalField;
    }

    if (minor_field_id) {
      const minorField = await this.minorFieldRepository.findOneOrFail({
        where: { id: minor_field_id },
      });
      recruitmentUnit.minor_field = minorField;
    }

    Object.assign(recruitmentUnit, recruitmentUnitData);

    if (scores) {
      if (recruitmentUnit.scores) {
        Object.assign(recruitmentUnit.scores, scores);
        await this.recruitmentUnitScoreRepository.save(recruitmentUnit.scores);
      } else {
        const newScore = this.recruitmentUnitScoreRepository.create({
          ...scores,
          recruitmentUnit,
        });
        await this.recruitmentUnitScoreRepository.save(newScore);
      }
    }
    // src/modules/core/services/core-recruitment.service.ts

    if (interview) {
      // is_reflected 타입을 boolean으로 변환하는 로직을 추가하세요
      const interviewData = {
        ...interview,
        is_reflected: !!interview.is_reflected,
      };
      if (recruitmentUnit.interview) {
        Object.assign(recruitmentUnit.interview, interviewData);
        await this.recruitmentUnitInterviewRepository.save(recruitmentUnit.interview);
      } else {
        const newInterview = this.recruitmentUnitInterviewRepository.create({
          ...interviewData,
          recruitment_unit: recruitmentUnit,
        });
        await this.recruitmentUnitInterviewRepository.save(newInterview);
      }
    }

    if (minimum_grade) {
      if (recruitmentUnit.minimum_grade) {
        Object.assign(recruitmentUnit.minimum_grade, minimum_grade);
        await this.recruitmentUnitMinimumRepository.save(recruitmentUnit.minimum_grade);
      } else {
        const newMinimum = this.recruitmentUnitMinimumRepository.create({
          ...minimum_grade,
          recruitmentUnit,
        });
        await this.recruitmentUnitMinimumRepository.save(newMinimum);
      }
    }

    await this.recruitmentUnitRepository.save(recruitmentUnit);

    if (previous_results) {
      await this.recruitmentUnitPreviousResultRepository.remove(recruitmentUnit.previous_results);
      await this.recruitmentUnitPreviousResultRepository.save(
        previous_results.map((n) =>
          this.recruitmentUnitPreviousResultRepository.create({
            ...n,
            recruitment_unit: recruitmentUnit,
          }),
        ),
      );
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const recruitmentUnit = await this.findOne(id);
    if (recruitmentUnit.scores) {
      await this.recruitmentUnitScoreRepository.remove(recruitmentUnit.scores);
    }
    if (recruitmentUnit.interview) {
      await this.recruitmentUnitInterviewRepository.remove(recruitmentUnit.interview);
    }
    if (recruitmentUnit.minimum_grade) {
      await this.recruitmentUnitMinimumRepository.remove(recruitmentUnit.minimum_grade);
    }
    if (recruitmentUnit.previous_results) {
      await this.recruitmentUnitPreviousResultRepository.remove(recruitmentUnit.previous_results);
    }
    await this.recruitmentUnitRepository.remove(recruitmentUnit);
  }

  async syncSubjectRecruitmentUnitsWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.recruitmentUnitRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      console.log(`총 ${sheet.length}개 데이터 처리 시작`);

      console.log('전형, 계열 정보 로드 중...');
      // 전형, 계열 정보 미리 로드
      const admissions = await this.admissionRepository.find({
        relations: ['university', 'category'],
      });
      const generalFields = await this.generalFieldRepository.find();
      const minorFields = await this.minorFieldRepository.find({
        relations: ['mid_field', 'mid_field.major_field'],
      });

      console.log('데이터 매핑 중...');

      const admissionsMap = new Map(
        admissions.map((a) => [`${a.year}-${a.university.code}-${a.name}-${a.category.name}`, a]),
      );
      const generalFieldsMap = new Map(generalFields.map((gf) => [gf.name, gf]));
      const minorFieldsMap = new Map(
        minorFields.map((mf) => [
          `${mf.mid_field.major_field.name}-${mf.mid_field.name}-${mf.name}`,
          mf,
        ]),
      );

      const recruitmentUnitsMap = new Map<string, RecruitmentUnitEntity>();

      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i];
        const code = row['A'].trim();
        const year = parseInt(row['B']);
        const universityCode = row['E'].trim();
        const admissionName = row['I'].trim();
        const recruitmentUnitName = row['M'].trim();
        const recruitmentNum = parseInt(row['Q']);
        const categoryName = row['J'].trim();
        const generalFieldName = row['K'].trim();
        const majorFieldName = row['N'].trim();
        const midFieldName = row['O'].trim();
        const minorFieldName = row['P'].trim();

        const admissionKey = `${year}-${universityCode}-${admissionName}-${categoryName}`;
        const admission = admissionsMap.get(admissionKey);
        if (!admission) {
          console.warn(`Admission not found for key: ${admissionKey}`);
          continue;
        }

        const generalField = generalFieldsMap.get(generalFieldName);
        const minorField = minorFieldsMap.get(
          `${majorFieldName}-${midFieldName}-${minorFieldName}`,
        );

        const recruitmentUnit = new RecruitmentUnitEntity();
        recruitmentUnit.code = code;
        recruitmentUnit.admission = admission;
        recruitmentUnit.name = recruitmentUnitName;
        recruitmentUnit.recruitment_number = recruitmentNum || 0;
        recruitmentUnit.general_field = generalField;
        recruitmentUnit.minor_field = minorField;

        // Score 데이터 설정
        recruitmentUnit.scores = new RecruitmentUnitScoreEntity();
        recruitmentUnit.scores.grade_50_cut = parseFloatWithPrecision(row['DE']);
        recruitmentUnit.scores.grade_70_cut = parseFloatWithPrecision(row['DF']);
        recruitmentUnit.scores.convert_50_cut = parseFloatWithPrecision(row['DG']);
        recruitmentUnit.scores.convert_70_cut = parseFloatWithPrecision(row['DH']);
        recruitmentUnit.scores.risk_plus_5 = parseFloatWithPrecision(row['DI']);
        recruitmentUnit.scores.risk_plus_4 = parseFloatWithPrecision(row['DJ']);
        recruitmentUnit.scores.risk_plus_3 = parseFloatWithPrecision(row['DK']);
        recruitmentUnit.scores.risk_plus_2 = parseFloatWithPrecision(row['DL']);
        recruitmentUnit.scores.risk_plus_1 = parseFloatWithPrecision(row['DM']);
        recruitmentUnit.scores.risk_minus_1 = parseFloatWithPrecision(row['DN']);
        recruitmentUnit.scores.risk_minus_2 = parseFloatWithPrecision(row['DO']);
        recruitmentUnit.scores.risk_minus_3 = parseFloatWithPrecision(row['DP']);
        recruitmentUnit.scores.risk_minus_4 = parseFloatWithPrecision(row['DQ']);
        recruitmentUnit.scores.risk_minus_5 = parseFloatWithPrecision(row['DR']);

        // Minimum Grade 데이터 설정
        recruitmentUnit.minimum_grade = new RecruitmentUnitMinimumGradeEntity();
        recruitmentUnit.minimum_grade.is_applied = row['DS'] === 'Y' ? 'Y' : 'N';
        recruitmentUnit.minimum_grade.description = row['DT'] || null;

        // Interview 데이터 설정
        recruitmentUnit.interview = new RecruitmentUnitInterviewEntity();
        recruitmentUnit.interview.is_reflected = false; // 기본값 설정
        recruitmentUnit.interview.interview_type = row['EI'] || null;
        recruitmentUnit.interview.materials_used = row['EJ'] || null;
        recruitmentUnit.interview.interview_process = row['EK'] || null;
        recruitmentUnit.interview.evaluation_content = row['EL'] || null;
        recruitmentUnit.interview.interview_date = row['EM'] || null;
        recruitmentUnit.interview.interview_time = row['EN'] || null;

        // Previous Results 데이터 설정
        recruitmentUnit.previous_results = [];
        // 2024년도 데이터
        const result2024 = new RecruitmentUnitPreviousResultEntity();
        result2024.year = 2024;
        result2024.result_criteria = row['EP'] || '정보 없음';
        result2024.grade_cut = parseFloatWithPrecision(row['EQ']);
        result2024.converted_score_cut = parseFloatWithPrecision(row['ER']);
        result2024.competition_ratio = parseFloatWithPrecision(row['ES']);
        result2024.recruitment_number = parseInt(row['ET']) || null;
        recruitmentUnit.previous_results.push(result2024);

        // 2023년도 데이터
        const result2023 = new RecruitmentUnitPreviousResultEntity();
        result2023.year = 2023;
        result2023.result_criteria = row['EU'] || '정보 없음';
        result2023.grade_cut = parseFloatWithPrecision(row['EV']);
        result2023.converted_score_cut = parseFloatWithPrecision(row['EW']);
        result2023.competition_ratio = parseFloatWithPrecision(row['EX']);
        result2023.recruitment_number = parseInt(row['EY']) || null;
        recruitmentUnit.previous_results.push(result2023);

        // 2022년도 데이터
        const result2022 = new RecruitmentUnitPreviousResultEntity();
        result2022.year = 2022;
        result2022.result_criteria = '정보 없음';
        result2022.grade_cut = parseFloatWithPrecision(row['EZ']);
        result2022.competition_ratio = parseFloatWithPrecision(row['FA']);
        result2022.recruitment_number = parseInt(row['FB']) || null;
        recruitmentUnit.previous_results.push(result2022);

        const key = `${admissionKey}-${recruitmentUnitName}`;
        recruitmentUnitsMap.set(key, recruitmentUnit);
      }

      console.log(`${recruitmentUnitsMap.size}개의 모집단위 정보 처리 중...`);

      // 기존 데이터 확인 및 업데이트/삽입
      const existingRecruitmentUnits = await this.recruitmentUnitRepository.find({
        relations: [
          'admission',
          'general_field',
          'minor_field',
          'scores',
          'minimum_grade',
          'interview',
          'previous_results',
        ],
      });

      const toUpdate: RecruitmentUnitEntity[] = [];
      const toInsert: RecruitmentUnitEntity[] = [];

      recruitmentUnitsMap.forEach((recruitmentUnit) => {
        const existing = existingRecruitmentUnits.find(
          (e) => e.admission.id === recruitmentUnit.admission.id && e.name === recruitmentUnit.name,
        );

        if (existing) {
          // 업데이트
          existing.code = recruitmentUnit.code;
          existing.general_field = recruitmentUnit.general_field;
          existing.minor_field = recruitmentUnit.minor_field;
          existing.recruitment_number = recruitmentUnit.recruitment_number;

          // scores 업데이트
          if (existing.scores && recruitmentUnit.scores) {
            Object.assign(existing.scores, recruitmentUnit.scores);
          } else if (recruitmentUnit.scores) {
            existing.scores = recruitmentUnit.scores;
          }

          // minimum_grade 업데이트
          if (existing.minimum_grade && recruitmentUnit.minimum_grade) {
            Object.assign(existing.minimum_grade, recruitmentUnit.minimum_grade);
          } else if (recruitmentUnit.minimum_grade) {
            existing.minimum_grade = recruitmentUnit.minimum_grade;
          }

          // interview 업데이트
          if (existing.interview && recruitmentUnit.interview) {
            Object.assign(existing.interview, recruitmentUnit.interview);
          } else if (recruitmentUnit.interview) {
            existing.interview = recruitmentUnit.interview;
          }

          // previous_results 업데이트
          if (!existing.previous_results) {
            existing.previous_results = [];
          }
          recruitmentUnit.previous_results.forEach((newResult) => {
            const existingResult = existing.previous_results.find((r) => r.year === newResult.year);
            if (existingResult) {
              Object.assign(existingResult, newResult);
            } else {
              existing.previous_results.push(newResult);
            }
          });

          toUpdate.push(existing);
        } else {
          // 삽입
          toInsert.push(recruitmentUnit);
        }
      });

      console.log(`${toUpdate.length}개 모집단위 정보 업데이트 시작`);
      let count = 0;
      if (toUpdate.length > 0) {
        for (const unit of toUpdate) {
          ++count;
          await queryRunner.manager.save(RecruitmentUnitEntity, unit);

          if (unit.scores) {
            unit.scores.recruitmentUnit = unit;
            await queryRunner.manager.save(RecruitmentUnitScoreEntity, unit.scores);
          }

          if (unit.minimum_grade) {
            unit.minimum_grade.recruitmentUnit = unit;
            await queryRunner.manager.save(RecruitmentUnitMinimumGradeEntity, unit.minimum_grade);
          }

          if (unit.interview) {
            unit.interview.recruitment_unit = unit;
            await queryRunner.manager.save(RecruitmentUnitInterviewEntity, unit.interview);
          }

          if (unit.previous_results && unit.previous_results.length > 0) {
            for (const result of unit.previous_results) {
              result.recruitment_unit = unit;
              await queryRunner.manager.save(RecruitmentUnitPreviousResultEntity, result);
            }
          }
          if (count % 50 === 0) {
            console.log(`${count}개 업데이트 완료`);
          }
        }
        console.log(`${toUpdate.length}개 모집단위 정보 업데이트 완료`);
      }

      console.log(`${toInsert.length}개 새로운 모집단위 정보 삽입 시작`);
      count = 0;
      if (toInsert.length > 0) {
        for (const unit of toInsert) {
          ++count;
          const savedUnit = await queryRunner.manager.save(RecruitmentUnitEntity, unit);

          if (unit.scores) {
            unit.scores.recruitmentUnit = savedUnit;
            await queryRunner.manager.save(RecruitmentUnitScoreEntity, unit.scores);
          }

          if (unit.minimum_grade) {
            unit.minimum_grade.recruitmentUnit = savedUnit;
            await queryRunner.manager.save(RecruitmentUnitMinimumGradeEntity, unit.minimum_grade);
          }

          if (unit.interview) {
            unit.interview.recruitment_unit = savedUnit;
            await queryRunner.manager.save(RecruitmentUnitInterviewEntity, unit.interview);
          }

          if (unit.previous_results && unit.previous_results.length > 0) {
            for (const result of unit.previous_results) {
              result.recruitment_unit = savedUnit;
              await queryRunner.manager.save(RecruitmentUnitPreviousResultEntity, result);
            }
          }
          if (count % 50 === 0) {
            console.log(`${count}개 삽입 완료`);
          }
        }
        console.log(`${toInsert.length}개 새로운 모집단위 정보 삽입 완료`);
      }

      await queryRunner.commitTransaction();
      console.log('모집단위 데이터 동기화 완료');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('모집단위 데이터 동기화 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }

  async syncComprehensiveRecruitmentUnitsWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.recruitmentUnitRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[1];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      console.log(`총 ${sheet.length}개 데이터 처리 시작`);

      console.log('전형, 계열 정보 로드 중...');
      // 전형, 계열 정보 미리 로드
      const admissions = await this.admissionRepository.find({
        relations: ['university', 'category'],
      });
      const generalFields = await this.generalFieldRepository.find();
      const minorFields = await this.minorFieldRepository.find({
        relations: ['mid_field', 'mid_field.major_field'],
      });

      console.log('데이터 매핑 중...');

      const admissionsMap = new Map(
        admissions.map((a) => [`${a.year}-${a.university.code}-${a.name}-${a.category.name}`, a]),
      );
      const generalFieldsMap = new Map(generalFields.map((gf) => [gf.name, gf]));
      const minorFieldsMap = new Map(
        minorFields.map((mf) => [
          `${mf.mid_field.major_field.name}-${mf.mid_field.name}-${mf.name}`,
          mf,
        ]),
      );

      const recruitmentUnitsMap = new Map<string, RecruitmentUnitEntity>();

      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i];
        const code = row['A'].trim();
        const year = parseInt(row['B']);
        const universityCode = row['E'].trim();
        const admissionName = row['I'].trim();
        const recruitmentUnitName = row['M'].trim();
        const recruitmentNum = parseInt(row['Q']);
        const categoryName = row['J'].trim();
        const generalFieldName = row['K'].trim();
        const majorFieldName = row['N'].trim();
        const midFieldName = row['O'].trim();
        const minorFieldName = row['P'].trim();

        const admissionKey = `${year}-${universityCode}-${admissionName}-${categoryName}`;
        const admission = admissionsMap.get(admissionKey);
        if (!admission) {
          console.warn(`Admission not found for key: ${admissionKey}`);
          continue;
        }

        const generalField = generalFieldsMap.get(generalFieldName);
        const minorField = minorFieldsMap.get(
          `${majorFieldName}-${midFieldName}-${minorFieldName}`,
        );

        const recruitmentUnit = new RecruitmentUnitEntity();
        recruitmentUnit.code = code;
        recruitmentUnit.admission = admission;
        recruitmentUnit.name = recruitmentUnitName;
        recruitmentUnit.recruitment_number = recruitmentNum || 0;
        recruitmentUnit.general_field = generalField;
        recruitmentUnit.minor_field = minorField;

        // Score 데이터 설정
        recruitmentUnit.scores = new RecruitmentUnitScoreEntity();
        recruitmentUnit.scores.grade_50_cut = parseFloatWithPrecision(row['AD']);
        recruitmentUnit.scores.grade_70_cut = parseFloatWithPrecision(row['AE']);

        recruitmentUnit.scores.risk_plus_5 = parseFloatWithPrecision(row['AF']);
        recruitmentUnit.scores.risk_plus_4 = parseFloatWithPrecision(row['AG']);
        recruitmentUnit.scores.risk_plus_3 = parseFloatWithPrecision(row['AH']);
        recruitmentUnit.scores.risk_plus_2 = parseFloatWithPrecision(row['AI']);
        recruitmentUnit.scores.risk_plus_1 = parseFloatWithPrecision(row['AJ']);
        recruitmentUnit.scores.risk_minus_1 = parseFloatWithPrecision(row['DK']);
        recruitmentUnit.scores.risk_minus_2 = parseFloatWithPrecision(row['DL']);
        recruitmentUnit.scores.risk_minus_3 = parseFloatWithPrecision(row['DM']);
        recruitmentUnit.scores.risk_minus_4 = parseFloatWithPrecision(row['DN']);
        recruitmentUnit.scores.risk_minus_5 = parseFloatWithPrecision(row['DO']);

        // Minimum Grade 데이터 설정
        recruitmentUnit.minimum_grade = new RecruitmentUnitMinimumGradeEntity();
        recruitmentUnit.minimum_grade.is_applied = row['AP'] === 'Y' ? 'Y' : 'N';
        recruitmentUnit.minimum_grade.description = row['AQ'] || null;

        // Interview 데이터 설정
        recruitmentUnit.interview = new RecruitmentUnitInterviewEntity();
        recruitmentUnit.interview.is_reflected = false; // 기본값 설정
        recruitmentUnit.interview.interview_type = row['BI'] || null;
        recruitmentUnit.interview.materials_used = row['BJ'] || null;
        recruitmentUnit.interview.interview_process = row['BK'] || null;
        recruitmentUnit.interview.evaluation_content = row['BL'] || null;
        recruitmentUnit.interview.interview_date = row['BM'] || null;
        recruitmentUnit.interview.interview_time = row['BN'] || null;

        // Previous Results 데이터 설정
        recruitmentUnit.previous_results = [];
        // 2024년도 데이터
        const result2024 = new RecruitmentUnitPreviousResultEntity();
        result2024.year = 2024;
        result2024.result_criteria = row['BO'] || '정보 없음';
        result2024.grade_cut = parseFloatWithPrecision(row['BP']);
        result2024.converted_score_cut = parseFloatWithPrecision(row['BQ']);
        result2024.competition_ratio = parseFloatWithPrecision(row['BR']);
        result2024.recruitment_number = parseInt(row['BS']) || null;
        recruitmentUnit.previous_results.push(result2024);

        // 2023년도 데이터
        const result2023 = new RecruitmentUnitPreviousResultEntity();
        result2023.year = 2023;
        result2023.result_criteria = row['BT'] || '정보 없음';
        result2023.grade_cut = parseFloatWithPrecision(row['BU']);
        result2023.converted_score_cut = parseFloatWithPrecision(row['BV']);
        result2023.competition_ratio = parseFloatWithPrecision(row['BW']);
        result2023.recruitment_number = parseInt(row['BX']) || null;
        recruitmentUnit.previous_results.push(result2023);

        // 2022년도 데이터
        const result2022 = new RecruitmentUnitPreviousResultEntity();
        result2022.year = 2022;
        result2022.result_criteria = '정보 없음';
        result2022.grade_cut = parseFloatWithPrecision(row['BY']);
        result2022.competition_ratio = parseFloatWithPrecision(row['BZ']);
        result2022.recruitment_number = parseInt(row['CA']) || null;
        recruitmentUnit.previous_results.push(result2022);

        const key = `${admissionKey}-${recruitmentUnitName}`;
        recruitmentUnitsMap.set(key, recruitmentUnit);
      }

      console.log(`${recruitmentUnitsMap.size}개의 모집단위 정보 처리 중...`);

      // 기존 데이터 확인 및 업데이트/삽입
      const existingRecruitmentUnits = await this.recruitmentUnitRepository.find({
        relations: [
          'admission',
          'general_field',
          'minor_field',
          'scores',
          'minimum_grade',
          'interview',
          'previous_results',
        ],
      });

      const toUpdate: RecruitmentUnitEntity[] = [];
      const toInsert: RecruitmentUnitEntity[] = [];

      recruitmentUnitsMap.forEach((recruitmentUnit) => {
        const existing = existingRecruitmentUnits.find(
          (e) => e.admission.id === recruitmentUnit.admission.id && e.name === recruitmentUnit.name,
        );

        if (existing) {
          // 업데이트
          existing.code = recruitmentUnit.code;
          existing.general_field = recruitmentUnit.general_field;
          existing.minor_field = recruitmentUnit.minor_field;
          existing.recruitment_number = recruitmentUnit.recruitment_number;

          // scores 업데이트
          if (existing.scores && recruitmentUnit.scores) {
            Object.assign(existing.scores, recruitmentUnit.scores);
          } else if (recruitmentUnit.scores) {
            existing.scores = recruitmentUnit.scores;
          }

          // minimum_grade 업데이트
          if (existing.minimum_grade && recruitmentUnit.minimum_grade) {
            Object.assign(existing.minimum_grade, recruitmentUnit.minimum_grade);
          } else if (recruitmentUnit.minimum_grade) {
            existing.minimum_grade = recruitmentUnit.minimum_grade;
          }

          // interview 업데이트
          if (existing.interview && recruitmentUnit.interview) {
            Object.assign(existing.interview, recruitmentUnit.interview);
          } else if (recruitmentUnit.interview) {
            existing.interview = recruitmentUnit.interview;
          }

          // previous_results 업데이트
          if (!existing.previous_results) {
            existing.previous_results = [];
          }
          recruitmentUnit.previous_results.forEach((newResult) => {
            const existingResult = existing.previous_results.find((r) => r.year === newResult.year);
            if (existingResult) {
              Object.assign(existingResult, newResult);
            } else {
              existing.previous_results.push(newResult);
            }
          });

          toUpdate.push(existing);
        } else {
          // 삽입
          toInsert.push(recruitmentUnit);
        }
      });

      console.log(`${toUpdate.length}개 모집단위 정보 업데이트 시작`);
      let count = 0;
      if (toUpdate.length > 0) {
        for (const unit of toUpdate) {
          ++count;
          await queryRunner.manager.save(RecruitmentUnitEntity, unit);

          if (unit.scores) {
            unit.scores.recruitmentUnit = unit;
            await queryRunner.manager.save(RecruitmentUnitScoreEntity, unit.scores);
          }

          if (unit.minimum_grade) {
            unit.minimum_grade.recruitmentUnit = unit;
            await queryRunner.manager.save(RecruitmentUnitMinimumGradeEntity, unit.minimum_grade);
          }

          if (unit.interview) {
            unit.interview.recruitment_unit = unit;
            await queryRunner.manager.save(RecruitmentUnitInterviewEntity, unit.interview);
          }

          if (unit.previous_results && unit.previous_results.length > 0) {
            for (const result of unit.previous_results) {
              result.recruitment_unit = unit;
              await queryRunner.manager.save(RecruitmentUnitPreviousResultEntity, result);
            }
          }

          if (count % 50 === 0) {
            console.log(`${count}개 업데이트 완료`);
          }
        }
        console.log(`${toUpdate.length}개 모집단위 정보 업데이트 완료`);
      }

      console.log(`${toInsert.length}개 새로운 모집단위 정보 삽입 시작`);
      count = 0;
      if (toInsert.length > 0) {
        for (const unit of toInsert) {
          ++count;
          const savedUnit = await queryRunner.manager.save(RecruitmentUnitEntity, unit);

          if (unit.scores) {
            unit.scores.recruitmentUnit = savedUnit;
            await queryRunner.manager.save(RecruitmentUnitScoreEntity, unit.scores);
          }

          if (unit.minimum_grade) {
            unit.minimum_grade.recruitmentUnit = savedUnit;
            await queryRunner.manager.save(RecruitmentUnitMinimumGradeEntity, unit.minimum_grade);
          }

          if (unit.interview) {
            unit.interview.recruitment_unit = savedUnit;
            await queryRunner.manager.save(RecruitmentUnitInterviewEntity, unit.interview);
          }

          if (unit.previous_results && unit.previous_results.length > 0) {
            for (const result of unit.previous_results) {
              result.recruitment_unit = savedUnit;
              await queryRunner.manager.save(RecruitmentUnitPreviousResultEntity, result);
            }
          }

          if (count % 50 === 0) {
            console.log(`${count}개 삽입 완료`);
          }
        }
        console.log(`${toInsert.length}개 새로운 모집단위 정보 삽입 완료`);
      }

      await queryRunner.commitTransaction();
      console.log('모집단위 데이터 동기화 완료');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('모집단위 데이터 동기화 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }

  async syncPassFailRecordsWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.recruitmentUnitRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      console.log('기존 합불 데이터 삭제 중...');
      await queryRunner.manager.delete(RecruitmentUnitPassFailRecordsEntity, {});
      console.log('기존 합불 데이터 삭제 완료');

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      console.log(`총 ${sheet.length}개 데이터 처리 시작`);

      console.log('모집단위 로드 중...');
      const recruitmentUnits = await this.recruitmentUnitRepository.find();

      console.log('데이터 매핑 중...');
      const recruitmentUnitMap = new Map(recruitmentUnits.map((a) => [`${a.code}`, a.id]));

      const toInsert = [];
      for (let i = 1; i < sheet.length; i++) {
        const row = sheet[i];
        const code = (row['H'] || '').trim();
        const recruitmentUnitId = recruitmentUnitMap.get(code);
        if (!recruitmentUnitId) {
          console.warn(`Recruitment unit not found for code: ${code}`);
          continue;
        }

        toInsert.push({
          first_result: (row['A'] || '').trim(),
          final_result: (row['B'] || '').trim(),
          avg_grade_all: parseFloat(row['C']) || null,
          avg_grade_gyss: parseFloat(row['D']) || null,
          avg_grade_gysg: parseFloat(row['E']) || null,
          avg_grade_gyst_100: parseFloat(row['F']) || null,
          avg_grade_gyst: parseFloat(row['G']) || null,
          recruitmentUnit: { id: recruitmentUnitId },
        });
      }

      console.log(`${toInsert.length}개 새로운 합불 데이터 삽입 시작`);

      const chunkSize = 1000;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        await queryRunner.manager.insert(RecruitmentUnitPassFailRecordsEntity, chunk);
        console.log(`${i + chunk.length}개 삽입 완료`);
      }

      await queryRunner.commitTransaction();
      console.log('합불 데이터 동기화 완료');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('합불 데이터 동기화 중 오류 발생:', error);
      throw new Error(`합불 데이터 동기화 실패: ${error.message}`);
    } finally {
      await queryRunner.release();
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`파일 삭제 실패: ${filePath}`, err);
        }
      });
    }
  }
}
