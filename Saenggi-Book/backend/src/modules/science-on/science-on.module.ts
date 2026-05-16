import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScienceOnController } from './controllers/science-on.controller';
import { ScienceOnService } from './services/science-on.service';
import { OpenAlexModule } from '../open-alex/open-alex.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    OpenAlexModule,
  ],
  controllers: [ScienceOnController],
  providers: [ScienceOnService],
  exports: [ScienceOnService],
})
export class ScienceOnModule {}
