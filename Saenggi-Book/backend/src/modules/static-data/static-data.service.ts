// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { StaticDataDto } from './static-data.dto';

@Injectable()
export class StaticDataService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,  ) { }

  async getStaticData(): Promise<StaticDataDto> {
    // Temporarily disable cache to get fresh data from database
    // const cachedData = await this.cacheManager.get<StaticDataDto>('staticData');
    // if (cachedData) {
    //   console.log('[StaticDataService] Returning cached data');
    //   return cachedData;
    // }

    console.log('[StaticDataService] Fetching data from database...');
    const [
      subjectCodes,
      generalFields,
      majorFields,
      midFields,
      minorFields,
      admissionSubtypes,
      admissionSubtypeCategories,
      universities,
      admissions,
      recruitmentUnits,
    ] = await Promise.all([
      this.subjectCodeRepository.find(),
      this.generalFieldRepository.find(),
      this.majorFieldRepository.find(),
      this.midFieldRepository.find(),
      this.minorFieldRepository.find(),
      this.admissionSubtypeRepository.find(),
      this.admissionSubtypeCategoryRepository.find({ order: { displayOrder: 'ASC' } }),
      this.universityRepository.find(),
      this.admissionRepository.find(),
      this.recruitmentUnitRepository.find(),
    ]);

    console.log(`[StaticDataService] generalFields count: ${generalFields.length}`);

    const staticData: StaticDataDto = {
      subjectCodes,
      generalFields,
      majorFields,
      midFields,
      minorFields,
      admissionSubtypes,
      admissionSubtypeCategories,
      universityNames: [...new Set(universities.map((u) => u.name))],
      admissionNames: [...new Set(admissions.map((a) => a.name))],
      recruitmentUnitNames: [...new Set(recruitmentUnits.map((r) => r.name))],
    };

    // 캐시에 데이터 저장 (1시간 동안 유효)
    await this.cacheManager.set('staticData', staticData, 3600000);

    return staticData;
  }



  async refreshStaticData(): Promise<void> {
    await this.cacheManager.del('staticData');
    await this.getStaticData();
  }
}
