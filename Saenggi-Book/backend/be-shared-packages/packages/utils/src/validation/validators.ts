/**
 * 검증 유틸리티
 */

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 한국 휴대폰 번호 검증
 */
export function isValidKoreanPhone(phone: string): boolean {
  // 010-1234-5678 또는 01012345678 형식
  const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 비밀번호 강도 검증
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  } = {},
): PasswordValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다.');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다.');
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push('숫자를 포함해야 합니다.');
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 닉네임 검증
 */
export function isValidNickname(nickname: string): boolean {
  // 2-20자, 한글/영문/숫자만 허용
  const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,20}$/;
  return nicknameRegex.test(nickname);
}

/**
 * 날짜 형식 검증 (YYYYMMDD)
 */
export function isValidCompactDate(date: string): boolean {
  if (!/^\d{8}$/.test(date)) return false;

  const year = parseInt(date.substring(0, 4), 10);
  const month = parseInt(date.substring(4, 6), 10);
  const day = parseInt(date.substring(6, 8), 10);

  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * URL 검증
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 빈 문자열 또는 공백만 있는지 검증
 */
export function isBlank(str: string | null | undefined): boolean {
  return str === null || str === undefined || str.trim().length === 0;
}

/**
 * 빈 문자열이 아닌지 검증
 */
export function isNotBlank(str: string | null | undefined): str is string {
  return !isBlank(str);
}
