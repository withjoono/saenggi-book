// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * 과목 이름 → 과목 코드 매핑
 * 기존 프론트엔드 호환성을 위한 매핑 테이블
 */
const SUBJECT_NAME_TO_CODE: { [key: string]: string } = {
  // 탐구 과목 (inquiry)
  수학_확률과통계: 'HHS17',
  수학_미적: 'HHS24',
  수학_기하: 'HHS20',
  물리학1: 'HHS104',
  물리학2: 'HHS105',
  생명과학1: 'HHS84',
  생명과학2: 'HHS85',
  화학1: 'HHS86',
  화학2: 'HHS87',
  지구과학1: 'HHS88',
  지구과학2: 'HHS89',
  한국지리: 'HHS90',
  세계지리: 'HHS91',
};

/**
 * 주요 교과 이름 → 코드 매핑
 */
const MAIN_SUBJECT_NAME_TO_CODE: { [key: string]: string } = {
  국어: 'HH1',
  수학: 'HH2',
  영어: 'HH3',
  사회: 'HH4',
  과학: 'HH5',
  한국사: 'HH6',
  제2외: 'HH7',
};

export interface ICompatibilityData {
  id: string;
  categoryId: string;
  majorField: string;
  majorFieldCode: number;
  midField: string;
  midFieldCode: number;
  minorField: string;
  minorFieldCode: number;
  requiredSubjects: string[];
  encouragedSubjects: string[];
  mainSubjects: string[];
  referenceSubjects: string[];
}

@Injectable()
export class SusiCategorySubjectNecessityService {
  constructor(    private readonly repository: Repository<SusiCategorySubjectNecessityEntity>,
  ) {}

  /**
   * 모든 계열별 필수/권장 과목 데이터 조회
   * 프론트엔드 호환 형식으로 변환하여 반환
   */
  async getAllCompatibilityData(): Promise<ICompatibilityData[]> {
    const records = await this.repository.find({
      order: {
        majorFieldCode: 'ASC',
        midFieldCode: 'ASC',
        minorFieldCode: 'ASC',
      },
    });

    // categoryId별로 그룹화
    const groupedData = new Map<string, SusiCategorySubjectNecessityEntity[]>();

    for (const record of records) {
      const existing = groupedData.get(record.categoryId) || [];
      existing.push(record);
      groupedData.set(record.categoryId, existing);
    }

    // 프론트엔드 호환 형식으로 변환
    const result: ICompatibilityData[] = [];

    for (const [categoryId, items] of groupedData.entries()) {
      const firstItem = items[0];

      const requiredSubjects: string[] = [];
      const encouragedSubjects: string[] = [];
      const mainSubjects: string[] = [];

      for (const item of items) {
        const code = this.getSubjectCode(item.subjectName, item.subjectType);
        if (!code) continue;

        if (item.subjectType === 'inquiry') {
          if (item.necessityLevel === 1) {
            requiredSubjects.push(code);
          } else if (item.necessityLevel === 2) {
            encouragedSubjects.push(code);
          }
        } else if (item.subjectType === 'major') {
          if (item.necessityLevel === 1 || item.necessityLevel === 2) {
            mainSubjects.push(code);
          }
        }
      }

      result.push({
        id: categoryId,
        categoryId,
        majorField: firstItem.majorField,
        majorFieldCode: firstItem.majorFieldCode,
        midField: firstItem.midField,
        midFieldCode: firstItem.midFieldCode,
        minorField: firstItem.minorField,
        minorFieldCode: firstItem.minorFieldCode,
        requiredSubjects,
        encouragedSubjects,
        mainSubjects,
        referenceSubjects: [], // 새 데이터에는 참조 과목이 없음
      });
    }

    return result;
  }

