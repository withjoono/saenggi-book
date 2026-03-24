/**
 * Hub 중앙 인증 서버 API 클라이언트
 *
 * Hub(GB-Back-Nest)의 인증 관련 API를 호출하기 위한 Axios 클라이언트입니다.
 * 로그인, 회원가입, 토큰 갱신 등의 인증 작업에 사용됩니다.
 */

import axios from 'axios';
import { env } from '@/lib/config/env';

/**
 * Hub 인증 서버용 Axios 인스턴스
 *
 * - baseURL: Hub 인증 서버 URL (/api-hub 또는 직접 URL)
 * - withCredentials: HttpOnly 쿠키 송수신 활성화
 * - headers: JSON 요청/응답 설정
 */
export const hubApiClient = axios.create({
  baseURL: env.apiUrlHub,
  withCredentials: true, // HttpOnly 쿠키 자동 전송/수신
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Authorization 헤더 추가 (토큰이 있는 경우)
hubApiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
hubApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized: 토큰 만료 또는 유효하지 않음
    if (error.response?.status === 401) {
      // 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // 로그인 페이지로 리다이렉트 (필요한 경우)
      // window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default hubApiClient;
