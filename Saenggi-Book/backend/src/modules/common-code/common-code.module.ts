import { Module } from '@nestjs/common';
import { CommonCodeController } from './common-code.controller';
import { SubjectCodesService } from './services/subject-code.service';

@Module({
  imports: [],
  providers: [SubjectCodesService],
  controllers: [CommonCodeController],
  exports: [SubjectCodesService],
})
export class CommonCodeModule {}
