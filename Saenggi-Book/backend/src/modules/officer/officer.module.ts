import { Module } from '@nestjs/common';
import { OfficerEvaluationService } from './services/officer-evaluation.service';
import { OfficerEvaluationController } from './controllers/officer-evaluation.controller';
import { MembersModule } from '../members/members.module';
import { SmsModule } from '../sms/sms.module';
import { OfficerService } from './services/officer.service';
import { OfficerController } from './controllers/officer.controller';

@Module({
  imports: [
    MembersModule,
    SmsModule,
  ],
  providers: [OfficerEvaluationService, OfficerService],
  controllers: [OfficerEvaluationController, OfficerController],
  exports: [OfficerEvaluationService],
})
export class OfficerModule {}
