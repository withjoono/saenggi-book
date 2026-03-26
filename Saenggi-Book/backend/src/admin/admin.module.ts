import { Module } from '@nestjs/common';
import { NonsulModule } from 'src/modules/nonsul/nonsul.module';
import { SusiModule } from 'src/modules/susi/susi.module';
import { CommonModule } from 'src/common/common.module';
import { MembersModule } from 'src/modules/members/members.module';
import { AdminSusiSubjectService } from './services/admin-susi-subject.service';
import { AdminSusiSubjectController } from './controllers/admin-susi-subject.controller';
import { AdminNonsulController } from './controllers/admin-nonsul.controller';
import { AdminNonsulService } from './services/admin-nonsul.service';
import { AdminSusiComprehensiveController } from './controllers/admin-susi-comprehensive.controller';
import { AdminSusiComprehensiveService } from './services/admin-susi-comprehensive.service';
import { AdminSusiPassRecordController } from './controllers/admin-susi-pass-record.controller';
import { AdminSusiPassRecordService } from './services/admin-susi-pass-record.service';
import { AdminStatisticController } from './controllers/admin-statistic.controller';
import { AdminStatisticService } from './services/admin-statistic.service';

import { AdminPaymentController } from './controllers/admin-pay.controller';
import { AdminPaymentService } from './services/admin-pay.service';
import { AdminMemberController } from './controllers/admin-member.controller';
import { AdminMemberService } from './services/admin-member.service';
import { AdminProductManagementController } from './controllers/admin-product-management.controller';
import { AdminProductManagementService } from './services/admin-product-management.service';
import { AdminSusiFormulaController } from './controllers/admin-susi-formula.controller';
import { AdminSusiFormulaService } from './services/admin-susi-formula.service';

@Module({
  imports: [
    CommonModule,
    MembersModule,
    NonsulModule,
    SusiModule,
  ],
  controllers: [
    AdminNonsulController,
    AdminSusiComprehensiveController,
    AdminSusiSubjectController,
    AdminSusiPassRecordController,
    AdminStatisticController,

    AdminPaymentController,
    AdminMemberController,
    AdminProductManagementController,
    AdminSusiFormulaController,
  ],
  providers: [
    AdminNonsulService,
    AdminSusiComprehensiveService,
    AdminSusiSubjectService,
    AdminSusiPassRecordService,
    AdminStatisticService,

    AdminPaymentService,
    AdminMemberService,
    AdminProductManagementService,
    AdminSusiFormulaService,
  ],
})
export class AdminModule {}
