import { Body, Controller, Post, Get, Req } from '@nestjs/common';
import { SetukBuilderService } from './setuk-builder.service';
import { RecommendTopicDto } from './dto/recommend-topic.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';

@Controller('setuk-builder')
export class SetukBuilderController {
    constructor(private readonly setukBuilderService: SetukBuilderService) {}

    @Post('recommend-topics')
    async recommendTopics(@Body() dto: RecommendTopicDto, @Req() req: any) {
        return this.setukBuilderService.recommendTopics(dto);
    }

    @Post('generate-draft')
    async generateDraft(@Body() dto: GenerateDraftDto, @Req() req: any) {
        return this.setukBuilderService.generateDraft(dto);
    }

    @Get('subjects')
    async getSubjects() {
        return this.setukBuilderService.getSubjectList();
    }
}
