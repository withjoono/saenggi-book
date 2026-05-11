import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenAlexController } from './controllers/open-alex.controller';
import { OpenAlexService } from './services/open-alex.service';
import { TranslationService } from './services/translation.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [OpenAlexController],
  providers: [OpenAlexService, TranslationService],
  exports: [OpenAlexService],
})
export class OpenAlexModule {}
