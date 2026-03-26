import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RegisterWithSocialDto {
  @ApiProperty({
    description: '소셜 로그인 제공자',
    example: 'google',
    enum: ['naver', 'google'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['naver', 'google'])
  socialType: 'naver' | 'google';

  @ApiProperty({
    description: '소셜 로그인 액세스 토큰 (OAuth 제공자로부터 발급받은 토큰)',
    example: 'ya29.a0AfH6SMBx...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '김학생',
  })
  @IsString()
  @IsNotEmpty()
  nickname: string; // 이름

  @ApiProperty({
    description: '휴대폰 번호 (하이픈 포함 가능)',
    example: '010-1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string; // 휴대폰 번호 (인증 없이 필수 입력)

  @ApiProperty({
    description: 'SMS 수신 동의 여부 (선택, 기본값 false)',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  ckSmsAgree?: boolean; // sms 수신 동의 (선택)

  @ApiProperty({
    description: '전공 계열 (문과: 0, 이과: 1)',
    example: '1',
    enum: ['0', '1'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['0', '1'], {
    message: '전공 코드가 잘못되었습니다. (문과: 0, 이과: 1)',
  })
  isMajor: string; // 문과(0), 이과(1)

  @ApiProperty({
    description: '고등학교 타입 ID (선택)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  hstTypeId: number; // 고등학교 코드

  @ApiProperty({
    description: '졸업 또는 졸업 예정 연도 (YYYY)',
    example: '2024',
  })
  @IsString()
  @IsNotEmpty()
  graduateYear: string; // 졸업(예정)년도

  @ApiProperty({
    description: '회원 유형 (학생/교사/학부모)',
    example: 'student',
    enum: ['student', 'teacher', 'parent'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['student', 'teacher', 'parent'])
  memberType?: string; // student, teacher, parent

  @ApiProperty({
    description: '초대 코드 (선생님이 생성한 초대 링크 코드, 회원가입 후 자동 연동)',
    example: 'ABC123XYZ789',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(32)
  inviteCode?: string;
}