  /**
   * 특정 계열의 필수/권장 과목 데이터 조회
   */
  async getCompatibilityByCategoryId(
    categoryId: string,
  ): Promise<ICompatibilityData> {
    const records = await this.repository.find({
      where: { categoryId },
    });

    if (records.length === 0) {
      throw new NotFoundException(
        `계열 ID ${categoryId}에 대한 데이터를 찾을 수 없습니다.`,
      );
    }

    const firstItem = records[0];
    const requiredSubjects: string[] = [];
    const encouragedSubjects: string[] = [];
    const mainSubjects: string[] = [];

    for (const item of records) {
      const code = this.getSubjectCode(item.subjectName, item.subjectType);
      if (!code) continue;

      if (item.subjectType === 'inquiry') {
        if (item.necessityLevel === 1) {
          requiredSubjects.push(code);
        } else if (item.necessityLevel === 2) {
          encouragedSubjects.push(code);
        }
      } else if (item.subjectType === 'major') {
        if (item.necessityLevel === 1 || item.necessityLevel === 2) {
          mainSubjects.push(code);
        }
      }
    }

    return {
      id: categoryId,
      categoryId,
      majorField: firstItem.majorField,
      majorFieldCode: firstItem.majorFieldCode,
      midField: firstItem.midField,
      midFieldCode: firstItem.midFieldCode,
      minorField: firstItem.minorField,
      minorFieldCode: firstItem.minorFieldCode,
      requiredSubjects,
      encouragedSubjects,
      mainSubjects,
      referenceSubjects: [],
    };
  }

  /**
   * 대계열로 필터링된 계열적합성 데이터 조회
   */
  async getCompatibilityByMajorField(
    majorFieldCode: number,
  ): Promise<ICompatibilityData[]> {
    const all = await this.getAllCompatibilityData();
    return all.filter((item) => item.majorFieldCode === majorFieldCode);
  }

  /**
   * 중계열로 필터링된 계열적합성 데이터 조회
   */
  async getCompatibilityByMidField(
    midFieldCode: number,
  ): Promise<ICompatibilityData[]> {
    const all = await this.getAllCompatibilityData();
    return all.filter((item) => item.midFieldCode === midFieldCode);
  }

  /**
   * 대/중/소계열 이름으로 계열적합성 데이터 조회
   * 기존 프론트엔드의 findCompatibilityBySeries 함수와 호환
   */
  async getCompatibilityBySeries(
    majorField: string,
    midField: string,
    minorField: string,
  ): Promise<ICompatibilityData | null> {
    const normalizeString = (str: string) => str.replace(/[.・ㆍ]/g, '');

    const all = await this.getAllCompatibilityData();
    return (
      all.find(
        (item) =>
          normalizeString(item.majorField) === normalizeString(majorField) &&
          normalizeString(item.midField) === normalizeString(midField) &&
          normalizeString(item.minorField) === normalizeString(minorField),
      ) || null
    );
  }

  /**
   * 통계 조회
   */
  async getStatistics() {
    const totalCount = await this.repository.count();

    const categoryCount = await this.repository
      .createQueryBuilder('csn')
      .select('COUNT(DISTINCT csn.category_id)', 'count')
      .getRawOne();

    const subjectCount = await this.repository
      .createQueryBuilder('csn')
      .select('COUNT(DISTINCT csn.subject_name)', 'count')
      .getRawOne();

    const byNecessityLevel = await this.repository
      .createQueryBuilder('csn')
      .select('csn.necessity_level', 'necessityLevel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('csn.necessity_level')
      .getRawMany();

    const bySubjectType = await this.repository
      .createQueryBuilder('csn')
      .select('csn.subject_type', 'subjectType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('csn.subject_type')
      .getRawMany();

    return {
      totalRecords: totalCount,
      totalCategories: parseInt(categoryCount.count),
      totalSubjects: parseInt(subjectCount.count),
      byNecessityLevel: byNecessityLevel.map((item) => ({
        necessityLevel: item.necessityLevel,
        label: item.necessityLevel === 1 ? '필수' : '권장',
        count: parseInt(item.count),
      })),
      bySubjectType: bySubjectType.map((item) => ({
        subjectType: item.subjectType,
        label: item.subjectType === 'inquiry' ? '탐구과목' : '주요교과',
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 원본 데이터 조회 (매핑 없이)
   */
  async getRawData(): Promise<SusiCategorySubjectNecessityEntity[]> {
    return this.repository.find({
      order: {
        majorFieldCode: 'ASC',
        midFieldCode: 'ASC',
        minorFieldCode: 'ASC',
        subjectName: 'ASC',
      },
    });
  }

  /**
   * 과목 이름을 과목 코드로 변환
   */
  private getSubjectCode(
    subjectName: string,
    subjectType: 'inquiry' | 'major',
  ): string | null {
    if (subjectType === 'inquiry') {
      return SUBJECT_NAME_TO_CODE[subjectName] || null;
    } else {
      return MAIN_SUBJECT_NAME_TO_CODE[subjectName] || null;
    }
  }
}
