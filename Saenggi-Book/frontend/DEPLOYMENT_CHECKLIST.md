# 🚀 배포 체크리스트

Firebase Hosting 배포를 위한 단계별 가이드입니다.

## ✅ 사전 준비 (한 번만 수행)

### 1. Firebase CLI 설치
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 확인
firebase projects:list
```

**예상 결과**:
```
✔ Firebase CLI 설치 완료
✔ 로그인 성공
✔ ts-front-479305 프로젝트 확인됨
```

---

### 2. GitHub Secrets 설정

GitHub 리포지토리 > Settings > Secrets and variables > Actions에서 다음 secrets 추가:

#### 필수 Secrets

**Firebase 서비스 계정**:
```
FIREBASE_SERVICE_ACCOUNT
```
- Firebase Console → 프로젝트 설정 → 서비스 계정
- "새 비공개 키 생성" 클릭
- 다운로드된 JSON 파일 전체 내용 복사하여 추가

**환경 변수**:
```
VITE_NAVER_LOGIN_CLIENT_ID=your-naver-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id

VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=ts-front-479305.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ts-front-479305
VITE_FIREBASE_STORAGE_BUCKET=ts-front-479305.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**백엔드 URL (프로덕션)**:
```
VITE_API_URL_SPRING=https://your-spring-backend.run.app
VITE_API_URL_NEST=https://your-nest-backend.run.app
```

**백엔드 URL (개발/미리보기)**:
```
VITE_API_URL_SPRING_DEV=https://your-dev-spring-backend.run.app
VITE_API_URL_NEST_DEV=https://your-dev-nest-backend.run.app
```

#### Secrets 추가 방법
1. GitHub 리포지토리 페이지 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. Name과 Value 입력 후 "Add secret"

---

### 3. 백엔드 CORS 설정 확인

백엔드(Cloud Run)에서 CORS를 허용해야 합니다:

**NestJS 백엔드**:
```typescript
// main.ts
app.enableCors({
  origin: [
    'https://ts-front-479305.web.app',           // Firebase Hosting
    'https://ts-front-479305.firebaseapp.com',   // Firebase 기본 도메인
    'http://localhost:3000',                // 로컬 개발
  ],
  credentials: true,
});
```

**Spring 백엔드**:
```java
// WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "https://ts-front-479305.web.app",
                "https://ts-front-479305.firebaseapp.com",
                "http://localhost:3000"
            )
            .allowCredentials(true);
    }
}
```

---

## 🔄 배포 방법

### 방법 1: 자동 배포 (권장)

#### main 브랜치 자동 배포
```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat: Deploy to production"

# 2. main 브랜치에 push
git push origin main
```

**GitHub Actions가 자동으로**:
1. ✅ 의존성 설치 (`npm ci`)
2. ✅ 린트 검사 (`npm run lint`)
3. ✅ 프로덕션 빌드 (`npm run build`)
4. ✅ Firebase Hosting 배포
5. ✅ 배포 완료 알림

**배포 확인**:
- GitHub Actions 탭에서 워크플로우 진행 상황 확인
- 완료 후 https://ts-front-479305.web.app 접속

#### Pull Request 미리보기
```bash
# 1. 새 브랜치 생성
git checkout -b feature/new-feature

# 2. 변경사항 커밋
git add .
git commit -m "feat: Add new feature"

# 3. push 및 PR 생성
git push origin feature/new-feature
```

**자동으로 생성되는 것**:
- ✅ PR 전용 미리보기 환경
- ✅ PR에 미리보기 URL 코멘트
- ✅ 7일 후 자동 삭제

---

### 방법 2: 수동 배포

#### 로컬에서 프로덕션 배포
```bash
# 1. 환경 변수 확인
cat .env.production

# 2. 빌드
npm run build

# 3. 배포 (프로덕션)
firebase deploy --only hosting:production

# 또는 스테이징
firebase deploy --only hosting:staging
```

#### 빌드만 테스트
```bash
# 로컬 빌드 및 미리보기
npm run build
npm run preview

# 브라우저에서 http://localhost:4173 확인
```

---

## 🧪 배포 후 검증

### 1. 기본 동작 확인
```bash
# 배포된 사이트 열기
open https://ts-front-479305.web.app
```

