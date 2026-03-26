import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';

/**
 * 하이브리드 앱 전용 API Key Guard
 * - 모바일 앱에서 오는 요청에 대해 추가 인증 레이어 제공
 * - 웹과 앱 요청을 구분하여 보안 강화
 * - 앱 위변조 감지 기능 포함
 */
@Injectable()
export class AppApiKeyGuard implements CanActivate {
  private readonly appApiKey: string;
  private readonly appSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    // 환경변수에서 앱 API Key 로드
    this.appApiKey = this.configService.get<string>('APP_API_KEY') || '';
    this.appSecret = this.configService.get<string>('APP_SECRET') || '';
  }

  canActivate(context: ExecutionContext): boolean {
    // @RequireAppAuth() 데코레이터가 있는 경우만 검증
    const requireAppAuth = this.reflector.get<boolean>('requireAppAuth', context.getHandler());

    if (!requireAppAuth) {
      return true; // 데코레이터가 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const deviceId = request.headers['x-device-id'];
    const timestamp = request.headers['x-timestamp'];
    const signature = request.headers['x-signature'];
    const platform = request.headers['x-platform']; // ios | android

    // 1. 기본 헤더 검증
    if (!apiKey || !deviceId) {
      throw new UnauthorizedException('앱 인증 정보가 필요합니다.');
    }

    // 2. API Key 검증
    if (apiKey !== this.appApiKey) {
      throw new UnauthorizedException('유효하지 않은 API Key입니다.');
    }

    // 3. 타임스탬프 검증 (5분 이내 요청만 허용 - 리플레이 공격 방지)
    if (timestamp) {
      const requestTime = parseInt(timestamp, 10);
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - requestTime);

      if (timeDiff > 5 * 60 * 1000) {
        // 5분
        throw new UnauthorizedException('요청 시간이 만료되었습니다.');
      }
    }

    // 4. 서명 검증 (앱 위변조 감지)
    if (signature && this.appSecret) {
      const expectedSignature = this.generateSignature(apiKey, deviceId, timestamp || '');

      if (signature !== expectedSignature) {
        throw new UnauthorizedException('앱 무결성 검증에 실패했습니다.');
      }
    }

    // 요청에 앱 정보 추가 (이후 로직에서 활용 가능)
    request.appInfo = {
      deviceId,
      platform,
      isVerifiedApp: true,
    };

    return true;
  }

  /**
   * HMAC-SHA256 서명 생성
   * 앱에서도 동일한 로직으로 서명을 생성해야 함
   */
  private generateSignature(apiKey: string, deviceId: string, timestamp: string): string {
    const data = `${apiKey}:${deviceId}:${timestamp}`;
    return crypto.createHmac('sha256', this.appSecret).update(data).digest('hex');
  }
}
