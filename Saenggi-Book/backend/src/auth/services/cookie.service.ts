import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

/**
 * HttpOnly Cookie 관리 서비스
 * - XSS 공격으로부터 JWT 토큰 보호
 * - 쿠키 기반 인증으로 보안 강화
 */
@Injectable()
export class CookieService {
  private readonly isProduction: boolean;
  private readonly cookieDomain: string;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.cookieDomain = this.configService.get<string>('COOKIE_DOMAIN') || '';
  }

  private getBaseCookieOptions(): CookieOptions {
    const options: CookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/',
    };
    if (this.cookieDomain) {
      options.domain = this.cookieDomain;
    }
    return options;
  }

  /**
   * Access Token을 HttpOnly 쿠키로 설정
   */
  setAccessTokenCookie(res: Response, accessToken: string, expiresIn: number): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true, // JavaScript 접근 불가 (XSS 방지)
      secure: this.isProduction, // HTTPS에서만 전송 (프로덕션)
      sameSite: this.isProduction ? 'strict' : 'lax', // CSRF 방지
      maxAge: expiresIn, // 밀리초 단위
      path: '/',
      ...(this.cookieDomain && { domain: this.cookieDomain }),
    });
  }

  /**
   * Refresh Token을 HttpOnly 쿠키로 설정
   */
  setRefreshTokenCookie(res: Response, refreshToken: string, expiresIn: number): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: expiresIn,
      path: '/auth', // refresh 엔드포인트에서만 전송
      ...(this.cookieDomain && { domain: this.cookieDomain }),
    });
  }

  /**
   * 로그인 성공 시 모든 인증 쿠키 설정
   */
  setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
  ): void {
    this.setAccessTokenCookie(res, accessToken, accessTokenExpiresIn);
    this.setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresIn);

    // 클라이언트가 로그인 상태를 확인할 수 있는 non-httponly 쿠키
    res.cookie('is_logged_in', 'true', {
      httpOnly: false, // JavaScript에서 로그인 상태 확인 가능
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: accessTokenExpiresIn,
      path: '/',
      ...(this.cookieDomain && { domain: this.cookieDomain }),
    });
  }

  /**
   * 로그아웃 시 모든 인증 쿠키 삭제
   */
  clearAuthCookies(res: Response): void {
    const cookieOptions = this.getBaseCookieOptions();

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', { ...cookieOptions, path: '/auth' });
    res.clearCookie('is_logged_in', { ...cookieOptions, httpOnly: false });
  }

  /**
   * 요청에서 Access Token 추출 (헤더 또는 쿠키)
   */
  extractAccessToken(req: any): string | null {
    // 1. Authorization 헤더에서 추출 (기존 방식 호환)
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. 쿠키에서 추출
    return req.cookies?.access_token || null;
  }

  /**
   * 요청에서 Refresh Token 추출 (바디 또는 쿠키)
   */
  extractRefreshToken(req: any): string | null {
    // 1. 요청 바디에서 추출 (기존 방식 호환)
    if (req.body?.refreshToken) {
      return req.body.refreshToken;
    }

    // 2. 쿠키에서 추출
    return req.cookies?.refresh_token || null;
  }
}
