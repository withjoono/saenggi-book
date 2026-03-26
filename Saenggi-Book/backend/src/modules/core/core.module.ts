// @ts-nocheck
import { Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module';
import { SmsModule } from '../sms/sms.module';
import { CoreUniversityController } from './controllers/core-university.controller';
import { CoreUniversityService } from './services/core-university.service';
import { CoreAdmissionSubtypeController } from './controllers/core-admission-subtype.controller';
import { CoreAdmissionSubtypeService } from './services/core-admission-subtype.service';
import { CoreAdmissionCategoryService } from './services/core-admission-category.service';
import { CoreAdmissionCategoryController } from './controllers/core-admission-category.controller';
import { CoreFieldsController } from './controllers/core-fields.controller';
import { CoreFieldsService } from './services/core-fields.service';
import { CoreAdmissionService } from './services/core-admission.service';
import { CoreAdmissionController } from './controllers/core-admission.controller';
import { CoreRecruitmentUnitService } from './services/core-recruitment.service';
import { CoreRecruitmentController } from './controllers/core-recruitment.controller';
import { CoreRegularAdmissionService } from './services/core-regular-admission.service';
import { CoreRegularAdmissionController } from './controllers/core-regular-admission.controller';

@Module({
  imports: [
    MembersModule,
    SmsModule,
  ],
  providers: [
    CoreUniversityService,
    CoreAdmissionService,
    CoreAdmissionSubtypeService,
    CoreAdmissionCategoryService,
    CoreFieldsService,
    CoreRecruitmentUnitService,
    CoreRegularAdmissionService,
  ],
  controllers: [
    CoreUniversityController,
    CoreAdmissionController,
    CoreAdmissionSubtypeController,
    CoreAdmissionCategoryController,
    CoreFieldsController,
    CoreRecruitmentController,
    CoreRegularAdmissionController,
  ],
  exports: [],
})
export class CoreModule {}
