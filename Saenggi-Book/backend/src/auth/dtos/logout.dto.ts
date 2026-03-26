import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'JWT Refresh Token (쿠키에서 자동 추출되므로 선택적)',
    example: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
