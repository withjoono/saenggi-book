/**
 * 인터셉터 설정
 * authClient에 모든 인터셉터 적용
 */

import { authClient } from '../instances';
import {
  authRequestInterceptor,
  authRequestErrorInterceptor,
} from './request';
import { authResponseInterceptor } from './response';
import { authResponseErrorInterceptor } from './token-refresh';

/**
 * authClient에 인터셉터 설정
 * 애플리케이션 시작 시 한 번만 호출
 */
export const setupInterceptors = () => {
  // Request 인터셉터
  authClient.interceptors.request.use(
    authRequestInterceptor,
    authRequestErrorInterceptor,
  );

  // Response 인터셉터
  authClient.interceptors.response.use(
    authResponseInterceptor,
    authResponseErrorInterceptor,
  );
};
