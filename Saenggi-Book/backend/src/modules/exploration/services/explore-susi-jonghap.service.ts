// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Inject, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

/**
 * 수시 종합전형 탐색 서비스
 * - susi_jonghap_recruitment 및 susi_jonghap_ipkyul 테이블을 직접 조회
 * - 복잡한 관계 탐색 로직 제거, ida_id로 조인
 * - 프론트엔드 탐색 페이지의 요구사항에 맞춰 데이터 반환
 */
@Injectable()
export class ExploreSusiJonghapService {
  private readonly logger = new Logger(ExploreSusiJonghapService.name);

  constructor(    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * Step 1: 연도, 전형으로 조회 (등급컷, 대학이름 등)
   * - 프론트엔드 차트에서 사용
   */
  async getStep1(year: string, basicType: '일반' | '특별', minorFieldId?: string, subtypeIds?: number[]) {
    /* 캐시 키 버전 업데이트 v6: API response structure fix (nested university) */
    const cacheKey = `explore-susi-jonghap:step1:${year}-${basicType}-${minorFieldId || 'all'}-${subtypeIds?.join(',') || 'all'}:v7`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 전체 데이터 수 확인
    const totalCount = await this.susiJonghapRecruitmentRepository.count();
    this.logger.log(`[getStep1] Total recruitment records: ${totalCount}`);

    // minorFieldId가 제공된 경우 소계열 필드 이름 조회
    let minorFieldName: string | null = null;
    if (minorFieldId) {
      const minorField = await this.minorFieldRepository.findOne({
        where: { id: parseInt(minorFieldId) },
        relations: ['mid_field', 'mid_field.major_field'],
      });

      if (minorField) {
        minorFieldName = minorField.name;
        this.logger.log(`[getStep1] Found minor field: ${minorFieldName} (ID: ${minorFieldId})`);
      }
    }

    // 일반/특별 전형 필터링
    const whereCondition: any = { admissionCategory: basicType };

    // 일반/특별 전형 데이터 수 확인
    const targetCount = await this.susiJonghapRecruitmentRepository.count({
      where: whereCondition,
    });
    this.logger.log(`[getStep1] Filtered by admissionCategory="${basicType}": ${targetCount}`);

    // susi_jonghap_recruitment 테이블에서 데이터 조회
    let recruitmentData = await this.susiJonghapRecruitmentRepository.find({
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
        minorField: true,
        recruitmentCount: true,
        specialAdmissionTypes: true,
      },
    });

    // minorFieldName이 있는 경우 majorField로 필터링
    // minorFieldName이 있는 경우 majorField로 필터링
    if (minorFieldName) {
      const originalData = recruitmentData;
      recruitmentData = recruitmentData.filter(item => {
        return item.minorField && item.minorField.includes(minorFieldName);
      });
      this.logger.log(`[getStep1] Filtered by minorField "${minorFieldName}": ${recruitmentData.length} items`);

      if (recruitmentData.length === 0 && originalData.length > 0) {
        const samples = originalData.slice(0, 5).map(i => i.majorField).join(', ');
        this.logger.warn(`[getStep1] ALL DATA FILTERED OUT! Target: "${minorFieldName}", Samples: [${samples}]`);
      }

      // subtypeIds가 있는 경우 specialAdmissionTypes 필터링
      if (subtypeIds && subtypeIds.length > 0) {
        recruitmentData = recruitmentData.filter(item => {
          if (!item.specialAdmissionTypes) return false;
          // Parse "1,2,3" into [1,2,3]
          const unitSubtypes = item.specialAdmissionTypes
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));

          // Check intersection (OR logic: if item supports ANY of the selected subtypes)
          return subtypeIds.some(id => unitSubtypes.includes(id));
        });
        this.logger.log(`[getStep1] Filtered by subtypeIds [${subtypeIds.join(',')}]: ${recruitmentData.length} items`);
      }
    }

    return this.processStep1Data(recruitmentData, cacheKey);
  }

  /**
   * Step 1 데이터 처리 공통 로직
   */
  private async processStep1Data(
    recruitmentData: SusiJonghapRecruitmentEntity[],
    cacheKey: string,
  ) {
    // ida_id 목록 추출
    const idaIds = recruitmentData.map((r) => r.idaId).filter(Boolean);

    // susi_jonghap_ipkyul 테이블에서 등급컷 정보 조회
    const ipkyulData = await this.susiJonghapIpkyulRepository.find({
      where: {
        idaId: In(idaIds),
      },
    });

    // ida_id를 키로 하는 Map 생성
    const ipkyulMap = new Map(ipkyulData.map((cut) => [cut.idaId, cut]));

    // 데이터 그룹화 (대학명-전형명으로 그룹화)
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
   * 데이터 그룹화 (Step 1용)
   * - 대학명-전형명으로 그룹화하여 grade_50_cut, grade_70_cut 계산
   */
  private groupDataForStep1(
    recruitmentData: SusiJonghapRecruitmentEntity[],
    ipkyulMap: Map<string, SusiJonghapIpkyulEntity>,
  ) {
    const groupedMap = new Map<
      string,
      {
        id: number;
        admission: {
          id: number;
          name: string;
          year: number;
          basicType: '일반' | '특별';
          category: { id: number; name: string };
          subtypes: any[];
          university: {
            id: number;
            name: string;
            region: string;
            code: string;
            establishmentType: string;
          };
        };
        generalField: { id: number; name: string };
        name: string;
        recruitmentNumber: number | null;
        scores: {
          gradeAvg: number | null;
          grade50Cut: number | null;
          grade70Cut: number | null;
          convert50Cut: number | null;
          convert70Cut: number | null;
          riskPlus5: number | null;
          riskPlus4: number | null;
          riskPlus3: number | null;
          riskPlus2: number | null;
          riskPlus1: number | null;
          riskMinus1: number | null;
          riskMinus2: number | null;
          riskMinus3: number | null;
          riskMinus4: number | null;
          riskMinus5: number | null;
        } | null;
      }
    >();

    recruitmentData.forEach((item) => {
      if (!item.majorField) return;

      // 대학/전형/모집단위로 그룹화 (Granularity Increase)
      // 기존: `${item.universityName}-${item.admissionName}` -> 하나의 점으로 합쳐짐
      // 변경: `${item.universityName}-${item.admissionName}-${item.recruitmentUnit}` -> 개별 모집단위 표시
      const key = `${item.universityName}-${item.admissionName}-${item.recruitmentUnit}`;
      const ipkyul = ipkyulMap.get(item.idaId);

      // 2026년도 등급컷 사용
      const grade50p = ipkyul?.grade50p2026;
      const grade70p = ipkyul?.grade70p2026;
      const gradeAvg = ipkyul?.gradeAvg;

      const grade50pNum = grade50p ? parseFloat(String(grade50p)) : NaN;
      const grade70pNum = grade70p ? parseFloat(String(grade70p)) : NaN;
      const gradeAvgNum = gradeAvg ? parseFloat(String(gradeAvg)) : NaN;

      const validGrade50p = !isNaN(grade50pNum) && grade50pNum >= 1 && grade50pNum <= 9 ? grade50pNum : null;
      const validGrade70p = !isNaN(grade70pNum) && grade70pNum >= 1 && grade70pNum <= 9 ? grade70pNum : null;
      const validGradeAvg = !isNaN(gradeAvgNum) && gradeAvgNum >= 1 && gradeAvgNum <= 9 ? gradeAvgNum : null;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: item.id,
          admission: {
            id: 0,
            name: item.admissionName || '',
            year: 2026,
            basicType: item.admissionCategory as '일반' | '특별',
            category: { id: 2, name: '종합' },
            subtypes: item.specialAdmissionTypes
              ? item.specialAdmissionTypes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
              : [],
            university: {
              id: 0,
              name: item.universityName || '',
              region: item.regionMajor || '',
              code: item.universityCode || '',
              establishmentType: item.universityType || '',
            },
          },
          generalField: {
            id: this.getDepartmentId(item.majorField),
            name: item.majorField,
          },
          name: item.recruitmentUnit || '',
          recruitmentNumber: item.recruitmentCount || null,
          scores: validGrade50p !== null || validGrade70p !== null || validGradeAvg !== null
            ? {
              gradeAvg: validGradeAvg,
              grade50Cut: validGrade50p,
              grade70Cut: validGrade70p,
              convert50Cut: null,
              convert70Cut: null,
              riskPlus5: null,
              riskPlus4: null,
              riskPlus3: null,
              riskPlus2: null,
              riskPlus1: null,
              riskMinus1: null,
              riskMinus2: null,
              riskMinus3: null,
              riskMinus4: null,
              riskMinus5: null,
            }
            : null,
        });
      } else {
        const group = groupedMap.get(key)!;

        if (validGradeAvg !== null && group.scores) {
          if (group.scores.gradeAvg === null || validGradeAvg < group.scores.gradeAvg) {
            group.scores.gradeAvg = validGradeAvg;
          }
        }

        if (validGrade50p !== null && group.scores) {
          if (group.scores.grade50Cut === null || validGrade50p < group.scores.grade50Cut) {
            group.scores.grade50Cut = validGrade50p;
          }
        }

        if (validGrade70p !== null && group.scores) {
          if (group.scores.grade70Cut === null || validGrade70p > group.scores.grade70Cut) {
            group.scores.grade70Cut = validGrade70p;
          }
        }
      }
    });

    const result = Array.from(groupedMap.values()).map((group) => {
      // Return scores if ANY valid grade exists
      if (group.scores && (group.scores.grade50Cut !== null || group.scores.grade70Cut !== null || group.scores.gradeAvg !== null)) {
        return {
          ...group,
          scores: {
            ...group.scores,
            gradeAvg: group.scores.gradeAvg ? parseFloat(group.scores.gradeAvg.toFixed(2)) : null,
            grade50Cut: group.scores.grade50Cut ? parseFloat(group.scores.grade50Cut.toFixed(2)) : null,
            grade70Cut: group.scores.grade70Cut ? parseFloat(group.scores.grade70Cut.toFixed(2)) : null,
          },
        };
      }
      return {
        ...group,
        scores: null
      };
    });

    const validScoresCount = result.filter(r => r.scores !== null).length;
    this.logger.log(`[groupDataForStep1] Total groups: ${result.length}, Valid scores: ${validScoresCount}`);
    if (validScoresCount === 0 && result.length > 0) {
      this.logger.warn(`[groupDataForStep1] WARNING: No items have valid scores! Checking first item sample:`);
      const sample = recruitmentData[0];
      if (sample) {
        const ipkyul = ipkyulMap.get(sample.idaId);
        this.logger.warn(` Sample Item: ${sample.universityName} ${sample.admissionName} (IDA ID: ${sample.idaId})`);
        this.logger.warn(` Sample Ipkyul found: ${!!ipkyul}`);
        if (ipkyul) {
          this.logger.warn(` Ipkyul Data: gradeAvg=${ipkyul.gradeAvg}, grade50=${ipkyul.grade50p2026}, grade70=${ipkyul.grade70p2026}`);
        }
      }
    }

    return result;
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

  async getStep2(jonghapRecruitmentIds: number[]) {
    this.logger.log(`[getStep2] Received ${jonghapRecruitmentIds.length} jonghap recruitment IDs`);

    if (jonghapRecruitmentIds.length === 0) {
      return { items: [] };
    }

    // 1. susi_jonghap_recruitment에서 선택된 레코드 조회
    const recruitmentData = await this.susiJonghapRecruitmentRepository.find({
      where: {
        id: In(jonghapRecruitmentIds),
      },
    });

    this.logger.log(`[getStep2] Found ${recruitmentData.length} recruitment records`);

    // 2. ida_id 목록 추출
    const idaIds = recruitmentData.map((r) => r.idaId).filter(Boolean);
    this.logger.log(`[getStep2] Extracted ${idaIds.length} ida_ids`);

    // 3. susi_jonghap_ipkyul에서 성적 정보 조회
    const ipkyulData = await this.susiJonghapIpkyulRepository.find({
      where: {
        idaId: In(idaIds),
      },
    });

    this.logger.log(`[getStep2] Found ${ipkyulData.length} ipkyul records`);

    // 4. ida_id를 키로 하는 Map 생성
    const ipkyulMap = new Map(ipkyulData.map((cut) => [cut.idaId, cut]));

    // 5. 데이터 결합
    const items = recruitmentData.map((recruitment) => {
      const ipkyul = ipkyulMap.get(recruitment.idaId);

      return {
        id: recruitment.id,
        university: {
          id: recruitment.id, // temporary id
          name: recruitment.universityName,
          region: recruitment.regionMajor,
          code: recruitment.universityCode,
          establishmentType: recruitment.universityType,
        },
        admission: {
          id: recruitment.id, // temporary id
          name: recruitment.admissionName,
          year: 2026, // 현재 년도
          basicType: recruitment.admissionCategory as '일반' | '특별',
          category: {
            id: recruitment.id, // temporary id
            name: recruitment.category,
          },
        },
        generalField: {
          id: recruitment.id, // temporary id
          name: recruitment.majorField,
        },
        name: recruitment.recruitmentUnit,
        recruitmentNumber: recruitment.recruitmentCount,
        scores: ipkyul ? {
          gradeAvg: ipkyul.gradeAvg ?? null,
          grade70pCut: ipkyul.grade70pCut ?? null,
          grade90pCut: ipkyul.grade90pCut ?? null,
          grade70p2023: ipkyul.grade70p2023 ?? null,
          grade70p2024: ipkyul.grade70p2024 ?? null,
          grade70p2025: ipkyul.grade70p2025 ?? null,
          competitionRate2023: ipkyul.competitionRate2023 ?? null,
          competitionRate2024: ipkyul.competitionRate2024 ?? null,
          competitionRate2025: ipkyul.competitionRate2025 ?? null,
        } : null,
      };
    });

    this.logger.log(`[getStep2] Returning ${items.length} items`);
    return { items };
  }

  async getStep3(recruitmentUnitIds: number[]) {
    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
      .leftJoinAndSelect('recruitmentUnit.minimum_grade', 'minimumGrade')
      .where('recruitmentUnit.id IN (:...ids)', { ids: recruitmentUnitIds });

    const recruitmentUnits = await queryBuilder.getMany();

    const items = recruitmentUnits.map((unit) => ({
      id: unit.id,
      university: unit.admission.university,
      admission: {
        id: unit.admission.id,
        name: unit.admission.name,
        year: unit.admission.year,
        basicType: unit.admission.basic_type,
      },
      name: unit.name,
      recruitmentNumber: unit.recruitment_number,
      minimumGrade: unit.minimum_grade
        ? {
          isApplied: unit.minimum_grade.is_applied,
          description: unit.minimum_grade.description,
        }
        : null,
    }));

    return { items };
  }

  async getStep4(recruitmentUnitIds: number[]) {
    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
      .leftJoinAndSelect('recruitmentUnit.interview', 'interview')
      .where('recruitmentUnit.id IN (:...ids)', { ids: recruitmentUnitIds });

    const recruitmentUnits = await queryBuilder.getMany();

    const items = recruitmentUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      recruitmentNumber: unit.recruitment_number,
      university: unit.admission.university,
      admission: {
        id: unit.admission.id,
        name: unit.admission.name,
        year: unit.admission.year,
        basicType: unit.admission.basic_type,
      },
      generalField: {
        id: unit.general_field.id,
        name: unit.general_field.name,
      },
      interview: unit.interview
        ? {
          isReflected: unit.interview.is_reflected,
          interviewType: unit.interview.interview_type,
          materialsUsed: unit.interview.materials_used,
          interviewProcess: unit.interview.interview_process,
          evaluationContent: unit.interview.evaluation_content,
          interviewDate: unit.interview.interview_date,
          interviewTime: unit.interview.interview_time,
        }
        : null,
    }));

    return { items };
  }

  async getDetail(recruitmentUnitId: number) {
    const recruitmentUnit = await this.recruitmentUnitRepository.findOne({
      where: { id: recruitmentUnitId },
      relations: [
        'admission',
        'admission.university',
        'admission.category',
        'admission.method',
        'admission.subtypes',
        'general_field',
        'minor_field',
        'minor_field.mid_field',
        'minor_field.mid_field.major_field',
        'minimum_grade',
        'interview',
        'scores',
      ],
    });

    if (!recruitmentUnit) {
      throw new NotFoundException(`Recruitment unit with ID "${recruitmentUnitId}" not found`);
    }

    return {
      id: recruitmentUnit.id,
      name: recruitmentUnit.name,
      recruitmentNumber: recruitmentUnit.recruitment_number,
      university: recruitmentUnit.admission.university,
      admission: {
        id: recruitmentUnit.admission.id,
        name: recruitmentUnit.admission.name,
        year: recruitmentUnit.admission.year,
        basicType: recruitmentUnit.admission.basic_type,
        category: recruitmentUnit.admission.category,
        subtypes: recruitmentUnit.admission.subtypes,
      },
      admissionMethod: recruitmentUnit.admission.method,
      generalField: recruitmentUnit.general_field,
      fields: {
        major: recruitmentUnit.minor_field?.mid_field?.major_field,
        mid: recruitmentUnit.minor_field?.mid_field,
        minor: recruitmentUnit.minor_field,
      },
      minimumGrade: recruitmentUnit.minimum_grade,
      interview: recruitmentUnit.interview,
      scores: recruitmentUnit.scores,
    };
  }
}
