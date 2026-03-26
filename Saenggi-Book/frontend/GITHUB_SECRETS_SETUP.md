# GitHub Secrets 설정 가이드

Firebase Hosting 자동 배포를 위한 GitHub Secrets 설정 방법입니다.

## 필수 Secrets

GitHub 리포지토리 Settings > Secrets and variables > Actions에서 다음 secrets를 추가해야 합니다:

### Firebase 관련
- `FIREBASE_SERVICE_ACCOUNT`: Firebase 서비스 계정 키 (JSON)
  - Firebase Console > Project Settings > Service Accounts에서 생성
  - "Generate new private key" 클릭 후 전체 JSON 내용 복사

### 환경 변수
- `VITE_NAVER_LOGIN_CLIENT_ID`: 네이버 로그인 클라이언트 ID
- `VITE_GOOGLE_CLIENT_ID`: 구글 로그인 클라이언트 ID

### Firebase 설정
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### 백엔드 API URL
#### 프로덕션
- `VITE_API_URL_SPRING`: Spring 백엔드 프로덕션 URL
- `VITE_API_URL_NEST`: NestJS 백엔드 프로덕션 URL

#### 개발/미리보기
- `VITE_API_URL_SPRING_DEV`: Spring 백엔드 개발 URL
- `VITE_API_URL_NEST_DEV`: NestJS 백엔드 개발 URL

## Secrets 추가 방법

1. GitHub 리포지토리 페이지 이동
2. Settings > Secrets and variables > Actions 클릭
3. "New repository secret" 클릭
4. Name과 Value 입력 후 "Add secret" 클릭

## Firebase 서비스 계정 키 생성

1. Firebase Console (https://console.firebase.google.com/) 접속
2. 프로젝트 선택 (g-frontend)
3. 프로젝트 설정 (톱니바퀴 아이콘) > Service accounts
4. "Generate new private key" 클릭
5. 다운로드된 JSON 파일 내용 전체를 `FIREBASE_SERVICE_ACCOUNT` secret에 추가

## 워크플로우

### 자동 배포
- `main` 브랜치에 push 시 자동으로 프로덕션 배포
- Pull Request 생성 시 미리보기 환경 자동 배포

### 수동 배포
```bash
# 로컬에서 프로덕션 배포
npm run deploy:firebase:prod

# 로컬에서 스테이징 배포
npm run deploy:firebase:staging
```

## 주의사항

- `.env` 파일은 절대 커밋하지 마세요
- 모든 민감한 정보는 GitHub Secrets에 저장
- Firebase 서비스 계정 키는 안전하게 보관
