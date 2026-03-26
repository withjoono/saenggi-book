// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * 2027학년도 수시 교과전형 서비스
 * - susi_kyokwa_cut: 입시결과 (등급컷, 경쟁률)
 * - susi_kyokwa_recruitment: 세부내역 (전형방법, 반영비율)
 * - susi_kyokwa_special: 일반/특별전형 구분
 */
@Injectable()
export class SusiKyokwa2027Service {
  constructor(  ) {}

  // ========== 입시결과 (Cut) ==========

  /**
   * 교과전형 입시결과 목록 조회
   */
  async getCutList(options?: {
    page?: number;
    limit?: number;
    universityCode?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.cutRepository.createQueryBuilder('cut');

    if (options?.universityCode) {
      // ida_id에서 대학코드 추출 (예: 26-U001211 -> U001)
      queryBuilder.where("cut.ida_id LIKE :code", {
        code: `%-${options.universityCode}%`
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('cut.idaId', 'ASC')
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
  async getCutByIdaId(idaId: string) {
    const item = await this.cutRepository.findOne({
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
  async getCutByIdaIds(idaIds: string[]) {
    return this.cutRepository.find({
      where: { idaId: In(idaIds) },
    });
  }

  // ========== 세부내역 (Recruitment) ==========

  /**
   * 교과전형 세부내역 목록 조회
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
   * ida_id로 교과전형 전체 정보 조회 (입시결과 + 세부내역 + 특별전형)
   */
  async getFullInfoByIdaId(idaId: string) {
    const [cut, recruitment, special] = await Promise.all([
      this.cutRepository.findOne({ where: { idaId } }),
      this.recruitmentRepository.findOne({ where: { idaId } }),
      this.specialRepository.findOne({ where: { idaId } }),
    ]);

    if (!recruitment) {
      throw new NotFoundException(`교과전형 정보를 찾을 수 없습니다: ${idaId}`);
    }

    return {
      idaId,
      // 기본 정보 (recruitment에서)
      university: {
        name: recruitment.universityName,
        code: recruitment.universityCode,
        type: recruitment.universityType,
        region: recruitment.regionMajor,
        regionDetail: recruitment.regionDetail,
      },
      admission: {
        type: recruitment.admissionType,
        name: recruitment.admissionName,
        category: recruitment.admissionCategory,
        method: recruitment.admissionMethod,
        minimumStandard: recruitment.minimumStandard,
      },
      recruitmentUnit: {
        name: recruitment.recruitmentUnit,
        category: recruitment.category,
        count: recruitment.recruitmentCount,
        majorField: recruitment.majorField,
        midField: recruitment.midField,
        minorField: recruitment.minorField,
      },
      // 전형 요소 비율
      selectionRatios: {
        model: recruitment.selectionModel,
        ratio: recruitment.selectionRatio,
        stage1Method: recruitment.stage1Method,
        stage2Method: recruitment.stage2Method,
        studentRecordQuantitative: recruitment.studentRecordQuantitative,
        studentRecordQualitative: recruitment.studentRecordQualitative,
        interview: recruitment.interviewRatio,
        essay: recruitment.essayRatio,
        practical: recruitment.practicalRatio,
        document: recruitment.documentRatio,
      },
      // 학년별 반영 비율
      gradeRatios: {
        grade1: recruitment.grade1Ratio,
        grade2: recruitment.grade2Ratio,
        grade3: recruitment.grade3Ratio,
        grade12: recruitment.grade12Ratio,
        grade23: recruitment.grade23Ratio,
        grade123: recruitment.grade123Ratio,
      },
      // 등급별 환산점수
      gradeScores: {
        grade1: recruitment.grade1Score,
        grade2: recruitment.grade2Score,
        grade3: recruitment.grade3Score,
        grade4: recruitment.grade4Score,
        grade5: recruitment.grade5Score,
        grade6: recruitment.grade6Score,
        grade7: recruitment.grade7Score,
        grade8: recruitment.grade8Score,
        grade9: recruitment.grade9Score,
      },
      // 입시결과 (cut에서)
      results: cut ? {
        gradeAvg: cut.gradeAvg,
        gradeInitialCut: cut.gradeInitialCut,
        gradeAdditionalCut: cut.gradeAdditionalCut,
        convertedScoreAvg: cut.convertedScoreAvg,
        years: {
          2023: {
            recruitment: cut.recruitment2023,
            competitionRate: cut.competitionRate2023,
            grade50p: cut.grade50p2023,
            grade70p: cut.grade70p2023,
          },
          2024: {
            recruitment: cut.recruitment2024,
            competitionRate: cut.competitionRate2024,
            grade50p: cut.grade50p2024,
            grade70p: cut.grade70p2024,
          },
          2025: {
            recruitment: cut.recruitment2025,
            competitionRate: cut.competitionRate2025,
            grade50p: cut.grade50p2025,
            grade70p: cut.grade70p2025,
          },
          2026: {
            recruitment: cut.recruitment2026,
            competitionRate: cut.competitionRate2026,
            grade50p: cut.grade50p2026,
            grade70p: cut.grade70p2026,
          },
        },
      } : null,
      // 특별전형 정보 (special에서)
      special: special ? {
        admissionCategory: special.admissionCategory,
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
    const [cutCount, recruitmentCount, specialCount] = await Promise.all([
      this.cutRepository.count(),
      this.recruitmentRepository.count(),
      this.specialRepository.count(),
    ]);

    const universityCount = await this.recruitmentRepository
      .createQueryBuilder('rec')
      .select('COUNT(DISTINCT rec.universityCode)', 'count')
      .getRawOne();

    return {
      cutCount,
      recruitmentCount,
      specialCount,
      universityCount: parseInt(universityCount?.count || '0'),
    };
  }
}
