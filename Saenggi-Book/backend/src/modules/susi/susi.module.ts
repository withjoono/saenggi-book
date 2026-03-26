import { Module } from '@nestjs/common';
import { SusiSubjectService } from './services/susi-subject.service';
import { SusiSubjectController } from './controllers/susi-subject.controller';
import { SusiComprehensiveService } from './services/susi-comprehensive.service';
import { SusiComprehensiveController } from './controllers/susi-comprehensive.controller';
import { SusiKyokwaController } from './controllers/susi-kyokwa.controller';
import { SusiKyokwaService } from './services/susi-kyokwa.service';
import { SusiRecruitmentUnitController } from './controllers/susi-recruitment-unit.controller';
import { SusiRecruitmentUnitService } from './services/susi-recruitment-unit.service';
import { SusiUnitCategoryController } from './controllers/susi-unit-category.controller';
import { SusiUnitCategoryService } from './services/susi-unit-category.service';
import { SusiCalculationModule } from './calculation/susi-calculation.module';

// 2027학년도 새 Service/Controller
import { SusiKyokwa2027Service } from './services/susi-kyokwa-2027.service';
import { SusiKyokwa2027Controller } from './controllers/susi-kyokwa-2027.controller';
import { SusiJonghap2027Service } from './services/susi-jonghap-2027.service';
import { SusiJonghap2027Controller } from './controllers/susi-jonghap-2027.controller';

// 계열 적합성 진단
import { SeriesEvaluationController } from './controllers/series-evaluation.controller';
import { SeriesEvaluationService } from './services/series-evaluation.service';

@Module({
  imports: [
    SusiCalculationModule, // 수시 교과전형 환산점수 계산 모듈
  ],
  controllers: [
    SusiSubjectController,
    SusiComprehensiveController,
    SusiKyokwaController,
    SusiRecruitmentUnitController,
    SusiUnitCategoryController,

    // 2027학년도 새 API
    SusiKyokwa2027Controller,
    SusiJonghap2027Controller,

    // 계열 적합성 진단 API
    SeriesEvaluationController,
  ],
  providers: [
    SusiSubjectService,
    SusiComprehensiveService,
    SusiKyokwaService,
    SusiRecruitmentUnitService,
    SusiUnitCategoryService,

    // 2027학년도 새 서비스
    SusiKyokwa2027Service,
    SusiJonghap2027Service,

    // 계열 적합성 진단 서비스
    SeriesEvaluationService,
  ],
  exports: [
    SusiSubjectService,
    SusiComprehensiveService,
    SusiKyokwaService,
    SusiRecruitmentUnitService,
    SusiUnitCategoryService,
    SusiCalculationModule,

    // 2027학년도 새 서비스
    SusiKyokwa2027Service,
    SusiJonghap2027Service,
  ],
})
export class SusiModule {}
