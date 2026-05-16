import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScienceOnController } from './controllers/science-on.controller';
import { ScienceOnService } from './services/science-on.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [ScienceOnController],
  providers: [ScienceOnService],
  exports: [ScienceOnService],
})
export class ScienceOnModule {}
