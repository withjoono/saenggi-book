import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class loginWithEmailDto {
  @ApiProperty({
    description: '사용자 이메일 주소',
    example: 'student@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호 (6-500자)',
    example: 'password123!',
    minLength: 6,
    maxLength: 500,
  })
  @IsString()
  @MinLength(6, {
    message: 'Password is too short. It must be at least 6 characters long.',
  })
  @MaxLength(500, {
    message: 'Password is too long. It must be at most 500 characters long.',
  })
  password: string;
}
