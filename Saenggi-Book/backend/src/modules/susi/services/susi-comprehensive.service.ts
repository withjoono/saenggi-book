// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { SusiComprehensiveStep1ResponseDto } from '../dtos/susi-comprehensive-step-1.dto';
import { SusiComprehensiveStep2ResponseDto } from '../dtos/susi-comprehensive-step-2.dto';
import { SusiComprehensiveStep3ResponseDto } from '../dtos/susi-comprehensive-step-3.dto';
import { SusiComprehensiveStep4ResponseDto } from '../dtos/susi-comprehensive-step-4.dto';

@Injectable()
export class SusiComprehensiveService {
  constructor(  ) {}

  // 수시 교과 목록 전체 조회 (admin)
  async getAllSusiComprehensive(commonSearchQueryDto: CommonSearchQueryDto) {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.susiComprehensiveRepository,
    );

    const queryBuilder = this.susiComprehensiveRepository.createQueryBuilder('A');

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
    await this.susiComprehensiveRepository.clear();
  }

  // 수시 교과 데이터 삽입
  async insertSusiComprehensive(newRecords: SusiComprehensiveEntity[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 새로운 데이터 삽입
      await queryRunner.manager.save(SusiComprehensiveEntity, newRecords);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 수시 학종 Step 1 (기본유형, 대계열, 중계열, 소계열로 학종 데이터 조회)
  async getSusiComprehensiveStep_1({
    // year,
    basic_type,
    large_department,
    medium_department,
    small_department,
  }: {
    year: number;
    basic_type: string;
    large_department: string;
    medium_department: string;
    small_department: string;
  }): Promise<SusiComprehensiveStep1ResponseDto[]> {
    const data = await this.susiComprehensiveRepository.find({
      where: {
        // year: year, // 2024/2025 둘다 보여주기 위해 임시 비활성화
        basic_type: basic_type,
        large_department,
        medium_department,
        small_department,
      },
      select: {
        id: true,
        basic_type: true,
        type_name: true,
        university_name: true,
        recruitment_unit_name: true,
        detailed_type: true,
        region: true,
        department: true,
        cut_50: true,
        cut_70: true,

        risk_level_plus5: true, // '등급컷위험도(+)5'
        risk_level_plus4: true, // '위험도(+)4'
        risk_level_plus3: true, // '위험도(+)3'
        risk_level_plus2: true, // '위험도(+)2'
        risk_level_plus1: true, // '위험도(+)1'
        risk_level_minus1: true, // '위험도(-1)'
        risk_level_minus2: true, // '위험도(-2)'
        risk_level_minus3: true, // '위험도(-3)'
        risk_level_minus4: true, // '위험도(-4)'
        risk_level_minus5: true, // '위험도(-5)'
      },
    });
    return data as SusiComprehensiveStep1ResponseDto[];
  }

  // 수시 학종 Step 2 (ids로 3개평가 비중 조회)
  async getSusiComprehensiveStep_2({
    ids,
  }: {
    ids: number[];
  }): Promise<SusiComprehensiveStep2ResponseDto[]> {
    const data = await this.susiComprehensiveRepository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        type_name: true,
        university_name: true,
        university_code: true,
        recruitment_unit_name: true,
        department: true,

        evaluation_ratios: true, // 3개평가 비중(30:20:50)
        evaluation_code: true, //3개평가 코드
      },
    });

    return data as SusiComprehensiveStep2ResponseDto[];
  }

  // 수시 학종 Step 3 (ids로 최저등급 조회)
  async getSusiComprehensiveStep_3({
    ids,
  }: {
    ids: number[];
  }): Promise<SusiComprehensiveStep3ResponseDto[]> {
    const data = await this.susiComprehensiveRepository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        type_name: true,
        university_name: true,
        university_code: true,
        recruitment_unit_name: true,
        department: true,

        minimum_academic_standards_applied: true,
        minimum_academic_standards_text: true,
        minimum_korean: true,
        minimum_math: true,
        minimum_math_science_engineering: true,
        minimum_english: true,
        minimum_social_studies: true,
        minimum_science_studies: true,
        minimum_calculation_studies: true,
        minimum_count: true,
        minimum_sum: true,
        minimum_korean_history: true,
        minimum_others: true,
        minimum_others_details: true,
      },
    });

    return data as SusiComprehensiveStep3ResponseDto[];
  }

  // 수시 학종 Step 4 (ids로 전형일자 조회)
  async getSusiComprehensiveStep_4({
    ids,
  }: {
    ids: number[];
  }): Promise<SusiComprehensiveStep4ResponseDto[]> {
    const data = await this.susiComprehensiveRepository.find({
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

    return data as SusiComprehensiveStep4ResponseDto[];
  }

  // 수시 학종 상세페이지 데이터 조회
  async getSusiComprehensiveDetail(id: number) {
    const data = await this.susiComprehensiveRepository.findOne({
      where: {
        id,
      },
    });

    return data;
  }

  // 수시 교과 합불사례 데이터 조회
  async getSusiSubjectPassRecords(id: number) {
    const susiSubject = await this.susiComprehensiveRepository.findOne({
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
}
