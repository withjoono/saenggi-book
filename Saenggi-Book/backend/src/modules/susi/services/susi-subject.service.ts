// @ts-nocheck
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { SusiSubjectStep1ResponseDto } from '../dtos/susi-subject-step-1.dto';
import { SusiSubjectStep2ResponseDto } from '../dtos/susi-subject-step-2.dto';
import { SusiSubjectStep3ResponseDto } from '../dtos/susi-subject-step-3.dto';
import { SusiSubjectStep4ResponseDto } from '../dtos/susi-subject-step-4.dto';
import { SusiSubjectStep5ResponseDto } from '../dtos/susi-subject-step-5.dto';
import { SusiSubjectDetailResponseDto } from '../dtos/susi-subject-detail.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { SusiSubjectGroupData } from '../dtos/susi-subject-group.dto';

@Injectable()
export class SusiSubjectService {
  constructor(    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 수시 교과 목록 전체 조회 (admin)
  async getAllSusiSubject(commonSearchQueryDto: CommonSearchQueryDto) {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.susiSubjectRepository,
    );

    const queryBuilder = this.susiSubjectRepository.createQueryBuilder('A');

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

  // 수시 교과 테이블 비우기
  async clear(): Promise<void> {
    await this.susiSubjectRepository.clear();
  }

  // 수시 교과 데이터 삽입
  async insertSusiSubjectData(newRecords: SuSiSubjectEntity[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 새로운 데이터 삽입
      await queryRunner.manager.save(SuSiSubjectEntity, newRecords);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // grade_cut과 grade_cut_70 업데이트
  async updateGradeCuts(
    unifiedId: string,
    gradeCut50: string | null,
    gradeCut70: string | null,
  ): Promise<boolean> {
    const result = await this.susiSubjectRepository.update(
      { unified_id: unifiedId },
      {
        grade_cut: gradeCut50,
        grade_cut_70: gradeCut70,
      },
    );

    return result.affected > 0;
  }

  // 수시 교과 Step 1 (연도, 전형으로 조회 (등급컷, 환산컷, 대학이름 등등))
  async getSusiSubjectStep_1({
    year,
    basic_type,
  }: {
    year: number;
    basic_type: string;
  }): Promise<SusiSubjectStep1ResponseDto> {
    const cacheKey = `susi-subject:${year}-${basic_type}`;
    const cachedData = await this.cacheManager.get<SusiSubjectStep1ResponseDto>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const data = await this.susiSubjectRepository.find({
      where: {
        // year: year, 임시 비활성화 (2024, 2025 둘다 보여주기위해)
        basic_type: basic_type === '일반전형' ? '일반' : '특별',
      },
      select: {
        id: true,
        basic_type: true,
        type_name: true,
        university_name: true,
        detailed_type: true,
        region: true,
        department: true,
        grade_cut: true,
        converted_score_cut: true,
      },
    });
    const groupedData = this._groupDataByUniversityTypeDepartment(data);
    await this.cacheManager.set(cacheKey, { grouped_data: groupedData }, 120 * 60 * 1000); // 120분 동안 캐시

    return {
      grouped_data: groupedData,
    };
  }

  // 수시 교과 Step 2 (id 목록으로 최저등급 관련 데이터 조회)
  async getSusiSubjectStep_2({ ids }: { ids: number[] }): Promise<SusiSubjectStep2ResponseDto[]> {
    const data = await this.susiSubjectRepository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        university_name: true,
        type_name: true,
        department: true,
        basic_type: true,
        minimum_academic_standards_applied: true,
        minimum_academic_standards_text: true,

        minimum_korean: true,
        minimum_math: true,
        minimum_math_science_engineering: true,
        english: true,
        social_studies: true,
        science_studies: true,
        calculation_studies: true,
        minimum_count: true,
        minimum_sum: true,
        korean_history: true,
      },
    });

    return data as SusiSubjectStep2ResponseDto[];
  }

