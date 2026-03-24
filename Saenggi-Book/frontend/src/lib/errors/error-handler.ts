/**
 * 에러 처리 핸들러
 * Reference 프로젝트의 에러 처리 패턴 적용
 */

import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS_TO_ERROR_CODE,
  ErrorCode,
} from './error-codes';

interface ApiErrorResponse {
  message?: string;
  detailCode?: ErrorCode;
  status?: boolean;
}

/**
 * API 에러 처리
 * - 에러 코드에 따라 적절한 메시지 표시
 * - 필요한 경우 특별한 처리 수행
 */
export const handleApiError = (error: unknown): void => {
  if (!(error instanceof AxiosError)) {
    // Axios 에러가 아닌 경우 (네트워크 에러 등)
    toast.error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
    return;
  }

  const response = error.response;
  if (!response) {
    toast.error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  const data = response.data as ApiErrorResponse;
  const errorCode = data?.detailCode;
  const statusCode = response.status;

  // 에러 코드가 있는 경우
  if (errorCode) {
    const message = data.message || ERROR_MESSAGES[errorCode] || '오류가 발생했습니다.';

    // 401 에러는 인터셉터에서 처리하므로 토스트 표시 안함
    if (
      errorCode !== ERROR_CODES.TOKEN_EXPIRED &&
      errorCode !== ERROR_CODES.INVALID_TOKEN &&
      errorCode !== ERROR_CODES.SESSION_EXPIRED
    ) {
      toast.error(message);
    }

    return;
  }

  // 에러 코드가 없는 경우 HTTP 상태 코드로 매핑
  const mappedErrorCode = HTTP_STATUS_TO_ERROR_CODE[statusCode];
  if (mappedErrorCode) {
    const message = data.message || ERROR_MESSAGES[mappedErrorCode];
    toast.error(message);
    return;
  }

  // 그 외의 경우
  toast.error(data.message || '오류가 발생했습니다.');
};

/**
 * 에러 메시지 추출
 * toast 표시 없이 에러 메시지만 반환
 */
export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof AxiosError)) {
    return '네트워크 오류가 발생했습니다.';
  }

  const response = error.response;
  if (!response) {
    return '서버에 연결할 수 없습니다.';
  }

  const data = response.data as ApiErrorResponse;
  const errorCode = data?.detailCode;
  const statusCode = response.status;

  // 에러 코드가 있는 경우
  if (errorCode) {
    return data.message || ERROR_MESSAGES[errorCode] || '오류가 발생했습니다.';
  }

  // 에러 코드가 없는 경우 HTTP 상태 코드로 매핑
  const mappedErrorCode = HTTP_STATUS_TO_ERROR_CODE[statusCode];
  if (mappedErrorCode) {
    return data.message || ERROR_MESSAGES[mappedErrorCode];
  }

  return data.message || '오류가 발생했습니다.';
};
