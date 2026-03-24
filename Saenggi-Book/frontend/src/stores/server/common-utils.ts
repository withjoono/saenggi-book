import { AxiosError, AxiosRequestConfig } from "axios";
import { BaseResponse } from "./common-interface";
import { nestApiClient } from "./api-client"; // Spring은 더 이상 사용하지 않음
import { useMutation } from "@tanstack/react-query";
import { getAccessToken, setAccessToken, clearTokens } from "@/lib/api/token-manager";

// API 클라이언트 타입 상수
// Note: Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
export const API_CLIENT = {
  NEST: 'nest',
  SPRING: 'spring', // deprecated - NEST로 fallback됨
} as const;

export type ApiClientType = typeof API_CLIENT[keyof typeof API_CLIENT];

// 토큰 함수들 - token-manager를 통한 중앙 집중식 토큰 관리
export const getAuthToken = () => {
  return getAccessToken();
};

export const setAuthToken = (token: string) => {
  setAccessToken(token);
};

export const removeAuthToken = () => {
  clearTokens();
};

export const handleApiError = <T = never>(e: unknown, suppressLog = false): BaseResponse<T> => {
  // 생기부 관련 500 에러는 데이터가 없을 때 정상적으로 발생할 수 있으므로 로그 억제
  const shouldSuppressLog = suppressLog || (
    e instanceof AxiosError &&
    e.response?.status === 500 &&
    e.config?.url?.includes('/schoolrecord/')
  );

  if (!shouldSuppressLog) {
    console.error("API Error:", e);
  }

  if (e instanceof AxiosError) {
    return {
      success: false,
      error: e.response?.data?.message || e.message || "An error occurred",
    };
  }

  return {
    success: false,
    error: e instanceof Error ? e.message : "An unknown error occurred",
  };
};

// 공개 API 엔드포인트 목록 (인증 없이 접근 가능)
const PUBLIC_ENDPOINTS = [
  '/auth/login/email',
  '/auth/login/oauth2',
  '/auth/register/email',
  '/auth/register/oauth2',
  '/auth/password-reset/request',
  '/auth/password-reset/verify',
  '/auth/password-reset/confirm',
  '/auth/refresh',
  '/sms/auth/send',
  '/sms/auth/verify',
  '/store/available',

];

// URL이 공개 엔드포인트인지 확인
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// 인증 페이지 체크
const isAuthPage = (pathname: string): boolean => {
  const AUTH_PAGES = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/test/auth-me',
  ];
  return AUTH_PAGES.some(page => pathname === page);
};

// 401 에러 처리 (Unauthorized)
const handleUnauthorized = (url: string): void => {
  // 공개 API에서는 리다이렉트하지 않음
  if (isPublicEndpoint(url)) {
    console.warn('🌐 공개 API에서 401 에러 발생 (리다이렉트 안 함):', url);
    return;
  }

  // 토큰 제거
  removeAuthToken();

  // 인증 페이지가 아닐 때만 로그인 페이지로 리다이렉트
  if (!isAuthPage(window.location.pathname)) {
    console.info('🔒 인증 필요 - 로그인 페이지로 리다이렉트');
    window.location.href = '/auth/login';
  }
};

export const makeApiCall = async <T, R>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  url: string,
  body?: T,
  config?: AxiosRequestConfig,
  _apiClientType: ApiClientType = API_CLIENT.NEST,
): Promise<BaseResponse<R>> => {
  // 요청 설정 구성
  const requestConfig = {
    url,
    method,
    data: body,
    ...config,
  };

  // localStorage에서 토큰 가져오기
  const token = getAuthToken();

  if (token) {
    requestConfig.headers = {
      ...requestConfig.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    // Spring은 더 이상 사용하지 않음 - 모든 요청은 NestJS로 전송
    const client = nestApiClient;
    const res = await client.request<BaseResponse<R>>(requestConfig);
    return res.data;
  } catch (e) {
    // 401 에러 처리
    if (e instanceof AxiosError && e.response?.status === 401) {
      handleUnauthorized(url);
    }
    return handleApiError(e);
  }
};

export const useCreateMutation = <T, R>(
  method: "POST" | "PATCH" | "DELETE",
  url: string,
  onSuccessCallback?: (data: BaseResponse<R>) => void,
  apiClientType: ApiClientType = API_CLIENT.NEST,
) => {
  return useMutation({
    mutationFn: (body: T) => makeApiCall<T, R>(method, url, body, undefined, apiClientType),
    onSuccess: onSuccessCallback,
    onError: (e) => {
      if (e instanceof Error) {
        console.error("예상치 못한 에러 발생", e);
      }
    },
  });
};

// 기존 코드 호환성을 위한 alias
export const createMutation = useCreateMutation;
