// @ts-nocheck
import { Module } from '@nestjs/common';
import { SusiCalculationController } from './susi-calculation.controller';
import { SusiCalculationService } from './services/susi-calculation.service';
import { SusiFormulaDataService } from './services/susi-formula-data.service';
import { SusiGradeCalculationService } from './services/susi-grade-calculation.service';
import { SchoolRecordSubjectLearningEntity } from '../../../database/entities/schoolrecord/schoolrecord-subject-learning.entity';
import { SusiCalculationFormulaEntity } from '../../../database/entities/susi/susi-calculation-formula.entity';
import { SusiUserCalculatedScoreEntity } from '../../../database/entities/susi/susi-user-calculated-score.entity';
import { SusiUserRecruitmentScoreEntity } from '../../../database/entities/susi/susi-user-recruitment-score.entity';
import { SuSiSubjectEntity } from '../../../database/entities/susi/susi-subject.entity';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    CommonModule,
  ],
  controllers: [SusiCalculationController],
  providers: [
    SusiCalculationService,
    SusiFormulaDataService,
    SusiGradeCalculationService,
  ],
  exports: [
    SusiCalculationService,
    SusiFormulaDataService,
    SusiGradeCalculationService,
  ],
})
export class SusiCalculationModule {}
