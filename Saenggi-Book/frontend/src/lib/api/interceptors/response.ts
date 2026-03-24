/**
 * Response 인터셉터
 * Reference 프로젝트의 패턴 적용
 */

import { AxiosResponse } from 'axios';
import { camelizeKeys } from 'humps';

/**
 * 성공 Response 인터셉터
 * - 응답 데이터를 camelCase로 변환
 */
export const authResponseInterceptor = (
  response: AxiosResponse,
): AxiosResponse => {
  // Response 데이터를 camelCase로 변환
  if (
    response.data &&
    typeof response.data === 'object' &&
    !(response.data instanceof Blob)
  ) {
    response.data = camelizeKeys(response.data);
  }
  return response;
};

// 에러 Response 인터셉터는 token-refresh.ts에서 처리
