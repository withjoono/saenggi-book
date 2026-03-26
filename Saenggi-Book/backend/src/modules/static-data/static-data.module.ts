import { Module } from '@nestjs/common';
import { StaticDataController } from './static-data.controller';
import { StaticDataService } from './static-data.service';

@Module({
  imports: [
  ],
  controllers: [StaticDataController],
  providers: [StaticDataService],
})
export class StaticDataModule {}
