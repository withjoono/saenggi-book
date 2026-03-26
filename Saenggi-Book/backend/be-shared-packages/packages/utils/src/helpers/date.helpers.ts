/**
 * 날짜 헬퍼 함수
 */

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 날짜를 YYYYMMDD 형식으로 포맷
 */
export function formatCompactDate(date: Date | string): string {
  return formatDate(date).replace(/-/g, '');
}

/**
 * 날짜를 YYYY-MM-DD HH:mm:ss 형식으로 포맷
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * 날짜를 한국 시간대로 포맷
 */
export function formatKoreanDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 날짜를 한국 시간대로 포맷 (시간 포함)
 */
export function formatKoreanDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * YYYYMMDD 형식 문자열을 Date로 변환
 */
export function parseCompactDate(compact: string): Date {
  if (compact.length !== 8) {
    throw new Error('Invalid compact date format. Expected YYYYMMDD.');
  }
  const year = parseInt(compact.substring(0, 4), 10);
  const month = parseInt(compact.substring(4, 6), 10) - 1;
  const day = parseInt(compact.substring(6, 8), 10);
  return new Date(year, month, day);
}

/**
 * 날짜 차이 계산 (일수)
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 날짜에 일수 더하기
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 날짜에 월 더하기
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * 오늘 시작 시간 (00:00:00)
 */
export function startOfDay(date?: Date | string): Date {
  const d = date ? (typeof date === 'string' ? new Date(date) : new Date(date)) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 오늘 끝 시간 (23:59:59.999)
 */
export function endOfDay(date?: Date | string): Date {
  const d = date ? (typeof date === 'string' ? new Date(date) : new Date(date)) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 이번 주 시작 (일요일)
 */
export function startOfWeek(date?: Date | string): Date {
  const d = date ? (typeof date === 'string' ? new Date(date) : new Date(date)) : new Date();
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek);
  return startOfDay(d);
}

/**
 * 이번 주 끝 (토요일)
 */
export function endOfWeek(date?: Date | string): Date {
  const d = date ? (typeof date === 'string' ? new Date(date) : new Date(date)) : new Date();
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() + (6 - dayOfWeek));
  return endOfDay(d);
}

/**
 * 이번 달 시작
 */
export function startOfMonth(date?: Date | string): Date {
  const d = date ? (typeof date === 'string' ? new Date(date) : new Date(date)) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * 이번 달 끝
 */
export function endOfMonth(date?: Date | string): Date {
  const d = date ? (typeof date === 'string' ? new Date(date) : new Date(date)) : new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * 과거 날짜인지 확인
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * 미래 날짜인지 확인
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

/**
 * 오늘인지 확인
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}
