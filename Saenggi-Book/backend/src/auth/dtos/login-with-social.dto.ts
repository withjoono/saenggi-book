import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class LoginWithSocialDto {
  @ApiProperty({
    description: '소셜 로그인 제공자',
    example: 'google',
    enum: ['naver', 'google'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['naver', 'google'])
  socialType: string;

  @ApiProperty({
    description: '소셜 로그인 액세스 토큰 (OAuth 제공자로부터 발급받은 토큰)',
    example: 'ya29.a0AfH6SMBx...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
