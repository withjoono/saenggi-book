import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * SSO 코드 교환 요청 DTO
 * Susi Backend에서 Hub Backend로 코드 검증 및 토큰 교환 요청
 */
export class SsoExchangeDto {
  @ApiProperty({
    description: 'Hub에서 받은 SSO 일회용 코드',
    example: 'SSO_abc123def456',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
