import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({
    description: '휴대폰 번호 (하이픈 포함 가능)',
    example: '010-1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'SMS로 전송된 6자리 인증 코드',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
