/**
 * GCP 모니터링 및 로깅 유틸리티
 * 
 * Firebase Analytics, Cloud Logging 등을 통합 관리합니다.
 */

import { env } from '@/lib/config/env';
import * as Sentry from '@sentry/react';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface _LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

/**
 * GCP Cloud Logging으로 로그 전송
 * 프로덕션 환경에서만 작동
 */
export const logToGCP = (
  level: LogLevel,
  message: string,
  data?: any,
): void => {

  // 개발 환경에서는 콘솔에만 출력
  if (env.isDevelopment) {
    console[level](message, data);
    return;
  }

  // 프로덕션 환경에서는 Sentry로 전송
  if (env.isProduction) {
    if (level === 'error') {
      Sentry.captureException(new Error(message), {
        extra: data,
      });
    } else {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        extra: data,
      });
    }
  }
};

/**
 * 성능 메트릭 추적
 * Firebase Performance Monitoring 또는 Cloud Monitoring 사용
 */
export const trackPerformance = (
  metricName: string,
  value: number,
  attributes?: Record<string, string | number>,
): void => {
  if (env.isDevelopment) {
    console.debug(`Performance: ${metricName}`, value, attributes);
    return;
  }

  // Firebase Performance Monitoring
  // 또는 GCP Cloud Monitoring으로 전송
  // 실제 구현은 Firebase SDK를 사용
};

/**
 * 사용자 이벤트 추적
 * Firebase Analytics 사용
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>,
): void => {
  if (env.isDevelopment) {
    console.log(`Event: ${eventName}`, parameters);
    return;
  }

  // Firebase Analytics로 이벤트 전송
  // window.gtag 또는 Firebase Analytics SDK 사용
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

/**
 * 에러 추적
 * Sentry와 통합
 */
export const trackError = (
  error: Error,
  context?: Record<string, any>,
): void => {
  logToGCP('error', error.message, {
    stack: error.stack,
    ...context,
  });

  if (env.isProduction) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

/**
 * API 호출 추적
 */
export const trackApiCall = (
  endpoint: string,
  method: string,
  duration: number,
  status: number,
): void => {
  trackPerformance('api_call_duration', duration, {
    endpoint,
    method,
    status: status.toString(),
  });

  if (status >= 400) {
    logToGCP('warn', `API call failed: ${method} ${endpoint}`, {
      status,
      duration,
    });
  }
};

/**
 * 페이지 뷰 추적
 */
export const trackPageView = (
  pagePath: string,
  pageTitle?: string,
): void => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
};

/**
 * 사용자 액션 추적
 */
export const trackUserAction = (
  action: string,
  category: string,
  label?: string,
  value?: number,
): void => {
  trackEvent('user_action', {
    action,
    category,
    label,
    value,
  });
};

/**
 * 세션 시작 추적
 */
export const trackSessionStart = (userId?: string): void => {
  trackEvent('session_start', {
    user_id: userId,
    timestamp: Date.now(),
  });
};

/**
 * 세션 종료 추적
 */
export const trackSessionEnd = (duration: number): void => {
  trackEvent('session_end', {
    duration,
    timestamp: Date.now(),
  });
};

export default {
  logToGCP,
  trackPerformance,
  trackEvent,
  trackError,
  trackApiCall,
  trackPageView,
  trackUserAction,
  trackSessionStart,
  trackSessionEnd,
};
