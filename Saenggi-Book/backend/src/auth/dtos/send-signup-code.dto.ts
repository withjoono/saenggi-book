import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendSignupCodeDto {
  @ApiProperty({
    description: '이메일 주소 (선택, 중복 확인용)',
    example: 'student@example.com',
    required: false,
    format: 'email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '휴대폰 번호 (하이픈 포함 가능)',
    example: '010-1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
