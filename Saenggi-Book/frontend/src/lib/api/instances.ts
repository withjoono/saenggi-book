/**
 * Axios 인스턴스 설정
 * Reference 프로젝트의 인스턴스 패턴 적용
 * - publicClient: 인증 불필요 (로그인, 회원가입 등)
 * - authClient: 인증 필요 (모든 인증된 API)
 *
 * Note: Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
 */

import axios from 'axios';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { env } from '@/lib/config/env';

/**
 * Public API Client (인증 불필요) - NestJS 백엔드
 * - 로그인, 회원가입, 공개 데이터 등
 */
export const publicClient = axios.create({
  baseURL: env.apiUrlNest,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Authenticated API Client (인증 필요) - NestJS 백엔드
 * - 모든 인증된 API 요청
 */
export const authClient = axios.create({
  baseURL: env.apiUrlNest,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/*
 * ============================================
 * Spring 백엔드 클라이언트 (더 이상 사용하지 않음)
 * 2024-12 NestJS로 완전 마이그레이션 완료
 * ============================================
 */

// /**
//  * Spring Public API Client (인증 불필요) - Spring 백엔드
//  * - 파일 업로드, 생기부 파싱 등
//  */
// export const springPublicClient = axios.create({
//   baseURL: env.apiUrlSpring,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// /**
//  * Spring Authenticated API Client (인증 필요) - Spring 백엔드
//  * - Spring 백엔드의 인증된 API
//  */
// export const springAuthClient = axios.create({
//   baseURL: env.apiUrlSpring,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

/**
 * 케이스 변환 인터셉터 (publicClient)
 */
publicClient.interceptors.request.use(
  (config) => {
    // Request 데이터를 snake_case로 변환
    if (config.data) {
      config.data = decamelizeKeys(config.data);
    }
    if (config.params) {
      config.params = decamelizeKeys(config.params);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

publicClient.interceptors.response.use(
  (response) => {
    // Response 데이터를 camelCase로 변환
    if (
      response.data &&
      typeof response.data === 'object' &&
      !(response.data instanceof Blob)
    ) {
      response.data = camelizeKeys(response.data);
    }
    return response;
  },
  (error) => {
    // 에러 응답도 camelCase로 변환
    if (error.response?.data) {
      error.response.data = camelizeKeys(error.response.data);
    }
    return Promise.reject(error);
  },
);

/**
 * 케이스 변환 인터셉터 (authClient)
 * NestJS 백엔드는 camelCase를 기대하므로 request는 변환하지 않음
 */
authClient.interceptors.request.use(
  (config) => {
    // NestJS는 camelCase를 기대하므로 변환하지 않음
    return config;
  },
  (error) => Promise.reject(error),
);

authClient.interceptors.response.use(
  (response) => {
    // Response 데이터를 camelCase로 변환
    if (
      response.data &&
      typeof response.data === 'object' &&
      !(response.data instanceof Blob)
    ) {
      response.data = camelizeKeys(response.data);
    }
    return response;
  },
  (error) => {
    // 에러 응답도 camelCase로 변환
    if (error.response?.data) {
      error.response.data = camelizeKeys(error.response.data);
    }
    return Promise.reject(error);
  },
);

/*
 * ============================================
 * Spring 클라이언트 인터셉터 (더 이상 사용하지 않음)
 * 2024-12 NestJS로 완전 마이그레이션 완료
 * ============================================
 */

// springPublicClient.interceptors.request.use(
//   (config) => {
//     if (config.data) {
//       config.data = decamelizeKeys(config.data);
//     }
//     if (config.params) {
//       config.params = decamelizeKeys(config.params);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// springPublicClient.interceptors.response.use(
//   (response) => {
//     if (
//       response.data &&
//       typeof response.data === 'object' &&
//       !(response.data instanceof Blob)
//     ) {
//       response.data = camelizeKeys(response.data);
//     }
//     return response;
//   },
//   (error) => {
//     if (error.response?.data) {
//       error.response.data = camelizeKeys(error.response.data);
//     }
//     return Promise.reject(error);
//   },
// );

// springAuthClient.interceptors.request.use(
//   (config) => {
//     if (config.data) {
//       config.data = decamelizeKeys(config.data);
//     }
//     if (config.params) {
//       config.params = decamelizeKeys(config.params);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// springAuthClient.interceptors.response.use(
//   (response) => {
//     if (
//       response.data &&
//       typeof response.data === 'object' &&
//       !(response.data instanceof Blob)
//     ) {
//       response.data = camelizeKeys(response.data);
//     }
//     return response;
//   },
//   (error) => {
//     if (error.response?.data) {
//       error.response.data = camelizeKeys(error.response.data);
//     }
//     return Promise.reject(error);
//   },
// );

// authClient, springAuthClient의 인증 인터셉터는 별도 파일에서 설정 (순환 참조 방지)
// src/lib/api/interceptors/ 에서 설정
