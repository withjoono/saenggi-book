/**
 * API 에러 코드 정의
 * Reference 프로젝트의 에러 코드 시스템 적용
 */

export const ERROR_CODES = {
  // 인증 관련
  TOKEN_EXPIRED: 'C401',        // 토큰 만료 → 자동 갱신 시도
  INVALID_TOKEN: 'C999',        // 유효하지 않은 토큰 → 로그아웃
  SESSION_EXPIRED: 'C5050',     // 세션 만료 → 로그아웃

  // 권한 관련
  UNAUTHORIZED: 'C403',         // 권한 없음

  // 서버 에러
  SERVER_ERROR: 'C500',         // 서버 내부 에러
  SERVICE_UNAVAILABLE: 'C503',  // 서비스 이용 불가

  // 비즈니스 로직 에러
  VALIDATION_ERROR: 'C400',     // 유효성 검사 실패
  NOT_FOUND: 'C404',            // 리소스 없음
  CONFLICT: 'C409',             // 충돌 (중복 등)
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * 에러 메시지 매핑
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.TOKEN_EXPIRED]: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
  [ERROR_CODES.INVALID_TOKEN]: '유효하지 않은 인증 정보입니다. 다시 로그인해주세요.',
  [ERROR_CODES.SESSION_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해주세요.',
  [ERROR_CODES.UNAUTHORIZED]: '접근 권한이 없습니다.',
  [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 이용할 수 없습니다.',
  [ERROR_CODES.VALIDATION_ERROR]: '입력 정보를 확인해주세요.',
  [ERROR_CODES.NOT_FOUND]: '요청하신 정보를 찾을 수 없습니다.',
  [ERROR_CODES.CONFLICT]: '이미 존재하는 정보입니다.',
};

/**
 * HTTP 상태 코드를 에러 코드로 매핑
 */
export const HTTP_STATUS_TO_ERROR_CODE: Record<number, ErrorCode> = {
  400: ERROR_CODES.VALIDATION_ERROR,
  401: ERROR_CODES.TOKEN_EXPIRED,
  403: ERROR_CODES.UNAUTHORIZED,
  404: ERROR_CODES.NOT_FOUND,
  409: ERROR_CODES.CONFLICT,
  500: ERROR_CODES.SERVER_ERROR,
  503: ERROR_CODES.SERVICE_UNAVAILABLE,
};
