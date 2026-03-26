import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { AskDto, ChatResponseDto } from './dto/ask.dto';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post('ask')
  @ApiOperation({
    summary: '챗봇에 질문하기',
    description: 'FAQ, 용어사전, 매뉴얼을 기반으로 질문에 답변합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '질문에 대한 답변',
    type: ChatResponseDto,
  })
  async ask(@Body() dto: AskDto): Promise<ChatResponseDto> {
    return this.chatbotService.ask(dto);
  }

  @Public()
  @Get('status')
  @ApiOperation({
    summary: '챗봇 상태 확인',
    description: '지식 베이스 로드 상태를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '챗봇 상태 정보',
  })
  getStatus() {
    return this.chatbotService.getStatus();
  }
}
