/**
 * 토큰 갱신 인터셉터
 * Reference 프로젝트의 단순화된 토큰 갱신 패턴 적용
 * Hub 중앙 인증 서버를 통해 토큰 갱신 (Firebase 토큰은 Hub에서만 갱신 가능)
 */

import { AxiosError } from 'axios';
import { camelizeKeys } from 'humps';
import { hubApiClient } from '@/stores/server/hub-api-client';
import {
  clearTokens,
  getRefreshToken,
  setAccessToken,
} from '../token-manager';
import { ERROR_CODES } from '../../errors/error-codes';

/**
 * 토큰 갱신 API 호출
 * Hub 인증 서버(/api-hub)를 통해 토큰을 갱신합니다.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    // Hub 인증 서버에 토큰 갱신 요청
    const response = await hubApiClient.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken } = response.data;
    if (accessToken) {
      const token = accessToken.accessToken || accessToken;
      setAccessToken(token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
};

/**
 * 로그아웃 처리 (토큰 제거 + Hub Firebase 로그인으로 리다이렉트)
 */
const handleLogout = () => {
  // 로그인 페이지에서는 처리하지 않음 (무한 루프 방지)
  if (window.location.pathname.includes('/auth/login')) {
    return;
  }

  clearTokens();
  // Hub Firebase 로그인으로 리다이렉트
  window.location.href = 'http://localhost:3000/auth/login';
};

/**
 * 에러 Response 인터셉터 (토큰 갱신 포함)
 * Reference 프로젝트의 에러 처리 패턴 적용
 */
export const authResponseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as any;

  // 에러 응답 데이터를 camelCase로 변환
  if (error.response?.data) {
    error.response.data = camelizeKeys(error.response.data);
  }

  // 401 에러 처리
  if (error.response?.status === 401) {
    const errorData = error.response.data as any;
    const errorCode = errorData?.detailCode;

    // C401: 토큰 만료 → 갱신 시도
    if (errorCode === ERROR_CODES.TOKEN_EXPIRED && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return publicClient.request(originalRequest);
      } else {
        // 갱신 실패 → 로그아웃
        handleLogout();
        return Promise.reject(error);
      }
    }

    // C999: 유효하지 않은 토큰 → 로그아웃
    if (errorCode === ERROR_CODES.INVALID_TOKEN) {
      handleLogout();
      return Promise.reject(error);
    }

    // C5050: 세션 만료 → 로그아웃
    if (errorCode === ERROR_CODES.SESSION_EXPIRED) {
      alert(errorData?.message || '세션이 만료되었습니다.');
      handleLogout();
      return Promise.reject(error);
    }
  }

  return Promise.reject(error);
};
