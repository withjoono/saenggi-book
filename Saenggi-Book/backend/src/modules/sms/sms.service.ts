import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AllConfigType } from 'src/config/config.type';
import { Logger } from 'winston';

@Injectable()
export class SmsService {
  private readonly NHN_BASE_URL = 'https://sens.apigw.ntruss.com';
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly serviceId: string;
  private readonly senderPhone: string;
  private readonly testMode: string;

  constructor(
    private configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const smsConfig = this.configService.get('sms', { infer: true });
    this.accessKey = smsConfig?.nhnAccessKey || '';
    this.secretKey = smsConfig?.nhnSecretKey || '';
    this.serviceId = smsConfig?.nhnServiceId || '';
    this.senderPhone = smsConfig?.senderPhone || '';
    this.testMode = smsConfig?.testMode || 'Y';

    // 자격 증명 없으면 경고 로그
    if (!this.accessKey || !this.secretKey || !this.serviceId) {
      this.logger.warn('NHN Cloud SMS 자격 증명이 설정되지 않았습니다. SMS 발송이 비활성화됩니다.');
    }
  }

  /**
   * SMS 발송 가능 여부 확인
   */
  private isConfigured(): boolean {
    return !!(this.accessKey && this.secretKey && this.serviceId && this.senderPhone);
  }

  /**
   * NHN Cloud SENS API 서명 생성
   * @param method HTTP 메소드 (GET, POST 등)
   * @param uri API URI (/sms/v2/services/{serviceId}/messages)
   * @param timestamp 타임스탬프 (밀리초)
   */
  private makeSignature(method: string, uri: string, timestamp: string): string {
    const space = ' ';
    const newLine = '\n';

    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(method);
    hmac.update(space);
    hmac.update(uri);
    hmac.update(newLine);
    hmac.update(timestamp);
    hmac.update(newLine);
    hmac.update(this.accessKey);

    return hmac.digest('base64');
  }

  /**
   * NHN Cloud SENS SMS 발송 API 호출
   */
  private async sendNhnSms(message: string, receiverPhone: string): Promise<any> {
    const timestamp = Date.now().toString();
    const uri = `/sms/v2/services/${this.serviceId}/messages`;
    const signature = this.makeSignature('POST', uri, timestamp);

    // 전화번호 포맷 정리 (하이픈 제거)
    const cleanPhone = receiverPhone.replace(/-/g, '');
    const cleanSender = this.senderPhone.replace(/-/g, '');

    const requestBody = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: cleanSender,
      content: message,
      messages: [
        {
          to: cleanPhone,
        },
      ],
    };

    try {
      const response = await axios.post(`${this.NHN_BASE_URL}${uri}`, requestBody, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': this.accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error('NHN Cloud SMS API 에러', {
          status: error.response.status,
          data: error.response.data,
          phone: receiverPhone,
        });
        throw new BadRequestException(error.response.data?.message || 'SMS 발송 실패');
      }
      throw error;
    }
  }

  // 인증코드 확인
  async verifyCode(phone: string, code: string): Promise<boolean> {
    // [임시] 핸드폰 인증 우회 - TODO: 인증 서비스 정상화 후 아래 주석 해제 필요
    this.logger.info('SMS 인증 우회 (임시 비활성화)', { phone, code });
    return true;

    // const storedCode = await this.cacheManager.get(phone);
    // if (storedCode && storedCode === code) {
    //   await this.cacheManager.del(phone); // 코드 일치 시 삭제
    //   return true;
    // }
    // return false;
  }

  // 회원가입 인증번호 발송
  async sendRegisterCode(phone: string, branch?: string) {
    const code = this._generateCode();
    this.logger.debug('인증번호 생성', {
      phone,
      code,
      branch: branch || 'default',
    });
    await this._saveCodeToCache(phone, code);
    let message = `[(주)]거북스쿨 본인확인 인증번호 [${code}]를 화면에 입력해주세요.`;
    if (branch === 'ida') {
      message = `대치IDA학원 본인확인 인증번호 [${code}]를 화면에 입력해주세요.`;
    }
    return this.sendMessage(message, phone);
  }

  // 랜덤 인증코드 생성
  private _generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 숫자 코드 생성
  }

  // 인증코드 캐시저장(180초)
  private async _saveCodeToCache(phone: string, code: string) {
    await this.cacheManager.set(phone, code, 180 * 1000); // 코드 180초 동안 캐시에 저장
  }

  // 메세지 발송
  async sendMessage(message: string, receiverPhone: string) {
    this.logger.info('SMS 발송 시작', {
      phone: receiverPhone,
      messageLength: message.length,
      provider: 'NHN Cloud SENS',
    });

    // 개발 환경에서 테스트 모드인 경우 실제 발송 없이 성공 응답 반환
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestMode = this.testMode === 'Y';

    if (isDevelopment && isTestMode) {
      this.logger.info('SMS 발송 스킵 (개발 테스트 모드)', {
        phone: receiverPhone,
        message: message,
      });
      return {
        statusCode: '202',
        statusName: 'success',
        requestId: `test_${Date.now()}`,
        requestTime: new Date().toISOString(),
      };
    }

    // 자격 증명이 없으면 에러
    if (!this.isConfigured()) {
      this.logger.error('SMS 발송 실패: NHN Cloud 자격 증명이 설정되지 않았습니다.');
      throw new BadRequestException('SMS 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.');
    }

    try {
      const result = await this.sendNhnSms(message, receiverPhone);

      // NHN Cloud SENS 성공 응답: statusCode가 "202"
      if (result.statusCode === '202') {
        this.logger.info('SMS 발송 성공', {
          phone: receiverPhone,
          requestId: result.requestId,
          statusName: result.statusName,
        });
      } else {
        this.logger.error('SMS 발송 실패', {
          phone: receiverPhone,
          statusCode: result.statusCode,
          statusName: result.statusName,
        });
        throw new BadRequestException(result.statusName || 'SMS 발송에 실패했습니다.');
      }

      return result;
    } catch (error) {
      this.logger.error('SMS 발송 에러', {
        error: error.message,
        stack: error.stack,
        phone: receiverPhone,
      });
      throw error;
    }
  }
}
