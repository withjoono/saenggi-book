import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';
import { JwtService } from 'src/common/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { STATUS_MESSAGES } from 'src/common/utils/error-messages';

// jwt 인증 통과 시 request[memberId] 값이 저장됨
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService<AllConfigType>,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException(STATUS_MESSAGES.AUTH.UNAUTHORIZED);
    }
    try {
      const memberId = this.jwtService.getMemberIdFromToken(
        token,
        this.configService.getOrThrow('auth', { infer: true }).secret,
      );
      request['memberId'] = memberId;
    } catch {
      throw new UnauthorizedException(STATUS_MESSAGES.AUTH.UNAUTHORIZED);
    }
    return true;
  }

  /**
   * Authorization 헤더 또는 쿠키에서 토큰 추출
   */
  private extractToken(request: Request): string | undefined {
    // 1. Authorization 헤더에서 추출 (우선)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. 쿠키에서 추출 (HttpOnly 쿠키 지원)
    return request.cookies?.access_token;
  }
}
