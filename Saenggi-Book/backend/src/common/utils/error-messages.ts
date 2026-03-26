export const STATUS_MESSAGES = {
  STATUS: {
    NOT_FOUND: 'Not Found',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    UNAUTHORIZED: 'Unauthorized',
    BAD_REQUEST: 'Bad Request',
    FORBIDDEN: 'Forbidden',
    VALIDATION: 'Validation Error',
  },
  ERROR: {
    INTERNAL_SERVER_ERROR: '문제가 발생했습니다. 나중에 다시 시도해주세요.',
    OPERATION_FAILED: '작업에 실패했습니다. 다시 시도해주세요.',
  },
  AUTH: {
    INVALID_TOKEN: '토큰이 유효하지 않거나 만료 되었습니다. 로그인 해주세요.',
    UNAUTHORIZED: '접근이 거부되었습니다. 로그인 해주세요.',
    FORBIDDEN: '이 작업을 수행할 권한이 없습니다.',
  },
  MEMBER: {
    ACCOUNT_NOT_FOUND: '계정을 찾을 수 없습니다.',
    EMAIL_ALREADY_EXISTS: '이 이메일로 등록된 계정이 이미 존재합니다.',
    PROVIDER_MISMATCH: '간편 로그인 계정이 존재합니다.',
    NO_PASSWORD: '비밀번호가 일치하지 않습니다.',
    PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  },
  VALIDATION: {
    NO_CONTENT: '변경할 내용이 없습니다.',
  },
};
