// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * 2015 개정 교육과정 교과/과목 코드 서비스
 */
@Injectable()
export class SusiSubjectCodeService {
  constructor(    private readonly repository: Repository<SusiSubjectCodeEntity>,
  ) {}

  /**
   * 전체 교과/과목 코드 조회
   */
  async findAll(): Promise<SusiSubjectCodeEntity[]> {
    return this.repository.find({
      order: {
        mainSubjectCode: 'ASC',
        courseTypeCode: 'ASC',
        subjectCode: 'ASC',
      },
    });
  }

  /**
   * ID로 과목 조회
   */
  async findById(id: string): Promise<SusiSubjectCodeEntity> {
    const subject = await this.repository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`과목 ID ${id}를 찾을 수 없습니다.`);
    }

    return subject;
  }

  /**
   * 주요교과 코드로 과목 목록 조회
   */
  async findByMainSubjectCode(
    mainSubjectCode: string,
  ): Promise<SusiSubjectCodeEntity[]> {
    return this.repository.find({
      where: { mainSubjectCode },
      order: {
        courseTypeCode: 'ASC',
        subjectCode: 'ASC',
      },
    });
  }

  /**
   * 과목 종류 코드로 과목 목록 조회
   */
  async findByCourseTypeCode(
    courseTypeCode: number,
  ): Promise<SusiSubjectCodeEntity[]> {
    return this.repository.find({
      where: { courseTypeCode },
      order: {
        mainSubjectCode: 'ASC',
        subjectCode: 'ASC',
      },
    });
  }

  /**
   * 과목명으로 검색
   */
  async searchBySubjectName(keyword: string): Promise<SusiSubjectCodeEntity[]> {
    return this.repository.find({
      where: { subjectName: Like(`%${keyword}%`) },
      order: {
        mainSubjectCode: 'ASC',
        courseTypeCode: 'ASC',
      },
    });
  }

  /**
   * 주요교과 목록 조회 (고유값)
   */
  async getMainSubjects(): Promise<
    { mainSubjectCode: string; mainSubjectName: string; count: number }[]
  > {
    const result = await this.repository
      .createQueryBuilder('sc')
      .select('sc.main_subject_code', 'mainSubjectCode')
      .addSelect('sc.main_subject_name', 'mainSubjectName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sc.main_subject_code')
      .addGroupBy('sc.main_subject_name')
      .orderBy('sc.main_subject_code', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      mainSubjectCode: item.mainSubjectCode,
      mainSubjectName: item.mainSubjectName,
      count: parseInt(item.count),
    }));
  }

  /**
   * 과목 종류 목록 조회 (고유값)
   */
  async getCourseTypes(): Promise<
    { courseTypeCode: number; courseTypeName: string; count: number }[]
  > {
    const result = await this.repository
      .createQueryBuilder('sc')
      .select('sc.course_type_code', 'courseTypeCode')
      .addSelect('sc.course_type_name', 'courseTypeName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sc.course_type_code')
      .addGroupBy('sc.course_type_name')
      .orderBy('sc.course_type_code', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      courseTypeCode: parseInt(item.courseTypeCode),
      courseTypeName: item.courseTypeName,
      count: parseInt(item.count),
    }));
  }

  /**
   * 통계 조회
   */
  async getStatistics() {
    const totalCount = await this.repository.count();
    const mainSubjects = await this.getMainSubjects();
    const courseTypes = await this.getCourseTypes();

    const evaluationTypes = await this.repository
      .createQueryBuilder('sc')
      .select('sc.evaluation_type', 'evaluationType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sc.evaluation_type')
      .getRawMany();

    return {
      totalSubjects: totalCount,
      mainSubjectCount: mainSubjects.length,
      courseTypeCount: courseTypes.length,
      mainSubjects,
      courseTypes,
      evaluationTypes: evaluationTypes.map((item) => ({
        evaluationType: item.evaluationType,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 과목 코드로 과목 정보 조회 (프론트엔드 호환용)
   * 예: HHS17, HHS24, HH1, HH2 등
   */
  async findByCode(code: string): Promise<SusiSubjectCodeEntity | null> {
    // 코드 형식 분석: HHS17 -> mainSubjectCode: HH, subjectCode 조합
    // 실제 데이터: id = HH0111 (교과코드+종류코드+과목코드)

    // 먼저 ID로 직접 검색
    const byId = await this.repository.findOne({
      where: { id: code },
    });
    if (byId) return byId;

    // 과목 코드 패턴 분석 (HH로 시작하는 경우)
    if (code.startsWith('HH')) {
      const mainCode = code.substring(0, 4); // HH01
      const subCode = code.substring(4); // 11

      if (subCode) {
        const found = await this.repository.findOne({
          where: {
            mainSubjectCode: mainCode,
            subjectCode: parseInt(subCode),
          },
        });
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * 여러 과목 코드로 과목 정보 일괄 조회
   */
  async findByCodes(
    codes: string[],
  ): Promise<{ [code: string]: SusiSubjectCodeEntity | null }> {
    const result: { [code: string]: SusiSubjectCodeEntity | null } = {};

    for (const code of codes) {
      result[code] = await this.findByCode(code);
    }

    return result;
  }

  /**
   * 과목명으로 과목 코드 조회
   */
  async findCodeBySubjectName(subjectName: string): Promise<string | null> {
    const subject = await this.repository.findOne({
      where: { subjectName },
    });

    return subject ? subject.id : null;
  }

  /**
   * 주요교과 + 과목 종류로 과목 목록 조회
   */
  async findByMainSubjectAndCourseType(
    mainSubjectCode: string,
    courseTypeCode: number,
  ): Promise<SusiSubjectCodeEntity[]> {
    return this.repository.find({
      where: { mainSubjectCode, courseTypeCode },
      order: { subjectCode: 'ASC' },
    });
  }
}
