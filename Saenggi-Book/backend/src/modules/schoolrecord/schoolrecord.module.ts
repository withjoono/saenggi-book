import { Module } from '@nestjs/common';
import { SchoolRecordService } from './schoolrecord.service';
import { SchoolRecordController } from './schoolrecord.controller';
import { SchoolRecordHtmlParserService } from './parsers/html-parser.service';
import { AiPdfParserService } from './parsers/ai-pdf-parser.service';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiBuildService } from './ai-build.service';
import { AiBuildController } from './ai-build.controller';
import { SemesterEvalService } from './semester-eval.service';
import { SemesterEvalController } from './semester-eval.controller';

@Module({
  imports: [
  ],
  controllers: [SchoolRecordController, AiAnalysisController, AiBuildController, SemesterEvalController],
  providers: [
    SchoolRecordService,
    SchoolRecordHtmlParserService,
    AiPdfParserService,
    AiAnalysisService,
    AiBuildService,
    SemesterEvalService,
  ],
  exports: [
    SchoolRecordService,
    SchoolRecordHtmlParserService,
    AiPdfParserService,
    AiAnalysisService,
    AiBuildService,
    SemesterEvalService,
  ],
})
export class SchoolRecordModule { }

