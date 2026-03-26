// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class ExploreRegularService {
  // 프론트엔드 요청값 → DB 저장값 매핑
  private readonly ADMISSION_TYPE_MAP: Record<string, string> = {
    ga: '가',
    na: '나',
    da: '다',
    gunoe: '군외',
  };

  // 유효한 admission_type 목록 (가, 나, 다, 군외)
  private readonly VALID_ADMISSION_TYPES = ['가', '나', '다', '군외'];

  constructor(    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 프론트엔드 admission_type을 DB 값으로 변환
   * ga → 가, na → 나, da → 다, gunoe → 군외
   */
  private mapAdmissionType(admissionType: string): string {
    if (!admissionType) return null;

    // 이미 한글인 경우 그대로 반환
    if (this.VALID_ADMISSION_TYPES.includes(admissionType)) {
      return admissionType;
    }

    // 영문 코드인 경우 매핑
    return this.ADMISSION_TYPE_MAP[admissionType.toLowerCase()] || admissionType;
  }

  async getAdmissions(year: string, admissionType: string) {
    // admission_type 매핑
    const mappedType = this.mapAdmissionType(admissionType);

    // 기본값 설정
    const queryYear = year || '2026';

    const cacheKey = `explore-jungsi-admission:university:${queryYear}-${mappedType || 'all'}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const queryBuilder = this.regularAdmissionRepository
      .createQueryBuilder('regularAdmission')
      .leftJoinAndSelect('regularAdmission.university', 'university')
      .where('regularAdmission.year = :year', { year: queryYear });

    // admission_type이 있으면 필터 적용
    if (mappedType) {
      queryBuilder.andWhere('regularAdmission.admission_type = :admissionType', {
        admissionType: mappedType,
      });
    }

    const regularAdmissions = await queryBuilder.getMany();

    await this.cacheManager.set(cacheKey, { items: regularAdmissions }, 120 * 60 * 1000); // 120분 캐시

    return { items: regularAdmissions };
  }

  async getAdmission(regularId: number) {
    const admission = await this.regularAdmissionRepository.findOne({
      where: {
        id: regularId,
      },
      relations: ['university', 'previous_results'],
    });

    if (!admission) {
      return null;
    }

    // Transform previous_results to match frontend expected field names
    const transformedPreviousResults = admission.previous_results?.map((result) => ({
      id: result.id,
      year: result.year,
      // 기존 필드 유지
      recruitment_number: result.recruitment_number,
      competition_ratio: result.competition_ratio,
      min_cut: result.min_cut,
      max_cut: result.max_cut,
      percent: result.percent,
      // 신규 필드 추가 (프론트엔드 요구사항)
      additional_acceptance_rank: result.additional_pass_rank,
      converted_score_total: result.converted_score_total,
      converted_score_50_cut: result.min_cut, // min_cut과 동일 (50%컷)
      converted_score_70_cut: result.max_cut, // max_cut과 동일 (70%컷)
      percentile_50_cut: result.percentile_50,
      percentile_70_cut: result.percentile_70,
    }));

    // Convert entity to plain object to avoid serialization issues
    const plainAdmission = JSON.parse(JSON.stringify(admission));

    return {
      ...plainAdmission,
      previous_results: transformedPreviousResults,
    };
  }
}
