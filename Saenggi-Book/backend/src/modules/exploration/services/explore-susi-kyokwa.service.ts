// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

/**
 * 수시 교과전형 탐색 서비스
 * - susi_kyokwa_recruitment 및 susi_kyokwa_ipkyul 테이블을 직접 조회
 * - 복잡한 관계 탐색 로직 제거, ida_id로 조인
 * - 프론트엔드 탐색 페이지의 요구사항에 맞춰 데이터 반환
 */
@Injectable()
export class ExploreSusiKyokwaService {
  private readonly logger = new Logger(ExploreSusiKyokwaService.name);

  constructor(    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * Step 1: 연도, 전형으로 조회 (등급컷, 대학이름 등)
   * - 프론트엔드 차트에서 사용
   */
  async getStep1(year: string, basicType: '일반' | '특별', category?: string, subtypeIds?: number[]) {
    const cacheKey = `explore-susi-kyokwa:step1:${year}-${basicType}-${category || 'all'}-${subtypeIds?.join(',') || 'all'}:v3`;
    // const cachedData = await this.cacheManager.get(cacheKey);
    // if (cachedData) {
    //   return cachedData;
    // }

    // 전체 데이터 수 확인
    const totalCount = await this.susiKyokwaRecruitmentRepository.count();
    this.logger.log(`[getStep1] Total recruitment records: ${totalCount}`);

    // 특별전형 서브타입 필터링이 있는 경우
    if (basicType === '특별' && subtypeIds && subtypeIds.length > 0) {
      this.logger.log(`[getStep1] Filtering by subtypes: ${subtypeIds.join(',')}`);

      // Raw query로 admission_subtype 필터링
      const queryBuilder = this.susiKyokwaRecruitmentRepository.createQueryBuilder('r');
      queryBuilder.where('r.admission_category = :basicType', { basicType });

      if (category && category !== '전체') {
        queryBuilder.andWhere('r.category = :category', { category });
      }

      // admission_subtype이 쉼표로 구분된 문자열이므로, 각 ID를 개별적으로 체크
      const subtypeConditions = subtypeIds.map((id, index) =>
        `(r.admission_subtype LIKE :subtype${index}_exact OR r.admission_subtype LIKE :subtype${index}_start OR r.admission_subtype LIKE :subtype${index}_middle OR r.admission_subtype LIKE :subtype${index}_end)`
      ).join(' OR ');

      queryBuilder.andWhere(`(${subtypeConditions})`);

      // 각 서브타입 ID에 대한 LIKE 패턴 파라미터 설정
      subtypeIds.forEach((id, index) => {
        queryBuilder.setParameter(`subtype${index}_exact`, `${id}`);         // 정확히 일치
        queryBuilder.setParameter(`subtype${index}_start`, `${id},%`);       // 시작
        queryBuilder.setParameter(`subtype${index}_middle`, `%,${id},%`);    // 중간
        queryBuilder.setParameter(`subtype${index}_end`, `%,${id}`);         // 끝
      });

      queryBuilder.select([
        'r.id',
        'r.ida_id',
        'r.university_name',
        'r.university_code',
        'r.university_type',
        'r.admission_type',
        'r.admission_name',
        'r.category',
        'r.recruitment_unit',
        'r.region_major',
        'r.region_detail',
        'r.major_field',
        'r.recruitment_count',
        'r.admission_subtype',
      ]);

      const recruitmentData = await queryBuilder.getRawMany();
      this.logger.log(`[getStep1] Found ${recruitmentData.length} records with subtype filter`);

      // Raw 결과를 엔티티 형식으로 변환
      const mappedData = recruitmentData.map(raw => ({
        id: raw.r_id,
        idaId: raw.ida_id,
        universityName: raw.university_name,
        universityCode: raw.university_code,
        universityType: raw.university_type,
        admissionType: raw.admission_type,
        admissionName: raw.admission_name,
        category: raw.r_category,
        recruitmentUnit: raw.recruitment_unit,
        regionMajor: raw.region_major,
        regionDetail: raw.region_detail,
        majorField: raw.major_field,
        recruitmentCount: raw.recruitment_count,
        admissionSubtype: raw.admission_subtype,
      })) as SusiKyokwaRecruitmentEntity[];

      return this.processStep1Data(mappedData, cacheKey);
    }

    // 일반전형 또는 서브타입 필터가 없는 특별전형
    const whereCondition: any = { admissionCategory: basicType };
    if (category && category !== '전체') {
      whereCondition.category = category;
    }

    // 일반/특별 전형 데이터 수 확인
    const targetCount = await this.susiKyokwaRecruitmentRepository.count({
      where: whereCondition,
    });
    this.logger.log(`[getStep1] Filtered by admissionCategory="${basicType}", category="${category || 'all'}": ${targetCount}`);

    // susi_kyokwa_recruitment 테이블에서 데이터 조회
    const recruitmentData = await this.susiKyokwaRecruitmentRepository.find({
      where: whereCondition,
      select: {
        id: true,
        idaId: true,
        universityName: true,
        universityCode: true,
        universityType: true,
        admissionType: true,
        admissionName: true,
        category: true,
        recruitmentUnit: true,
        regionMajor: true,
        regionDetail: true,
        majorField: true,
        recruitmentCount: true,
        // needed for grouping logic
        admissionSubtype: true,
      },
    });

    return this.processStep1Data(recruitmentData, cacheKey);
  }

  /**
   * Step 1 데이터 처리 공통 로직
   */
  private async processStep1Data(recruitmentData: SusiKyokwaRecruitmentEntity[], cacheKey: string) {

    // ida_id 목록 추출
    const idaIds = recruitmentData.map((r) => r.idaId).filter(Boolean);

    // susi_kyokwa_cut 테이블에서 등급컷 정보 조회
    const ipkyulData = await this.susiKyokwaIpkyulRepository.find({
      where: {
        idaId: In(idaIds),
      },
    });

    // ida_id를 키로 하는 Map 생성
    const ipkyulMap = new Map(ipkyulData.map((cut) => [cut.idaId, cut]));

    // 데이터 그룹화 (대학명-전형명-계열로 그룹화)
    this.logger.log(`[getStep1] Starting grouping of ${recruitmentData.length} items`);
    const groupedData = this.groupDataForStep1(recruitmentData, ipkyulMap);
    this.logger.log(`[getStep1] Grouped into ${groupedData.length} items`);
    const result = { items: groupedData };

    this.logger.log(`[getStep1] Caching result with ${result.items.length} items`);
    await this.cacheManager.set(cacheKey, result, 120 * 60 * 1000); // 120분 캐시

    this.logger.log(`[getStep1] Returning result`);
    return result;
  }

  /**
   * Step 2: ID 목록으로 최저등급 관련 데이터 조회
   */
  async getStep2(ids: number[]) {
    const data = await this.susiKyokwaRecruitmentRepository.find({
      where: { id: In(ids) },
      select: {
        id: true,
        idaId: true,
        universityName: true,
        universityCode: true,
        universityType: true,
        regionMajor: true,
        admissionType: true,
        admissionName: true,
        category: true,
        recruitmentUnit: true,
        majorField: true,
        recruitmentCount: true,
        minimumStandard: true,
      },
    });

    const items = data.map((item) => ({
      id: item.id,
      university: {
        id: 0,
        name: item.universityName || '',
        region: item.regionMajor || '',
        code: item.universityCode || '',
        establishment_type: item.universityType || '',
      },
      admission: {
        id: 0,
        name: item.admissionName || '',
        year: 2025,
        basic_type: '일반' as '일반' | '특별',
      },
      general_field: {
        id: this.getDepartmentId(item.majorField),
        name: item.majorField || '',
      },
      name: item.recruitmentUnit || '',
      recruitment_number: item.recruitmentCount || null,
      minimum_grade: {
        is_applied: item.minimumStandard ? 'Y' : 'N',
        description: item.minimumStandard || null,
      },
    }));

    return { items };
  }

  /**
   * Step 3: ID 목록으로 비교과 관련 데이터 조회
   */
  async getStep3(ids: number[]) {
    const data = await this.susiKyokwaRecruitmentRepository.find({
      where: { id: In(ids) },
      select: {
        id: true,
        idaId: true,
        universityName: true,
        universityCode: true,
        universityType: true,
        regionMajor: true,
        admissionType: true,
        admissionName: true,
        category: true,
        recruitmentUnit: true,
        majorField: true,
        admissionMethod: true,
        qualification: true,
        studentRecordQuantitative: true,
        documentRatio: true,
        interviewRatio: true,
      },
    });

    const items = data.map((item) => ({
      id: item.id,
      university: {
        id: 0,
        name: item.universityName || '',
        region: item.regionMajor || '',
        code: item.universityCode || '',
        establishment_type: item.universityType || '',
      },
      admission: {
        id: 0,
        name: item.admissionName || '',
        year: 2025,
        basic_type: '일반' as '일반' | '특별',
      },
      general_field: {
        id: this.getDepartmentId(item.majorField),
        name: item.majorField || '',
      },
      name: item.recruitmentUnit || '',
      method: {
        method_description: item.admissionMethod,
        subject_ratio: item.studentRecordQuantitative,
        document_ratio: item.documentRatio,
        interview_ratio: item.interviewRatio,
        practical_ratio: null,
        other_details: null,
        second_stage_first_ratio: null,
        second_stage_interview_ratio: null,
        second_stage_other_ratio: null,
        second_stage_other_details: null,
        eligibility: item.qualification,
        school_record_evaluation_score: null,
        school_record_evaluation_elements: null,
      },
    }));

    return { items };
  }

  /**
   * Step 4: ID 목록으로 모집단위 관련 데이터 조회
   */
  async getStep4(ids: number[]) {
    const recruitmentData = await this.susiKyokwaRecruitmentRepository.find({
      where: { id: In(ids) },
      select: {
        id: true,
        idaId: true,
        universityName: true,
        universityCode: true,
        universityType: true,
        regionMajor: true,
        admissionType: true,
        admissionName: true,
        category: true,
        recruitmentUnit: true,
        majorField: true,
        recruitmentCount: true,
      },
    });

    // ida_id 목록 추출
    const idaIds = recruitmentData.map((r) => r.idaId).filter(Boolean);

    // susi_kyokwa_cut 테이블에서 등급컷 정보 조회
    const ipkyulData = await this.susiKyokwaIpkyulRepository.find({
      where: {
        idaId: In(idaIds),
      },
    });

    // ida_id를 키로 하는 Map 생성
    const ipkyulMap = new Map(ipkyulData.map((cut) => [cut.idaId, cut]));

    const items = recruitmentData.map((item) => {
      const cut = ipkyulMap.get(item.idaId);

      return {
        id: item.id,
        name: item.recruitmentUnit || '',
        recruitment_number: item.recruitmentCount || null,
        university: {
          id: 0,
          name: item.universityName || '',
          region: item.regionMajor || '',
          code: item.universityCode || '',
          establishment_type: item.universityType || '',
        },
        admission: {
          id: 0,
          name: item.admissionName || '',
          year: 2025,
          basic_type: '일반' as '일반' | '특별',
        },
        general_field: {
          id: this.getDepartmentId(item.majorField),
          name: item.majorField || '',
        },
        scores: {
          grade_50_cut: cut?.studentRecordGrade50_2025 || null,
          grade_70_cut: cut?.studentRecordGrade70_2025 || null,
          convert_50_cut: null, // No equivalent field in ipkyul table
          convert_70_cut: null,
          risk_plus_5: null,
          risk_plus_4: null,
          risk_plus_3: null,
          risk_plus_2: null,
          risk_plus_1: null,
          risk_minus_1: null,
          risk_minus_2: null,
          risk_minus_3: null,
          risk_minus_4: null,
          risk_minus_5: null,
        },
      };
    });

    return { items };
  }

  /**
   * Step 5: ID 목록으로 전형일자(면접) 관련 데이터 조회
   */
  async getStep5(ids: number[]) {
    const data = await this.susiKyokwaRecruitmentRepository.find({
      where: { id: In(ids) },
      select: {
        id: true,
        idaId: true,
        universityName: true,
        universityCode: true,
        universityType: true,
        regionMajor: true,
        admissionType: true,
        admissionName: true,
        category: true,
        recruitmentUnit: true,
        majorField: true,
        recruitmentCount: true,
        interviewRatio: true,
      },
    });

    const items = data.map((item) => ({
      id: item.id,
      name: item.recruitmentUnit || '',
      recruitment_number: item.recruitmentCount || null,
      university: {
        id: 0,
        name: item.universityName || '',
        region: item.regionMajor || '',
        code: item.universityCode || '',
        establishment_type: item.universityType || '',
      },
      admission: {
        id: 0,
        name: item.admissionName || '',
        year: 2025,
        basic_type: '일반' as '일반' | '특별',
      },
      general_field: {
        id: this.getDepartmentId(item.majorField),
        name: item.majorField || '',
      },
      interview: item.interviewRatio
        ? {
          is_reflected: 1,
          interview_type: null,
          materials_used: null,
          interview_process: null,
          evaluation_content: null,
          interview_date: null,
          interview_time: null,
        }
        : null,
    }));

    return { items };
  }

  /**
   * 상세 정보 조회
   */
  async getDetail(id: number) {
    const item = await this.susiKyokwaRecruitmentRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`ID ${id}에 해당하는 데이터를 찾을 수 없습니다.`);
    }

