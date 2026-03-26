import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';

/**
 * Hub 중앙 인증 Guard
 *
 * Hub(GB-Back-Nest)가 발급한 JWT 토큰을 검증하여 인증을 수행합니다.
 * SSO(Single Sign-On) 구현을 위해 사용됩니다.
 *
 * 작동 방식:
 * 1. Request Header 또는 Cookie에서 토큰 추출
 * 2. Hub의 /auth/verify-token API로 토큰 검증 요청
 * 3. 검증 성공 시 사용자 정보를 request.user에 설정
 * 4. 검증 실패 시 401 Unauthorized 에러 발생
 */
@Injectable()
export class HubAuthGuard implements CanActivate {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // @Public() 데코레이터가 있는 경우 인증 스킵
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token =
      this.extractTokenFromHeader(request) ||
      this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('인증 토큰이 없습니다');
    }

    try {
      // Hub에 토큰 검증 요청
      const hubUrl = this.configService.get<string>('HUB_AUTH_URL');

      if (!hubUrl) {
        throw new Error('HUB_AUTH_URL이 설정되지 않았습니다');
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${hubUrl}/auth/verify-token`,
          { accessToken: token },
          { timeout: 5000 }, // 5초 타임아웃
        ),
      );

      if (!response.data.valid) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다');
      }

      // 검증 성공 시 사용자 정보를 request에 추가
      request.user = {
        memberId: response.data.memberId,
        email: response.data.email,
        name: response.data.name,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Hub 서버 에러 또는 네트워크 에러
      console.error('[HubAuthGuard] 토큰 검증 실패:', error.message);
      throw new UnauthorizedException(
        'Hub 인증 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  /**
   * Authorization Bearer 헤더에서 토큰 추출
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * HttpOnly 쿠키에서 토큰 추출
   */
  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.['accessToken'] || request.cookies?.['access_token'];
  }
}
