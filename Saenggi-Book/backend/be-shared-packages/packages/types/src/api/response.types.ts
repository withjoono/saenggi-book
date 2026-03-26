/**
 * API 응답 타입 정의
 */

/**
 * 기본 API 응답 형식
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

/**
 * 성공 응답
 */
export interface SuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * 에러 응답
 */
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * API 응답 헬퍼 함수 타입
 */
export type CreateSuccessResponse = <T>(data: T) => SuccessResponse<T>;
export type CreateErrorResponse = (
  message: string,
  statusCode: number,
  error?: string,
) => ErrorResponse;
