import { BadRequestException, Body, Controller, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllConfigType } from 'src/config/config.type';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { SmsService } from './sms.service';
import { MembersService } from '../members/services/members.service';
import { SendSignupCodeDto } from 'src/auth/dtos/send-signup-code.dto';
import { VerifyCodeDto } from 'src/auth/dtos/verify-code.dto';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    private readonly membersService: MembersService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  @Post('send')
  @Roles(['ROLE_ADMIN'])
  async sendMessage(@Body() body: { message: string; receiverPhone: string }) {
    await this.smsService.sendMessage(body.message, body.receiverPhone);

    return;
  }

  @ApiOperation({
    summary: '회원가입 인증번호 발송',
    description: '회원가입 시 휴대폰 본인인증을 위한 6자리 인증번호를 SMS로 발송합니다.',
  })
  @ApiQuery({
    name: 'branch',
    required: false,
    description: '지점 코드 (선택)',
    example: 'gangnam',
  })
  @ApiResponse({
    status: 200,
    description: '인증번호 발송 성공',
  })
  @ApiResponse({
    status: 400,
    description: '이미 사용 중인 이메일 또는 전화번호',
  })
  @Public()
  @Post('auth/send')
  async sendAuthCode(@Body() body: SendSignupCodeDto, @Query('branch') branch?: string) {
    if (body.email && (await this.membersService.findOneByEmail(body.email))) {
      throw new BadRequestException('이미 사용중인 이메일입니다.');
    }
    if (await this.membersService.findOneByPhone(body.phone.replaceAll('-', ''))) {
      throw new BadRequestException('이미 사용중인 휴대폰입니다.');
    }

    await this.smsService.sendRegisterCode(body.phone, branch);

    return null;
  }

  @ApiOperation({
    summary: '인증코드 확인',
    description: 'SMS로 전송된 6자리 인증코드를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인증코드 확인 성공',
  })
  @ApiResponse({
    status: 502,
    description: '인증코드 불일치',
  })
  @Public()
  @Post('auth/verify')
  async verifyAuthCode(@Body() verifyDto: VerifyCodeDto) {
    const isValid = await this.smsService.verifyCode(verifyDto.phone, verifyDto.code);
    if (!isValid) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }
    return null;
  }
}
