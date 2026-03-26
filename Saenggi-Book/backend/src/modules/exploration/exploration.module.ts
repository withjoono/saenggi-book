import { Module } from '@nestjs/common';
import { ExploreSusiController } from './controllers/explore-susi.controller';
import { ExploreSusiKyokwaService } from './services/explore-susi-kyokwa.service';
import { ExploreSusiJonghapService } from './services/explore-susi-jonghap.service';
import { ExploreSearchController } from './controllers/explore-search.controller';
import { ExploreSearchService } from './services/explore-search.service';
import { ExploreRegularService } from './services/explore-regular-admission.service';
import { ExploreRegularController } from './controllers/explore-regular-admission.controller';
@Module({
  imports: [
  ],
  controllers: [ExploreSusiController, ExploreSearchController, ExploreRegularController],
  providers: [
    ExploreSusiKyokwaService,
    ExploreSusiJonghapService,
    ExploreSearchService,
    ExploreRegularService,
  ],
})
export class ExplorationModule {}
