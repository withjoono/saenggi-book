/**
 * 날짜 관련 타입 및 유틸리티
 */

/**
 * 날짜 범위
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * 날짜 문자열 포맷
 */
export type DateString = string; // YYYY-MM-DD
export type DateTimeString = string; // YYYY-MM-DD HH:mm:ss
export type TimeString = string; // HH:mm:ss
export type YearMonthString = string; // YYYYMM
export type CompactDateString = string; // YYYYMMDD

/**
 * 날짜 포맷 변환 유틸리티
 */
export function formatDate(date: Date): DateString {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): DateTimeString {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export function formatCompactDate(date: Date): CompactDateString {
  return formatDate(date).replace(/-/g, '');
}

export function parseCompactDate(compact: CompactDateString): Date {
  const year = parseInt(compact.substring(0, 4), 10);
  const month = parseInt(compact.substring(4, 6), 10) - 1;
  const day = parseInt(compact.substring(6, 8), 10);
  return new Date(year, month, day);
}

/**
 * 날짜 유효성 검사
 */
export function isValidDateRange(range: DateRange): boolean {
  return range.startDate <= range.endDate;
}

/**
 * 오늘 기준 날짜 범위 생성
 */
export function getTodayRange(): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { startDate: today, endDate: tomorrow };
}

/**
 * 이번 주 날짜 범위 생성
 */
export function getThisWeekRange(): DateRange {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);
  return { startDate, endDate };
}

/**
 * 이번 달 날짜 범위 생성
 */
export function getThisMonthRange(): DateRange {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return { startDate, endDate };
}
