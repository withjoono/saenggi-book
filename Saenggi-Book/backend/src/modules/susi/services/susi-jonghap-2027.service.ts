// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * 2027학년도 수시 종합전형 서비스
 * - susi_jonghap_ipkyul: 입시결과 (등급컷, 경쟁률)
 * - susi_jonghap_recruitment: 세부내역 (전형방법)
 * - susi_jonghap_special: 일반/특별전형 구분
 */
@Injectable()
export class SusiJonghap2027Service {
  constructor(  ) {}

  // ========== 입시결과 (Ipkyul) ==========

  /**
   * 종합전형 입시결과 목록 조회
   */
  async getIpkyulList(options?: {
    page?: number;
    limit?: number;
    universityCode?: string;
    admissionType?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ipkyulRepository.createQueryBuilder('ipkyul');

    if (options?.universityCode) {
      queryBuilder.andWhere('ipkyul.universityCode = :universityCode', {
        universityCode: options.universityCode,
      });
    }

    if (options?.admissionType) {
      queryBuilder.andWhere('ipkyul.admissionType = :admissionType', {
        admissionType: options.admissionType,
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('ipkyul.universityName', 'ASC')
      .addOrderBy('ipkyul.recruitmentUnit', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * ida_id로 입시결과 조회
   */
  async getIpkyulByIdaId(idaId: string) {
    const item = await this.ipkyulRepository.findOne({
      where: { idaId },
    });

    if (!item) {
      throw new NotFoundException(`입시결과를 찾을 수 없습니다: ${idaId}`);
    }

    return item;
  }

  /**
   * 여러 ida_id로 입시결과 조회
   */
  async getIpkyulByIdaIds(idaIds: string[]) {
    return this.ipkyulRepository.find({
      where: { idaId: In(idaIds) },
    });
  }

  // ========== 세부내역 (Recruitment) ==========

  /**
   * 종합전형 세부내역 목록 조회
   */
  async getRecruitmentList(options?: {
    page?: number;
    limit?: number;
    universityCode?: string;
    admissionType?: string;
    admissionCategory?: string;
    region?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.recruitmentRepository.createQueryBuilder('rec');

    if (options?.universityCode) {
      queryBuilder.andWhere('rec.universityCode = :universityCode', {
        universityCode: options.universityCode,
      });
    }

    if (options?.admissionType) {
      queryBuilder.andWhere('rec.admissionType = :admissionType', {
        admissionType: options.admissionType,
      });
    }

    if (options?.admissionCategory) {
      queryBuilder.andWhere('rec.admissionCategory = :admissionCategory', {
        admissionCategory: options.admissionCategory,
      });
    }

    if (options?.region) {
      queryBuilder.andWhere('rec.regionMajor = :region', {
        region: options.region,
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('rec.universityName', 'ASC')
      .addOrderBy('rec.recruitmentUnit', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * ida_id로 세부내역 조회
   */
  async getRecruitmentByIdaId(idaId: string) {
    const item = await this.recruitmentRepository.findOne({
      where: { idaId },
    });

    if (!item) {
      throw new NotFoundException(`세부내역을 찾을 수 없습니다: ${idaId}`);
    }

    return item;
  }

  /**
   * 대학 목록 조회 (중복 제거)
   */
  async getUniversities() {
    const result = await this.recruitmentRepository
      .createQueryBuilder('rec')
      .select('rec.universityCode', 'universityCode')
      .addSelect('rec.universityName', 'universityName')
      .addSelect('rec.universityType', 'universityType')
      .addSelect('rec.regionMajor', 'region')
      .groupBy('rec.universityCode')
      .addGroupBy('rec.universityName')
      .addGroupBy('rec.universityType')
      .addGroupBy('rec.regionMajor')
      .orderBy('rec.universityName', 'ASC')
      .getRawMany();

    return result;
  }

  /**
   * 전형 유형 목록 조회 (중복 제거)
   */
  async getAdmissionTypes() {
    const result = await this.recruitmentRepository
      .createQueryBuilder('rec')
      .select('rec.admissionType', 'admissionType')
      .addSelect('rec.admissionName', 'admissionName')
      .groupBy('rec.admissionType')
      .addGroupBy('rec.admissionName')
      .orderBy('rec.admissionType', 'ASC')
      .getRawMany();

    return result;
  }

  // ========== 일반/특별전형 (Special) ==========

  /**
   * 특별전형 목록 조회
   */
  async getSpecialList(options?: {
    admissionCategory?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.specialRepository.createQueryBuilder('spec');

    if (options?.admissionCategory) {
      queryBuilder.where('spec.admissionCategory = :category', {
        category: options.admissionCategory,
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('spec.idaId', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * ida_id로 특별전형 정보 조회
   */
  async getSpecialByIdaId(idaId: string) {
    return this.specialRepository.findOne({
      where: { idaId },
    });
  }

  // ========== 통합 조회 ==========

  /**
   * ida_id로 종합전형 전체 정보 조회 (입시결과 + 세부내역 + 특별전형)
   */
  async getFullInfoByIdaId(idaId: string) {
    const [ipkyul, recruitment, special] = await Promise.all([
      this.ipkyulRepository.findOne({ where: { idaId } }),
      this.recruitmentRepository.findOne({ where: { idaId } }),
      this.specialRepository.findOne({ where: { idaId } }),
    ]);

    if (!recruitment && !ipkyul) {
      throw new NotFoundException(`종합전형 정보를 찾을 수 없습니다: ${idaId}`);
    }

    // recruitment 또는 ipkyul에서 기본 정보 추출
    const baseInfo = recruitment || ipkyul;

    return {
      idaId,
      // 기본 정보
      university: {
        name: baseInfo.universityName,
        code: baseInfo.universityCode,
        type: recruitment?.universityType || null,
        region: recruitment?.regionMajor || null,
        regionDetail: recruitment?.regionDetail || null,
      },
      admission: {
        type: baseInfo.admissionType,
        name: recruitment?.admissionName || ipkyul?.admissionDetail || null,
        category: recruitment?.admissionCategory || null,
        method: recruitment?.admissionMethod || null,
        minimumStandard: recruitment?.minimumStandard || null,
      },
      recruitmentUnit: {
        name: baseInfo.recruitmentUnit,
        category: baseInfo.category,
        count: recruitment?.recruitmentCount || null,
        majorField: recruitment?.majorField || null,
        midField: recruitment?.midField || null,
        minorField: recruitment?.minorField || null,
      },
      // 입시결과 (ipkyul에서)
      results: ipkyul ? {
        gradeAvg: ipkyul.gradeAvg,
        grade70pCut: ipkyul.grade70pCut,
        grade90pCut: ipkyul.grade90pCut,
        years: {
          2023: {
            recruitment: ipkyul.recruitment2023,
            competitionRate: ipkyul.competitionRate2023,
            additionalPassRank: ipkyul.additionalPassRank2023,
            actualCompetitionRate: ipkyul.actualCompetitionRate2023,
            grade50p: ipkyul.grade50p2023,
            grade70p: ipkyul.grade70p2023,
          },
          2024: {
            recruitment: ipkyul.recruitment2024,
            competitionRate: ipkyul.competitionRate2024,
            additionalPassRank: ipkyul.additionalPassRank2024,
            actualCompetitionRate: ipkyul.actualCompetitionRate2024,
            grade50p: ipkyul.grade50p2024,
            grade70p: ipkyul.grade70p2024,
          },
          2025: {
            recruitment: ipkyul.recruitment2025,
            competitionRate: ipkyul.competitionRate2025,
            additionalPassRank: ipkyul.additionalPassRank2025,
            actualCompetitionRate: ipkyul.actualCompetitionRate2025,
            grade50p: ipkyul.grade50p2025,
            grade70p: ipkyul.grade70p2025,
          },
          2026: {
            recruitment: ipkyul.recruitment2026,
            competitionRate: ipkyul.competitionRate2026,
            additionalPassRank: ipkyul.additionalPassRank2026,
            actualCompetitionRate: ipkyul.actualCompetitionRate2026,
            grade50p: ipkyul.grade50p2026,
            grade70p: ipkyul.grade70p2026,
          },
        },
      } : null,
      // 특별전형 정보 (special에서)
      special: special ? {
        admissionCategory: special.admissionCategory,
        specialAdmissionTypes: special.specialAdmissionTypes,
        qualification: special.qualification2026,
      } : null,
    };
  }

  /**
   * 검색 (대학명, 모집단위명)
   */
  async search(query: string, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await this.recruitmentRepository.findAndCount({
      where: [
        { universityName: Like(`%${query}%`) },
        { recruitmentUnit: Like(`%${query}%`) },
        { admissionName: Like(`%${query}%`) },
      ],
      order: { universityName: 'ASC', recruitmentUnit: 'ASC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 통계 정보
   */
  async getStats() {
    const [ipkyulCount, recruitmentCount, specialCount] = await Promise.all([
      this.ipkyulRepository.count(),
      this.recruitmentRepository.count(),
      this.specialRepository.count(),
    ]);

    const universityCount = await this.recruitmentRepository
      .createQueryBuilder('rec')
      .select('COUNT(DISTINCT rec.universityCode)', 'count')
      .getRawOne();

    return {
      ipkyulCount,
      recruitmentCount,
      specialCount,
      universityCount: parseInt(universityCount?.count || '0'),
    };
  }
}