  // 수시 교과 Step 3 (id 목록으로 비교과 관련 데이터 조회)
  async getSusiSubjectStep_3({ ids }: { ids: number[] }): Promise<SusiSubjectStep3ResponseDto[]> {
    const data = await this.susiSubjectRepository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        university_name: true,
        type_name: true,
        department: true,
        basic_type: true,

        attendance: true,
        volunteer: true,
        document_non_academic: true,
      },
    });

    return data as SusiSubjectStep3ResponseDto[];
  }

  // 수시 교과 Step 4 (id 목록으로 모집단위 관련 데이터 조회)
  async getSusiSubjectStep_4({ ids }: { ids: number[] }): Promise<SusiSubjectStep4ResponseDto[]> {
    const data = await this.susiSubjectRepository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        university_name: true,
        type_name: true,
        department: true,
        basic_type: true,

        recruitment_unit_name: true,

        converted_score_cut: true,
        converted_score_total: true,
        non_subject_cut: true,

        risk_level_minus1: true,
        risk_level_minus2: true,
        risk_level_minus3: true,
        risk_level_minus4: true,
        risk_level_minus5: true,
        risk_level_plus1: true,
        risk_level_plus2: true,
        risk_level_plus3: true,
        risk_level_plus4: true,
        risk_level_plus5: true,
      },
    });

    return data as SusiSubjectStep4ResponseDto[];
  }

  // 수시 교과 Step 5 (id 목록으로 전형일자 관련 데이터 조회)
  async getSusiSubjectStep_5({ ids }: { ids: number[] }): Promise<SusiSubjectStep5ResponseDto[]> {
    const data = await this.susiSubjectRepository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        university_name: true,
        type_name: true,
        recruitment_unit_name: true,

        interview_score_applied: true,
        interview_type: true,
        interview_resources: true,
        interview_method: true,
        interview_evaluation_content: true,
        interview_date_text: true,
        interview_time: true,
      },
    });

    return data as SusiSubjectStep5ResponseDto[];
  }

  // 수시 교과 상세페이지 데이터 조회
  async getSusiSubjectDetail(id: number) {
    const data = await this.susiSubjectRepository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        // 대학 전형 모집단위
        university_name: true,
        region: true,
        national_or_private: true,
        detailed_type: true,
        type_name: true,
        central_classification: true,
        department: true,
        recruitment_unit_name: true,

        // 지원자격
        basic_type: true,
        application_eligibility_text: true,

        // 선발방식
        recruitment_number: true,
        selection_model: true,
        selection_ratio: true,
        selection_method: true,

        // 학생부 비율
        curriculum: true,
        interview: true,
        attendance: true,
        volunteer: true,
        document_non_academic: true,
        step1_score: true,
        step2_others: true,
        step2_other_details: true,

        risk_level_plus1: true,
        risk_level_plus2: true,
        risk_level_plus3: true,
        risk_level_plus4: true,
        risk_level_plus5: true,
        risk_level_minus1: true,
        risk_level_minus2: true,
        risk_level_minus3: true,
        risk_level_minus4: true,
        risk_level_minus5: true,

        // 교과 반영 방식
        curriculum_reflection_semester: true,
        student_record_utilization_index: true,
        career_subject_reflection_method: true,
        common_general_reflection_method: true,
        first_year_ratio: true,
        second_year_ratio: true,
        third_year_ratio: true,
        second_third_year_ratio: true,
        first_second_third_year_ratio: true,
        curriculum_grade_1: true,
        curriculum_grade_2: true,
        curriculum_grade_3: true,
        curriculum_grade_4: true,
        curriculum_grade_5: true,
        curriculum_grade_6: true,
        curriculum_grade_7: true,
        curriculum_grade_8: true,
        curriculum_grade_9: true,

        // 수능 최저
        minimum_academic_standards_applied: true,
        minimum_academic_standards_text: true,

        // 면접
        interview_score_applied: true,
        interview_type: true,
        interview_resources: true,
        interview_method: true,
        interview_evaluation_content: true,
        interview_date_text: true,
        interview_time: true,

        // 지난년도 경쟁률
        admission_2024_grade: true,
        admission_2024_converted_score: true,
        competition_rate_2024: true,
        replenishment_2024: true,

        admission_2023_grade: true,
        admission_2023_converted_score: true,
        competition_rate_2023: true,
        replenishment_2023: true,

        admission_2022_grade: true,
        competition_rate_2022: true,
        replenishment_2022: true,

        admission_2021_grade: true,
        competition_rate_2021: true,
        replenishment_2021: true,

        admission_2020_grade: true,
        competition_rate_2020: true,
        replenishment_2020: true,
      },
    });

    return data as SusiSubjectDetailResponseDto;
  }

  // 수시 교과 합불사례 데이터 조회
  async getSusiSubjectPassRecords(id: number) {
    const susiSubject = await this.susiSubjectRepository.findOne({
      where: {
        id,
      },
      select: {
        unified_id: true,
      },
    });
    if (!susiSubject.unified_id) {
      throw new NotFoundException('조회할 데이터를 찾을 수 없습니다.');
    }

    const data = await this.susiPassRecordRepository.find({
      where: {
        unified_id: susiSubject.unified_id,
      },
    });

    return data;
  }

  // Step 1에서 데이터 그룹화 (대학명-타입-전형명)
  _groupDataByUniversityTypeDepartment = (
    data: SuSiSubjectEntity[],
  ): Record<string, SusiSubjectGroupData> => {
    return data.reduce<Record<string, SusiSubjectGroupData>>((grouped, item) => {
      const key = `${item.university_name}-${item.type_name}-${item.department}`;
      const gradeCutNum = isNaN(Number(item.grade_cut)) ? 0 : Number(item.grade_cut);
      const gradeCut =
        item.grade_cut !== null && 1 <= gradeCutNum && gradeCutNum <= 9 ? gradeCutNum : null;
      if (!grouped[key]) {
        const detailedType = item.detailed_type
          ? item.detailed_type
              .split(',')
              .filter((n) => n !== '' && !Number.isNaN(Number(n)))
              .map((n) => Number(n))
          : [];
        grouped[key] = {
          university_name: item.university_name || '',
          type_name: item.type_name || '',
          department: item.department || '',
          min_cut: gradeCut !== null ? gradeCut : 9999,
          max_cut: gradeCut !== null ? gradeCut + 0.05 : 0,
          detailed_type: detailedType,
          region: item.region,
          ids: [item.id],
        };
      } else {
        grouped[key].min_cut = Math.min(grouped[key].min_cut, gradeCut !== null ? gradeCut : 9999);
        grouped[key].max_cut = Math.max(grouped[key].max_cut, gradeCut !== null ? gradeCut : 0);
        grouped[key].ids = [...grouped[key].ids, item.id];
      }
      return grouped;
    }, {});
  };
}
