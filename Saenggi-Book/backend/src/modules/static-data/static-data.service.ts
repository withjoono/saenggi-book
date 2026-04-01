// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { StaticDataDto } from './static-data.dto';

@Injectable()
export class StaticDataService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) { }

  async getStaticData(): Promise<StaticDataDto> {
    console.log('[StaticDataService] Fetching data from Susi-Backend...');
    try {
      const resp = await fetch('https://susi-backend-dot-ts-back-nest-479305.du.r.appspot.com/static-data');
      if (!resp.ok) {
         throw new Error('Susi-Backend returned ' + resp.status);
      }
      const staticData: StaticDataDto = await resp.json();

      await this.cacheManager.set('staticData', staticData, 3600000);
      return staticData;
    } catch (e) {
      console.error('[StaticDataService] Error fetching data:', e);
      throw e;
    }
  }



  async refreshStaticData(): Promise<void> {
    await this.cacheManager.del('staticData');
    await this.getStaticData();
  }
}
