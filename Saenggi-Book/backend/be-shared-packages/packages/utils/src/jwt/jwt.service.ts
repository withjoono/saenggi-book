import * as jwt from 'jsonwebtoken';
import {
  JwtConfig,
  JwtPayload,
  TokenPair,
  TokenVerifyResult,
  DEFAULT_JWT_CONFIG,
} from './jwt.types';

/**
 * JWT 서비스
 *
 * Spring 백엔드와 호환되는 JWT 토큰 생성/검증 서비스
 *
 * @example
 * const jwtService = new JwtService({
 *   accessSecret: process.env.AUTH_JWT_SECRET,
 *   refreshSecret: process.env.AUTH_REFRESH_SECRET,
 * });
 *
 * const tokens = jwtService.generateTokens(memberId);
 * const result = jwtService.verifyAccessToken(token);
 */
export class JwtService {
  private readonly config: Required<JwtConfig>;

  constructor(config: JwtConfig) {
    this.config = {
      ...DEFAULT_JWT_CONFIG,
      ...config,
    } as Required<JwtConfig>;
  }

  /**
   * Access Token과 Refresh Token 쌍 생성
   */
  generateTokens(memberId: number | string): TokenPair {
    const accessToken = this.generateAccessToken(memberId);
    const refreshToken = this.generateRefreshToken(memberId);
    return { accessToken, refreshToken };
  }

  /**
   * Access Token 생성
   */
  generateAccessToken(memberId: number | string): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: 'ATK',
      jti: String(memberId),
    };

    return jwt.sign(payload, this.getDecodedSecret(this.config.accessSecret), {
      algorithm: 'HS512',
      expiresIn: this.config.accessExpiresIn,
    });
  }

  /**
   * Refresh Token 생성
   */
  generateRefreshToken(memberId: number | string): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: 'RTK',
      jti: String(memberId),
    };

    return jwt.sign(payload, this.getDecodedSecret(this.config.refreshSecret), {
      algorithm: 'HS512',
      expiresIn: this.config.refreshExpiresIn,
    });
  }

  /**
   * Access Token 검증
   */
  verifyAccessToken(token: string): TokenVerifyResult {
    return this.verifyToken(token, this.config.accessSecret, 'ATK');
  }

  /**
   * Refresh Token 검증
   */
  verifyRefreshToken(token: string): TokenVerifyResult {
    return this.verifyToken(token, this.config.refreshSecret, 'RTK');
  }

  /**
   * 토큰에서 회원 ID 추출 (검증 없이)
   */
  extractMemberId(token: string): string | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload | null;
      return decoded?.jti || null;
    } catch {
      return null;
    }
  }

  /**
   * 토큰 검증 공통 로직
   */
  private verifyToken(
    token: string,
    secret: string,
    expectedSub: 'ATK' | 'RTK',
  ): TokenVerifyResult {
    try {
      const payload = jwt.verify(token, this.getDecodedSecret(secret), {
        algorithms: ['HS512'],
      }) as JwtPayload;

      if (payload.sub !== expectedSub) {
        return {
          valid: false,
          error: `Invalid token type. Expected ${expectedSub}, got ${payload.sub}`,
        };
      }

      return { valid: true, payload };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Base64 인코딩된 시크릿 디코딩
   */
  private getDecodedSecret(base64Secret: string): Buffer {
    return Buffer.from(base64Secret, 'base64');
  }
}

/**
 * JwtService 싱글톤 인스턴스 생성 헬퍼
 */
export function createJwtService(config: JwtConfig): JwtService {
  return new JwtService(config);
}
