/**
 * Request 인터셉터
 * Reference 프로젝트의 패턴 적용 (일부 수정)
 * Note: NestJS 백엔드는 camelCase를 기대하므로 케이스 변환하지 않음
 */

import { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from '../token-manager';

/**
 * 인증 Request 인터셉터
 * - Authorization 헤더에 Bearer 토큰 추가
 * - NestJS 백엔드는 camelCase를 기대하므로 케이스 변환하지 않음
 */
export const authRequestInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  // Access Token 추가
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // NestJS 백엔드는 camelCase를 기대하므로 데이터 변환하지 않음
  // (Reference 프로젝트는 Spring 백엔드로 snake_case 사용했으나,
  // 이 프로젝트는 NestJS 백엔드로 camelCase 사용)

  return config;
};

/**
 * Request 인터셉터 에러 핸들러
 */
export const authRequestErrorInterceptor = (error: any) => {
  return Promise.reject(error);
};
