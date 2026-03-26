import { Module } from '@nestjs/common';
import { NonsulService } from './nonsul.service';
import { EssayExcelParserService } from './parsers/excel-parser.service';
import { NonsulController } from './nonsul.controller';

@Module({
  imports: [],
  controllers: [NonsulController],
  providers: [NonsulService, EssayExcelParserService],
  exports: [NonsulService, EssayExcelParserService],
})
export class NonsulModule {}
