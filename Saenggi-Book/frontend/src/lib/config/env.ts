/**
 * 환경 변수 중앙 관리
 * 
 * 모든 환경 변수를 타입 안전하게 관리합니다.
 * import.meta.env를 직접 사용하지 말고 이 파일을 통해 접근하세요.
 */

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

interface GCPConfig {
  storageBucket?: string;
  cdnUrl?: string;
}

interface EnvConfig {
  // 프론트엔드 URL
  frontUrl: string;

  // 백엔드 API URL (Susi-back)
  // 비즈니스 로직 API 호출
  apiUrlNest: string;

  // Hub 프론트엔드 URL (전체 서비스로 돌아가기 버튼용)
  hubUrl: string;

  // Hub 인증 서버 URL (GB-Back-Nest, 포트 4000)
  // 로그인/회원가입 등 인증 관련 API 호출
  apiUrlHub: string;

  // 소셜 로그인
  naverLoginClientId: string;
  googleClientId: string;

  // Firebase
  firebase: FirebaseConfig;

  // GCP
  gcp: GCPConfig;

  // 환경
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value;
};

// 개발 환경에서는 Vite 프록시 사용 (CORS 해결)
const isDev = import.meta.env.DEV;

export const env: EnvConfig = {
  // 프론트엔드 URL
  frontUrl: getEnvVar('VITE_FRONT_URL', 'http://localhost:3001'),

  // Susi 백엔드 API URL (개발: 프록시, 프로덕션: 직접 연결)
  apiUrlNest: isDev ? '/api-nest' : getEnvVar('VITE_API_URL_NEST', 'http://localhost:4001'),

  // Hub 프론트엔드 URL (전체 서비스로 돌아가기 버튼용)
  hubUrl: getEnvVar('VITE_HUB_URL', 'http://localhost:3000'),

  // Hub 인증 서버 URL (개발: 프록시, 프로덕션: 직접 연결)
  apiUrlHub: isDev ? '/api-hub' : getEnvVar('VITE_API_URL_HUB', 'http://localhost:4000'),
  
  // 소셜 로그인
  naverLoginClientId: getEnvVar('VITE_NAVER_LOGIN_CLIENT_ID'),
  googleClientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
  
  // Firebase
  firebase: {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID'),
    measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID'),
  },
  
  // GCP
  gcp: {
    storageBucket: import.meta.env.VITE_GCP_STORAGE_BUCKET,
    cdnUrl: import.meta.env.VITE_GCP_CDN_URL,
  },
  
  // 환경
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
};

// 개발 환경에서 환경 변수 로깅 (디버깅용)
if (env.isDevelopment) {
  console.log('Environment Configuration:', {
    mode: import.meta.env.MODE,
    frontUrl: env.frontUrl,
    apiUrlNest: env.apiUrlNest, // Susi 백엔드
    hubUrl: env.hubUrl, // Hub 프론트엔드 (전체 서비스)
    apiUrlHub: env.apiUrlHub, // Hub 인증 서버
  });
}

export default env;
