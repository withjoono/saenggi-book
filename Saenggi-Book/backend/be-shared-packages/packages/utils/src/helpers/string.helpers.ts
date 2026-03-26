/**
 * 문자열 헬퍼 함수
 */

/**
 * camelCase를 snake_case로 변환
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * snake_case를 camelCase로 변환
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 첫 글자 대문자
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 첫 글자 소문자
 */
export function uncapitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * 문자열 자르기 (말줄임표 추가)
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 전화번호 포맷팅 (010-1234-5678)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * 이메일 마스킹 (te***@example.com)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal =
    local.length <= 2 ? '*'.repeat(local.length) : local.slice(0, 2) + '*'.repeat(local.length - 2);
  return `${maskedLocal}@${domain}`;
}

/**
 * 전화번호 마스킹 (010-****-5678)
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 8) {
    const start = cleaned.slice(0, 3);
    const end = cleaned.slice(-4);
    return `${start}-****-${end}`;
  }
  return phone;
}

/**
 * 랜덤 문자열 생성
 */
export function generateRandomString(length: number, chars?: string): string {
  const defaultChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charset = chars || defaultChars;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * UUID 형식 문자열 생성 (v4 스타일)
 */
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 슬러그 생성 (URL-safe 문자열)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
