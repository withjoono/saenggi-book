// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RecruitmentUnitQueryDto } from '../dtos/recruitment-unit-query.dto';

@Injectable()
export class SusiRecruitmentUnitService {
  constructor(  ) {}

  /**
   * 수시 모집단위 목록 조회 (필터링, 페이징)
   */
  async getRecruitmentUnits(queryDto: RecruitmentUnitQueryDto) {
    const {
      page = 1,
      limit = 20,
      universityCode,
      universityName,
      admissionType,
      admissionTypeCode,
      admissionName,
      unitName,
      region,
    } = queryDto;

    const queryBuilder = this.recruitmentUnitRepository.createQueryBuilder('ru');

    // 필터링
    if (universityCode) {
      queryBuilder.andWhere('ru.university_code = :universityCode', { universityCode });
    }
    if (universityName) {
      queryBuilder.andWhere('ru.university_name LIKE :universityName', {
        universityName: `%${universityName}%`,
      });
    }
    if (admissionType) {
      queryBuilder.andWhere('ru.admission_type = :admissionType', { admissionType });
    }
    if (admissionTypeCode) {
      queryBuilder.andWhere('ru.admission_type_code = :admissionTypeCode', { admissionTypeCode });
    }
    if (admissionName) {
      queryBuilder.andWhere('ru.admission_name LIKE :admissionName', {
        admissionName: `%${admissionName}%`,
      });
    }
    if (unitName) {
      queryBuilder.andWhere('ru.unit_name LIKE :unitName', { unitName: `%${unitName}%` });
    }
    if (region) {
      queryBuilder.andWhere('ru.region = :region', { region });
    }

    // 정렬
    queryBuilder.orderBy('ru.university_name', 'ASC');
    queryBuilder.addOrderBy('ru.admission_type_code', 'ASC');
    queryBuilder.addOrderBy('ru.unit_name', 'ASC');

    // 페이징
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, totalCount] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * ID로 모집단위 상세 조회
   */
  async getRecruitmentUnitById(id: string): Promise<SusiRecruitmentUnitEntity> {
    const recruitmentUnit = await this.recruitmentUnitRepository.findOne({
      where: { id },
    });

    if (!recruitmentUnit) {
      throw new NotFoundException(`ID ${id}에 해당하는 모집단위를 찾을 수 없습니다.`);
    }

    return recruitmentUnit;
  }

  /**
   * 대학코드로 모집단위 목록 조회
   */
  async getRecruitmentUnitsByUniversityCode(universityCode: string) {
    return await this.recruitmentUnitRepository.find({
      where: { universityCode },
      order: {
        admissionTypeCode: 'ASC',
        unitName: 'ASC',
      },
    });
  }

  /**
   * 전형타입으로 모집단위 목록 조회
   */
  async getRecruitmentUnitsByAdmissionType(admissionType: string) {
    return await this.recruitmentUnitRepository.find({
      where: { admissionType },
      order: {
        universityName: 'ASC',
        unitName: 'ASC',
      },
    });
  }

  /**
   * 지역별 모집단위 목록 조회
   */
  async getRecruitmentUnitsByRegion(region: string) {
    return await this.recruitmentUnitRepository.find({
      where: { region },
      order: {
        universityName: 'ASC',
        admissionTypeCode: 'ASC',
        unitName: 'ASC',
      },
    });
  }

  /**
   * 전형타입 목록 조회 (중복 제거)
   */
  async getAdmissionTypes() {
    const result = await this.recruitmentUnitRepository
      .createQueryBuilder('ru')
      .select('ru.admission_type', 'admissionType')
      .addSelect('ru.admission_type_code', 'admissionTypeCode')
      .distinct(true)
      .orderBy('ru.admission_type_code', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      admissionType: item.admissionType,
      admissionTypeCode: item.admissionTypeCode,
    }));
  }

  /**
   * 지역 목록 조회 (중복 제거)
   */
  async getRegions() {
    const result = await this.recruitmentUnitRepository
      .createQueryBuilder('ru')
      .select('ru.region', 'region')
      .where('ru.region IS NOT NULL')
      .distinct(true)
      .orderBy('ru.region', 'ASC')
      .getRawMany();

    return result.map((item) => item.region);
  }

  /**
   * 대학 목록 조회 (중복 제거)
   */
  async getUniversities() {
    const result = await this.recruitmentUnitRepository
      .createQueryBuilder('ru')
      .select('ru.university_code', 'universityCode')
      .addSelect('ru.university_name', 'universityName')
      .addSelect('ru.region', 'region')
      .distinct(true)
      .orderBy('ru.university_name', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      universityCode: item.universityCode,
      universityName: item.universityName,
      region: item.region,
    }));
  }

  /**
   * 통계 조회
   */
  async getStatistics() {
    const totalCount = await this.recruitmentUnitRepository.count();

    const universityCount = await this.recruitmentUnitRepository
      .createQueryBuilder('ru')
      .select('COUNT(DISTINCT ru.university_code)', 'count')
      .getRawOne();

    const admissionTypeCount = await this.recruitmentUnitRepository
      .createQueryBuilder('ru')
      .select('COUNT(DISTINCT ru.admission_type)', 'count')
      .getRawOne();

    const regionCount = await this.recruitmentUnitRepository
      .createQueryBuilder('ru')
      .select('COUNT(DISTINCT ru.region)', 'count')
      .where('ru.region IS NOT NULL')
      .getRawOne();

    return {
      totalRecruitmentUnits: totalCount,
      totalUniversities: parseInt(universityCount.count),
      totalAdmissionTypes: parseInt(admissionTypeCount.count),
      totalRegions: parseInt(regionCount.count),
    };
  }
}
