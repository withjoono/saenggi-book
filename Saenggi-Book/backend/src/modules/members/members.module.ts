import { Module } from '@nestjs/common';
import { MembersService } from './services/members.service';
import { MembersController } from './controllers/members.controller';
import { MemberInterestsController } from './controllers/member-interests.controller';
import { MemberInterestsService } from './services/member-interests.service';
import { MemberSchoolRecordController } from './controllers/member-schoolrecord.controller';
import { SchoolRecordModule } from '../schoolrecord/schoolrecord.module';
import { BcryptModule } from 'src/common/bcrypt/bcrypt.module';
import { MemberRecruitmentUnitCombinationService } from './services/member-combination.service';
import { MemberCombinationController } from './controllers/member-combination.controller';
import { MemberRegularInterestsService } from './services/member-regular-interests.service';
import { MemberRegularInterestsController } from './controllers/memeber-regular-interests.controller';
import { MemberRegularCombinationService } from './services/member-regular-combination.service';
import { MemberRegularCombinationController } from './controllers/member-regular-combination.controller';

@Module({
  imports: [
    SchoolRecordModule,
    BcryptModule,
  ],
  providers: [
    MembersService,
    MemberInterestsService,
    MemberRecruitmentUnitCombinationService,
    MemberRegularInterestsService,
    MemberRegularCombinationService,
  ],
  controllers: [
    MembersController,
    MemberInterestsController,
    MemberSchoolRecordController,
    MemberCombinationController,
    MemberRegularInterestsController,
    MemberRegularCombinationController,
  ],
  exports: [MembersService, MemberInterestsService],
})
export class MembersModule {}
