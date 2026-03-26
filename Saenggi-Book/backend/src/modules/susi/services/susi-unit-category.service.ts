// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class SusiUnitCategoryService {
  constructor(  ) {}

  /**
   * ID로 모집단위 계열 조회
   */
  async getCategoryById(id: string): Promise<SusiUnitCategoryEntity> {
    const category = await this.unitCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`ID ${id}에 해당하는 계열 정보를 찾을 수 없습니다.`);
    }

    return category;
  }

  /**
   * 여러 ID로 계열 정보 조회
   */
  async getCategoriesByIds(ids: string[]): Promise<SusiUnitCategoryEntity[]> {
    return await this.unitCategoryRepository
      .createQueryBuilder('uc')
      .where('uc.id IN (:...ids)', { ids })
      .getMany();
  }

  /**
   * 대계열별 모집단위 수 조회
   */
  async getMajorFieldStats() {
    const result = await this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('uc.major_field', 'majorField')
      .addSelect('uc.major_field_code', 'majorFieldCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('uc.major_field')
      .addGroupBy('uc.major_field_code')
      .orderBy('uc.major_field_code', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      majorField: item.majorField,
      majorFieldCode: parseInt(item.majorFieldCode),
      count: parseInt(item.count),
    }));
  }

  /**
   * 중계열별 모집단위 수 조회
   */
  async getMidFieldStats(majorFieldCode?: number) {
    const queryBuilder = this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('uc.major_field', 'majorField')
      .addSelect('uc.major_field_code', 'majorFieldCode')
      .addSelect('uc.mid_field', 'midField')
      .addSelect('uc.mid_field_code', 'midFieldCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('uc.major_field')
      .addGroupBy('uc.major_field_code')
      .addGroupBy('uc.mid_field')
      .addGroupBy('uc.mid_field_code');

    if (majorFieldCode !== undefined) {
      queryBuilder.where('uc.major_field_code = :majorFieldCode', { majorFieldCode });
    }

    queryBuilder.orderBy('uc.major_field_code', 'ASC');
    queryBuilder.addOrderBy('uc.mid_field_code', 'ASC');

    const result = await queryBuilder.getRawMany();

    return result.map((item) => ({
      majorField: item.majorField,
      majorFieldCode: parseInt(item.majorFieldCode),
      midField: item.midField,
      midFieldCode: parseInt(item.midFieldCode),
      count: parseInt(item.count),
    }));
  }

  /**
   * 소계열별 모집단위 수 조회
   */
  async getMinorFieldStats(midFieldCode?: number) {
    const queryBuilder = this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('uc.major_field', 'majorField')
      .addSelect('uc.major_field_code', 'majorFieldCode')
      .addSelect('uc.mid_field', 'midField')
      .addSelect('uc.mid_field_code', 'midFieldCode')
      .addSelect('uc.minor_field', 'minorField')
      .addSelect('uc.minor_field_code', 'minorFieldCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('uc.major_field')
      .addGroupBy('uc.major_field_code')
      .addGroupBy('uc.mid_field')
      .addGroupBy('uc.mid_field_code')
      .addGroupBy('uc.minor_field')
      .addGroupBy('uc.minor_field_code');

    if (midFieldCode !== undefined) {
      queryBuilder.where('uc.mid_field_code = :midFieldCode', { midFieldCode });
    }

    queryBuilder.orderBy('uc.major_field_code', 'ASC');
    queryBuilder.addOrderBy('uc.mid_field_code', 'ASC');
    queryBuilder.addOrderBy('uc.minor_field_code', 'ASC');

    const result = await queryBuilder.getRawMany();

    return result.map((item) => ({
      majorField: item.majorField,
      majorFieldCode: parseInt(item.majorFieldCode),
      midField: item.midField,
      midFieldCode: parseInt(item.midFieldCode),
      minorField: item.minorField,
      minorFieldCode: parseInt(item.minorFieldCode),
      count: parseInt(item.count),
    }));
  }

  /**
   * 대계열 목록 조회
   */
  async getMajorFields() {
    const result = await this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('uc.major_field', 'majorField')
      .addSelect('uc.major_field_code', 'majorFieldCode')
      .distinct(true)
      .orderBy('uc.major_field_code', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      majorField: item.majorField,
      majorFieldCode: parseInt(item.majorFieldCode),
    }));
  }

  /**
   * 중계열 목록 조회
   */
  async getMidFields(majorFieldCode?: number) {
    const queryBuilder = this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('uc.mid_field', 'midField')
      .addSelect('uc.mid_field_code', 'midFieldCode')
      .addSelect('uc.major_field', 'majorField')
      .addSelect('uc.major_field_code', 'majorFieldCode')
      .distinct(true);

    if (majorFieldCode !== undefined) {
      queryBuilder.where('uc.major_field_code = :majorFieldCode', { majorFieldCode });
    }

    queryBuilder.orderBy('uc.mid_field_code', 'ASC');

    const result = await queryBuilder.getRawMany();

    return result.map((item) => ({
      midField: item.midField,
      midFieldCode: parseInt(item.midFieldCode),
      majorField: item.majorField,
      majorFieldCode: parseInt(item.majorFieldCode),
    }));
  }

  /**
   * 소계열 목록 조회
   */
  async getMinorFields(midFieldCode?: number) {
    const queryBuilder = this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('uc.minor_field', 'minorField')
      .addSelect('uc.minor_field_code', 'minorFieldCode')
      .addSelect('uc.mid_field', 'midField')
      .addSelect('uc.mid_field_code', 'midFieldCode')
      .distinct(true);

    if (midFieldCode !== undefined) {
      queryBuilder.where('uc.mid_field_code = :midFieldCode', { midFieldCode });
    }

    queryBuilder.orderBy('uc.minor_field_code', 'ASC');

    const result = await queryBuilder.getRawMany();

    return result.map((item) => ({
      minorField: item.minorField,
      minorFieldCode: parseInt(item.minorFieldCode),
      midField: item.midField,
      midFieldCode: parseInt(item.midFieldCode),
    }));
  }

  /**
   * 통계 조회
   */
  async getStatistics() {
    const totalCount = await this.unitCategoryRepository.count();

    const majorFieldCount = await this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('COUNT(DISTINCT uc.major_field_code)', 'count')
      .getRawOne();

    const midFieldCount = await this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('COUNT(DISTINCT uc.mid_field_code)', 'count')
      .getRawOne();

    const minorFieldCount = await this.unitCategoryRepository
      .createQueryBuilder('uc')
      .select('COUNT(DISTINCT uc.minor_field_code)', 'count')
      .getRawOne();

    return {
      totalUnits: totalCount,
      totalMajorFields: parseInt(majorFieldCount.count),
      totalMidFields: parseInt(midFieldCount.count),
      totalMinorFields: parseInt(minorFieldCount.count),
    };
  }
}
