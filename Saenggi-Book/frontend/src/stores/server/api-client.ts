import axios from "axios";
import { camelizeKeys } from "humps";
import { getAccessToken, setAccessToken, clearTokens } from "@/lib/api/token-manager";
import { env } from "@/lib/config/env";

/**
 * Note: Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
 */

// 환경에 따른 baseURL 결정
// 개발: Vite 프록시 사용 (/api-nest)
// 프로덕션: 실제 백엔드 URL 사용
const getBaseUrl = (_type: 'nest' | 'spring'): string => {
  if (env.isDevelopment) {
    // Spring은 더 이상 사용하지 않음
    return '/api-nest';
  }
  return env.apiUrlNest;
};

// 토큰 갱신 진행 중 플래그 (중복 갱신 방지)
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 공개 API 엔드포인트 목록 (401 에러 시 리다이렉트하지 않음)
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/store/available',
];

// URL이 공개 엔드포인트인지 확인
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint => url?.includes(endpoint));
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// NestJS 백엔드용 인터셉터
const createNestApiInterceptors = (apiClientInstance) => {
  // 요청 인터셉터: Authorization 헤더 추가
  apiClientInstance.interceptors.request.use(
    (config) => {
      // token-manager에서 토큰 가져오기
      const accessToken = getAccessToken();

      // 토큰이 있으면 Authorization 헤더 추가
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // 응답 인터셉터: 응답 받은 후 데이터 형식 변환 및 401 에러 처리
  apiClientInstance.interceptors.response.use(
    (response) => {
      if (
        response.data &&
        typeof response.data === "object" &&
        !(response.data instanceof Blob)
      ) {
        response.data = camelizeKeys(response.data);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // 생기부 관련 500 에러는 데이터가 없을 때 정상적으로 발생 (로그 억제)
      const isSchoolRecordError = 
        error.response?.status === 500 && 
        originalRequest?.url?.includes('/schoolrecord/');
      
      if (!isSchoolRecordError) {
        // 생기부 관련이 아닌 에러만 콘솔에 출력
        console.error('API Error:', error);
      }

      // 공개 API에서 401 에러 발생 시 리다이렉트하지 않음
      if (error.response?.status === 401 && isPublicEndpoint(originalRequest?.url)) {
        console.warn('🌐 공개 API에서 401 에러 발생 (리다이렉트 안 함):', originalRequest?.url);
        return Promise.reject(error);
      }

      // 401 에러이고 토큰 갱신 엔드포인트가 아닌 경우
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        if (isRefreshing) {
          // 이미 토큰 갱신 중이면 대기
          return new Promise((resolve) => {
            addRefreshSubscriber((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClientInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // 1. 먼저 직접 저장된 토큰 확인 (SSO 및 token-manager에서 사용)
        let refreshToken = localStorage.getItem('refreshToken');

        // 2. 없으면 Zustand persist storage에서 확인 (fallback)
        if (!refreshToken) {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            try {
              const parsed = JSON.parse(authStorage);
              refreshToken = parsed?.state?.refreshToken;
            } catch (e) {
              console.error('Failed to parse auth-storage:', e);
            }
          }
        }

        if (refreshToken) {
          try {
            // 토큰 갱신 시도 (Hub 인증 서버 사용 - SSO 토큰은 Hub에서만 갱신 가능)
            const hubBaseUrl = env.isDevelopment ? '/api-hub' : env.apiUrlHub;
            const response = await axios.post(hubBaseUrl + '/auth/refresh', {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            // 1. 직접 저장 (SSO 및 token-manager에서 사용)
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken || refreshToken);

            // 2. auth-storage에도 저장 (fallback 호환성)
            const currentStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            const updatedStorage = {
              ...currentStorage,
              state: {
                ...currentStorage.state,
                accessToken,
                refreshToken: newRefreshToken || refreshToken,
                tokenExpiry: Math.floor(Date.now() / 1000) + 7200, // 2시간
              }
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedStorage));

            // 대기 중인 요청들에 새 토큰 전달
            onRefreshed(accessToken);
            isRefreshing = false;

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClientInstance(originalRequest);
          } catch (refreshError) {
            // 토큰 갱신 실패 시 로그아웃 처리
            isRefreshing = false;
            clearTokens();
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        } else {
          // refreshToken이 없으면 로그인 페이지로
          isRefreshing = false;
          clearTokens();
          window.location.href = '/auth/login';
        }
      }

      return Promise.reject(error);
    },
  );
};

/*
 * ============================================
 * Spring 백엔드 인터셉터 (더 이상 사용하지 않음)
 * 2024-12 NestJS로 완전 마이그레이션 완료
 * ============================================
 */

// const createSpringApiInterceptors = (apiClientInstance) => {
//   apiClientInstance.interceptors.request.use(
//     (config) => {
//       if (config.data) {
//         config.data = decamelizeKeys(config.data);
//       }
//       return config;
//     },
//     (error) => Promise.reject(error),
//   );
//   apiClientInstance.interceptors.response.use(
//     (response) => {
//       if (response.data && typeof response.data === "object" && !(response.data instanceof Blob)) {
//         response.data = camelizeKeys(response.data);
//       }
//       return response;
//     },
//     async (error) => { ... }
//   );
// };

/*
 * Spring 백엔드용 Axios 인스턴스 (더 이상 사용하지 않음)
 */
// export const springApiClient = axios.create({
//   baseURL: getBaseUrl('spring'),
//   headers: { "Content-Type": "application/json" },
// });

// 하위 호환성을 위해 nestApiClient를 springApiClient로도 export
export const springApiClient = null; // deprecated - 사용하지 마세요

// Nest.js 백엔드용 Axios 인스턴스
export const nestApiClient = axios.create({
  baseURL: getBaseUrl('nest'), // 환경에 따라 동적 설정
  headers: {
    "Content-Type": "application/json",
  },
});

// 인터셉터 적용
// Spring은 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
// createSpringApiInterceptors(springApiClient);
createNestApiInterceptors(nestApiClient);      // NestJS: camelCase 유지

// 기존 코드와의 호환성을 위해 apiClient를 nestApiClient로 기본 export
// 점진적으로 apiClient -> nestApiClient 또는 springApiClient로 변경해야 함
export default nestApiClient;
