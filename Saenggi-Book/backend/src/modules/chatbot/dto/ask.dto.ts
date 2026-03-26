import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AskDto {
  @ApiProperty({
    description: '사용자 질문',
    example: '환산점수가 뭔가요?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional({
    description: '현재 페이지 경로 (컨텍스트 인식용)',
    example: '/jungsi/score-input',
  })
  @IsString()
  @IsOptional()
  currentPage?: string;

  @ApiPropertyOptional({
    description: '대화 세션 ID (대화 히스토리 유지용)',
    example: 'session-123',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class ChatResponseDto {
  @ApiProperty({
    description: '챗봇 응답 메시지',
    example: '환산점수는 각 대학의 반영 비율과 가산점을 적용하여 변환한 점수입니다.',
  })
  answer: string;

  @ApiProperty({
    description: '참조된 소스 문서들',
    example: ['01-score-input.md', 'glossary.json'],
  })
  sources: string[];

  @ApiProperty({
    description: '관련 페이지 링크들',
    example: ['/jungsi/score-input', '/jungsi/score-analysis'],
  })
  relatedPages: string[];

  @ApiPropertyOptional({
    description: '후속 질문 추천',
    example: ['표준점수는 어디서 확인하나요?', '백분위란 무엇인가요?'],
  })
  suggestedQuestions?: string[];
}