    // 등급컷 정보 조회
    const cut = await this.susiKyokwaIpkyulRepository.findOne({
      where: { idaId: item.idaId },
    });

    return {
      id: item.id,
      name: item.recruitmentUnit || '',
      recruitment_number: item.recruitmentCount || null,
      university: {
        id: 0,
        name: item.universityName || '',
        region: item.regionMajor || '',
        code: item.universityCode || '',
        establishment_type: item.universityType || '',
      },
      admission: {
        id: 0,
        name: item.admissionName || '',
        year: 2025,
        basic_type: '일반' as '일반' | '특별',
        category: {
          id: 1,
          name: '교과',
        },
        subtypes: [],
      },
      admission_method: {
        method_description: item.admissionMethod,
        subject_ratio: item.studentRecordQuantitative,
        document_ratio: item.documentRatio,
        interview_ratio: item.interviewRatio,
        practical_ratio: item.practicalRatio,
        other_details: null,
        second_stage_first_ratio: null,
        second_stage_interview_ratio: null,
        second_stage_other_ratio: null,
        second_stage_other_details: null,
        eligibility: item.qualification,
        school_record_evaluation_score: null,
        school_record_evaluation_elements: null,
      },
      general_field: {
        id: this.getDepartmentId(item.majorField),
        name: item.majorField || '',
      },
      fields: {
        major: item.majorField ? { id: 0, name: item.majorField } : null,
        mid: item.midField ? { id: 0, name: item.midField } : null,
        minor: item.minorField ? { id: 0, name: item.minorField } : null,
      },
      minimum_grade: {
        is_applied: item.minimumStandard ? 'Y' : 'N',
        description: item.minimumStandard,
      },
      interview: item.interviewRatio
        ? {
          is_reflected: 1,
          interview_type: null,
          materials_used: null,
          interview_process: null,
          evaluation_content: null,
          interview_date: null,
          interview_time: null,
        }
        : null,
      scores: {
        grade_50_cut: cut?.studentRecordGrade50_2025 || null,
        grade_70_cut: cut?.studentRecordGrade70_2025 || null,
        convert_50_cut: null, // No equivalent field in ipkyul table
        convert_70_cut: null,
        risk_plus_5: null,
        risk_plus_4: null,
        risk_plus_3: null,
        risk_plus_2: null,
        risk_plus_1: null,
        risk_minus_1: null,
        risk_minus_2: null,
        risk_minus_3: null,
        risk_minus_4: null,
        risk_minus_5: null,
      },
      previous_results: this.buildPreviousResults(cut),
    };
  }

  /**
   * 데이터 그룹화 (Step 1용)
   * - 대학명-전형명-계열로 그룹화하여 min_cut, max_cut 계산
   */
  private groupDataForStep1(
    recruitmentData: SusiKyokwaRecruitmentEntity[],
    ipkyulMap: Map<string, SusiKyokwaIpkyulEntity>,
  ) {
    const groupedMap = new Map<
      string,
      {
        id: number;
        university: {
          id: number;
          name: string;
          region: string;
          code: string;
          establishmentType: string;
        };
        name: string;
        year: number;
        basicType: '일반' | '특별';
        category: { id: number; name: string };
        subtypeIds: number[];
        generalType: { id: number; name: string };
        subjectCategory: string | null;
        minCut: number | null;
        maxCut: number | null;
        recruitmentUnitIds: number[];
      }
    >();

    recruitmentData.forEach((item) => {
      if (!item.majorField) return;

      // 대학/전형까지만 그룹화 (계열은 프론트엔드 필터로 처리)
      const key = `${item.universityName}-${item.admissionName}`;
      const ipkyul = ipkyulMap.get(item.idaId);

      // admission_subtype 파싱 (쉼표로 구분된 문자열을 숫자 배열로 변환)
      const subtypeIds = item.admissionSubtype
        ? item.admissionSubtype
          .split(',')
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
        : [];

      // 50p = 최고등급 (낮은 숫자), 70p = 최저등급 (높은 숫자)
      const grade50p = ipkyul?.studentRecordGrade50_2025;
      const grade70p = ipkyul?.studentRecordGrade70_2025;

      const grade50pNum = grade50p ? parseFloat(String(grade50p)) : NaN;
      const grade70pNum = grade70p ? parseFloat(String(grade70p)) : NaN;

      const validGrade50p = !isNaN(grade50pNum) && grade50pNum >= 1 && grade50pNum <= 9 ? grade50pNum : null;
      const validGrade70p = !isNaN(grade70pNum) && grade70pNum >= 1 && grade70pNum <= 9 ? grade70pNum : null;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: item.id,
          university: {
            id: 0,
            name: item.universityName || '',
            region: item.regionMajor || '',
            code: item.universityCode || '',
            establishmentType: item.universityType || '',
          },
          name: item.admissionName || '',
          year: 2025,
          basicType: '일반',
          category: { id: 1, name: '교과' },
          subtypeIds: subtypeIds,
          generalType: {
            id: this.getDepartmentId(item.majorField),
            name: item.majorField,
          },
          // 실제 DB의 category 필드 값 사용 (문과/이과/공통/예체능)
          subjectCategory: item.category || null,
          minCut: validGrade50p,
          maxCut: validGrade70p,
          recruitmentUnitIds: [item.id],
        });
      } else {
        const group = groupedMap.get(key)!;
        // Update min_cut with the best grade (lowest number from 50p)
        if (validGrade50p !== null) {
          if (group.minCut === null || validGrade50p < group.minCut) {
            group.minCut = validGrade50p;
          }
        }
        // Update max_cut with the worst grade (highest number from 70p)
        if (validGrade70p !== null) {
          if (group.maxCut === null || validGrade70p > group.maxCut) {
            group.maxCut = validGrade70p;
          }
        }
        // 같은 대학/전형의 다른 모집단위가 가진 특별전형 ID들도 merge
        group.subtypeIds = Array.from(new Set([...group.subtypeIds, ...subtypeIds]));
        group.recruitmentUnitIds.push(item.id);
      }
    });

    return Array.from(groupedMap.values()).map((group) => {
      // Return group as-is with real grade data from ipkyul table
      if (group.minCut !== null && group.maxCut !== null) {
        return {
          ...group,
          minCut: parseFloat(group.minCut.toFixed(2)),
          maxCut: parseFloat(group.maxCut.toFixed(2)),
        };
      }
      return group;
    });
  }

  /**
   * 계열(department) 문자열을 ID로 변환
   */
  private getDepartmentId(department: string | null): number {
    if (!department) return 0;

    const departmentMap: Record<string, number> = {
      인문: 1,
      인문계열: 1,
      사회: 2,
      사회계열: 2,
      자연: 3,
      자연계열: 3,
      공학: 4,
      공학계열: 4,
      의약: 5,
      의약계열: 5,
      예체능: 6,
      예체능계열: 6,
      교육: 7,
      교육계열: 7,
      무전공: 8,
    };
    return departmentMap[department] || 0;
  }

  /**
   * 과거 입결 데이터 구성
   */
  private buildPreviousResults(cut: SusiKyokwaIpkyulEntity | undefined) {
    if (!cut) return [];

    const results = [];

    if (cut.studentRecordGrade50_2024 || cut.competitionRate2024) {
      results.push({
        year: 2024,
        result_criteria: '50%',
        grade_cut: cut.studentRecordGrade50_2024 || null,
        converted_score_cut: null, // No equivalent field in ipkyul table
        competition_ratio: cut.competitionRate2024 || null,
        recruitment_number: cut.recruitment2024 || null,
      });
    }

    if (cut.studentRecordGrade50_2023 || cut.competitionRate2023) {
      results.push({
        year: 2023,
        result_criteria: '50%',
        grade_cut: cut.studentRecordGrade50_2023 || null,
        converted_score_cut: null, // No equivalent field in ipkyul table
        competition_ratio: cut.competitionRate2023 || null,
        recruitment_number: cut.recruitment2023 || null,
      });
    }

    return results;
  }
}
