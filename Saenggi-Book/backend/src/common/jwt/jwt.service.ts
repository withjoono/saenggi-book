import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class JwtService {
  private readonly HASH_ALGORITHM: jwt.Algorithm = 'HS512'; // 스프링과 일치
  private readonly SECRET_KEY: string;
  private readonly REFRESH_SECRET_KEY: string;
  private readonly TOKEN_VALIDATION_MS: number;
  private readonly REFRESH_TOKEN_VALIDATION_MS: number;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.SECRET_KEY = this.configService.getOrThrow('auth', {
      infer: true,
    }).secret;
    this.REFRESH_SECRET_KEY = this.configService.getOrThrow('auth', {
      infer: true,
    }).refreshSecret;
    this.TOKEN_VALIDATION_MS = this.configService.getOrThrow('auth', {
      infer: true,
    }).expires;
    this.REFRESH_TOKEN_VALIDATION_MS = this.configService.getOrThrow('auth', {
      infer: true,
    }).refreshExpires;
  }

  private getSigningKey(secretKey: string): Buffer {
    return Buffer.from(secretKey, 'base64'); // 스프링에서는 시크릿키를 base64 인코딩처리를 하여 사용하기 때문에 맞춰줘야함
  }

  createAccessToken(memberId: string | number): string {
    const payload = {
      sub: 'ATK',
      jti: memberId,
    };
    return jwt.sign(payload, this.getSigningKey(this.SECRET_KEY), {
      expiresIn: this.TOKEN_VALIDATION_MS / 1000,
      algorithm: this.HASH_ALGORITHM,
    });
  }

  createRefreshToken(memberId: string | number): string {
    const payload = {
      sub: 'RTK',
      jti: memberId,
    };
    return jwt.sign(payload, this.getSigningKey(this.REFRESH_SECRET_KEY), {
      expiresIn: this.REFRESH_TOKEN_VALIDATION_MS / 1000,
      algorithm: this.HASH_ALGORITHM,
    });
  }

  getTokenExpiryTime(): number {
    return Math.floor(Date.now() / 1000) + this.TOKEN_VALIDATION_MS / 1000;
  }

  validateToken(token: string, secret: string): boolean {
    try {
      jwt.verify(token, this.getSigningKey(secret), {
        algorithms: [this.HASH_ALGORITHM],
      });
      return true;
    } catch (error) {
      console.error('Invalid JWT token:', error.message);
      return false;
    }
  }

  getMemberIdFromToken(token: string, secret: string): string {
    const claims = jwt.verify(token, this.getSigningKey(secret), {
      algorithms: [this.HASH_ALGORITHM],
    }) as jwt.JwtPayload;
    return claims.jti as string;
  }

  extractAllClaims(token: string, secret: string): jwt.JwtPayload {
    return jwt.verify(token, this.getSigningKey(secret), {
      algorithms: [this.HASH_ALGORITHM],
    }) as jwt.JwtPayload;
  }

  /**
   * JWT 토큰에서 앱별 권한 정보 추출 (Hub JWT용)
   * @param token JWT 토큰
   * @param secret 시크릿 키
   * @param appId 앱 ID (예: 'susi', 'jungsi', 'examhub')
   * @returns 앱 권한 정보 또는 undefined
   */
  getAppPermission(token: string, secret: string, appId: string): any {
    try {
      const claims = this.extractAllClaims(token, secret);
      return claims.permissions?.[appId];
    } catch {
      return undefined;
    }
  }

  /**
   * Hub JWT 토큰에서 모든 권한 정보 추출
   * @param token JWT 토큰
   * @param secret 시크릿 키
   * @returns 전체 권한 정보 또는 undefined
   */
  getAllPermissions(token: string, secret: string): Record<string, any> | undefined {
    try {
      const claims = this.extractAllClaims(token, secret);
      return claims.permissions;
    } catch {
      return undefined;
    }
  }
}