**확인 항목**:
- [ ] 페이지가 정상적으로 로드됨
- [ ] 로그인/회원가입 동작
- [ ] API 호출 성공 (네트워크 탭 확인)
- [ ] 이미지 및 리소스 로드

### 2. 성능 확인
```bash
# Lighthouse 스코어 확인 (Chrome DevTools)
1. 개발자 도구 열기 (F12)
2. Lighthouse 탭
3. "분석 생성" 클릭
```

**목표**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 3. CORS 확인
```javascript
// 브라우저 콘솔에서 테스트
fetch('https://your-nest-backend.run.app/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**정상**: 응답 데이터 출력  
**오류**: CORS 에러 → 백엔드 CORS 설정 확인

### 4. 환경 변수 확인
```javascript
// 브라우저 콘솔에서
console.log('API URLs:', {
  spring: import.meta.env.VITE_API_URL_SPRING,
  nest: import.meta.env.VITE_API_URL_NEST,
})
```

---

## 🔥 Firebase Console 확인

### 1. Hosting 대시보드
https://console.firebase.google.com/project/ts-front-479305/hosting

**확인 사항**:
- ✅ 배포 기록
- ✅ 도메인 설정
- ✅ 트래픽 통계

### 2. 릴리스 관리
**이전 버전 롤백**:
```bash
# Firebase Console에서
Hosting → 릴리스 기록 → 이전 버전 선택 → "롤백"
```

### 3. 커스텀 도메인 (선택)
```bash
# Firebase Console에서
Hosting → 도메인 추가 → 도메인 입력 → DNS 설정
```

---

## ⚠️ 문제 해결

### 빌드 실패
```bash
# 1. 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 2. 타입 에러 확인
npx tsc --noEmit

# 3. 린트 에러 확인
npm run lint
```

### 배포 실패
```bash
# Firebase CLI 재설치
npm uninstall -g firebase-tools
npm install -g firebase-tools
firebase login
```

### CORS 에러
**증상**: API 호출 시 CORS 에러

**해결**:
1. 백엔드 CORS 설정 확인
2. Firebase Hosting 도메인 추가
3. 백엔드 재배포

### 환경 변수 누락
**증상**: `undefined` 에러

**해결**:
1. `.env.production` 파일 확인
2. GitHub Secrets 확인
3. 빌드 다시 실행

### 404 에러 (라우팅)
**증상**: 새로고침 시 404 에러

**해결**: `firebase.json`의 rewrite 설정 확인
```json
{
  "hosting": {
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

---

## 📊 모니터링

### Firebase Analytics
https://console.firebase.google.com/project/ts-front-479305/analytics

**확인 항목**:
- 사용자 수
- 페이지 뷰
- 이벤트 추적
- 오류 발생률

### Sentry (에러 모니터링)
프로덕션 에러는 Sentry로 자동 전송됩니다.

### 성능 모니터링
Firebase Performance Monitoring에서 확인:
- 페이지 로드 시간
- API 응답 시간
- 네트워크 요청

---

## 🎯 체크리스트 요약

### 사전 준비
- [ ] Firebase CLI 설치 및 로그인
- [ ] GitHub Secrets 설정 완료
- [ ] 백엔드 CORS 설정 확인
- [ ] `.env.production` 업데이트

### 배포
- [ ] 로컬 빌드 테스트 (`npm run build`)
- [ ] main 브랜치에 push (자동 배포)
- [ ] 또는 `firebase deploy` (수동 배포)

### 검증
- [ ] 사이트 정상 로드 확인
- [ ] 로그인/API 동작 확인
- [ ] CORS 에러 없음
- [ ] Lighthouse 스코어 확인

### 모니터링
- [ ] Firebase Console 배포 확인
- [ ] Analytics 데이터 수집 확인
- [ ] 에러 없음 확인

---

## 📞 문제 발생 시

1. **GitHub Actions 로그 확인**
   - 리포지토리 → Actions 탭 → 실패한 워크플로우 클릭

2. **Firebase Console 확인**
   - https://console.firebase.google.com/project/ts-front-479305

3. **브라우저 콘솔 확인**
   - F12 → Console 탭 → 에러 메시지 확인

4. **문서 참조**
   - `GCP_REFACTORING_SUMMARY.md`
   - `GITHUB_SECRETS_SETUP.md`
   - `CLAUDE.md`

---

**배포 성공을 기원합니다! 🚀**
