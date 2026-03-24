/**
 * API 모듈 진입점
 * 모든 API 관련 기능을 여기서 export
 *
 * Note: Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
 */

// Axios 인스턴스
export {
  publicClient,
  authClient,
  // Spring 백엔드 클라이언트 - 더 이상 사용하지 않음
  // springPublicClient,
  // springAuthClient,
} from './instances';

// 토큰 관리
export {
  getAccessToken,
  getRefreshToken,
  setTokens,
  setAccessToken,
  clearTokens,
  hasTokens,
  hasAccessToken,
} from './token-manager';

// 인터셉터 설정
export { setupInterceptors } from './interceptors/setup';
