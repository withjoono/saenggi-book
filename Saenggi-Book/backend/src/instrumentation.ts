import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Sentry 초기화 - 애플리케이션 시작 전에 실행됨
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',

  // 성능 모니터링 설정
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 프로파일링 설정
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  integrations: [
    // Node.js 프로파일링 통합
    nodeProfilingIntegration(),
  ],

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',

  // 환경별 추가 설정
  beforeSend(event, hint) {
    // 개발 환경에서는 콘솔에 에러 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Event:', event);
      console.error('Hint:', hint);
    }
    return event;
  },
});
