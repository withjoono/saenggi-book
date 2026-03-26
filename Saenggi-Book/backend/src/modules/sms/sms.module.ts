import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [ConfigModule, forwardRef(() => MembersModule)],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
