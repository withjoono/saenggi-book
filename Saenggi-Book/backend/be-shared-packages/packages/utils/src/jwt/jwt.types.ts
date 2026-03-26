/**
 * JWT 관련 타입 정의
 */

/**
 * JWT 설정 옵션
 */
export interface JwtConfig {
  /** Access Token 시크릿 (base64 인코딩) */
  accessSecret: string;
  /** Refresh Token 시크릿 (base64 인코딩) */
  refreshSecret: string;
  /** Access Token 만료 시간 (초) - 기본값: 7200 (2시간) */
  accessExpiresIn?: number;
  /** Refresh Token 만료 시간 (초) - 기본값: 5184000 (60일) */
  refreshExpiresIn?: number;
}

/**
 * JWT 페이로드 (Spring 백엔드 호환)
 */
export interface JwtPayload {
  /** 토큰 타입: 'ATK' (Access) 또는 'RTK' (Refresh) */
  sub: 'ATK' | 'RTK';
  /** 회원 ID */
  jti: string;
  /** 발급 시간 (Unix timestamp) */
  iat: number;
  /** 만료 시간 (Unix timestamp) */
  exp: number;
}

/**
 * 토큰 검증 결과
 */
export interface TokenVerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
}

/**
 * 토큰 쌍 (Access + Refresh)
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * 기본 JWT 설정
 */
export const DEFAULT_JWT_CONFIG: Partial<JwtConfig> = {
  accessExpiresIn: 7200, // 2시간
  refreshExpiresIn: 5184000, // 60일
};
