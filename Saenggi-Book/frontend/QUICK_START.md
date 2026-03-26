# 🚀 빠른 시작 가이드

## 1️⃣ 즉시 배포 (5분)

### GitHub Secrets 설정 (가장 중요!)

1. **GitHub 리포지토리로 이동**
   ```
   https://github.com/YOUR_USERNAME/GB-Front/settings/secrets/actions
   ```

2. **"New repository secret" 클릭**

3. **다음 secrets 추가**:

```bash
# Firebase 서비스 계정 (가장 중요!)
FIREBASE_SERVICE_ACCOUNT
→ Firebase Console에서 JSON 키 생성 후 전체 내용 복사

# 프로덕션 백엔드 URL
VITE_API_URL_SPRING
→ https://your-spring-backend.run.app

VITE_API_URL_NEST
→ https://your-nest-backend.run.app

# Firebase 설정 (현재 .env 파일의 값 사용)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID

# 소셜 로그인
VITE_NAVER_LOGIN_CLIENT_ID
VITE_GOOGLE_CLIENT_ID
```

### 배포 실행

```bash
# main 브랜치에 push
git add .
git commit -m "chore: Setup GCP deployment"
git push origin main
```

**완료!**
- GitHub Actions가 자동으로 빌드 & 배포
- 3-5분 후 https://ts-front-479305.web.app 에서 확인

---

## 2️⃣ Firebase 서비스 계정 키 생성

### 단계별 가이드

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com/project/ts-front-479305
   ```

2. **프로젝트 설정 클릭**
   - 톱니바퀴 아이콘 클릭

3. **서비스 계정 탭**
   - "서비스 계정" 탭 클릭

4. **새 키 생성**
   - "새 비공개 키 생성" 버튼 클릭
   - JSON 파일 다운로드

5. **GitHub Secret에 추가**
   - JSON 파일 열기
   - 전체 내용 복사
   - GitHub Secrets에 `FIREBASE_SERVICE_ACCOUNT`로 추가

---

## 3️⃣ 백엔드 URL 확인

### Cloud Run URL 찾기

1. **Google Cloud Console**
   ```
   https://console.cloud.google.com/run
   ```

2. **서비스 선택**
   - Spring 백엔드 서비스 클릭
   - URL 복사 (예: `https://spring-api-abc123.run.app`)

3. **GitHub Secrets에 추가**
   ```
   VITE_API_URL_SPRING=https://spring-api-abc123.run.app
   VITE_API_URL_NEST=https://nest-api-def456.run.app
   ```

---

## 4️⃣ 백엔드 CORS 설정

### NestJS 백엔드

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://ts-front-479305.web.app',
    'https://ts-front-479305.firebaseapp.com',
    'http://localhost:3000',
  ],
  credentials: true,
});
```

### Spring 백엔드

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

**변경 후 백엔드 재배포 필수!**

---

## 5️⃣ 배포 확인

### 자동 배포 진행 상황

```
GitHub 리포지토리 → Actions 탭
```

**워크플로우 단계**:
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Run linter
5. ✅ Build application
6. ✅ Deploy to Firebase Hosting

**성공 시**:
```
✓ Deploy complete!
Hosting URL: https://ts-front-479305.web.app
```

### 사이트 확인

```bash
# 브라우저에서 열기
open https://ts-front-479305.web.app
```

**확인 사항**:
- [ ] 페이지 로드
- [ ] 로그인 동작
- [ ] API 호출 (네트워크 탭 확인)

---

## 🆘 문제 해결

### 배포 실패: "Error: HTTP Error: 403"

**원인**: Firebase 서비스 계정 권한 문제

**해결**:
1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. 새 키 생성
3. GitHub Secret 업데이트

### CORS 에러

**원인**: 백엔드 CORS 설정 누락

**해결**:
1. 백엔드 코드에 CORS 설정 추가 (위 4번 참조)
2. 백엔드 재배포
3. 프론트엔드 다시 테스트

### API 호출 실패

**원인**: 잘못된 백엔드 URL

**해결**:
1. Cloud Run URL 확인
2. GitHub Secrets 업데이트
3. main 브랜치 재배포 (다시 push)

---

## 📋 체크리스트

### 배포 전
- [ ] Firebase 서비스 계정 키 생성
- [ ] GitHub Secrets 모두 추가
- [ ] 백엔드 URL 확인
- [ ] 백엔드 CORS 설정

### 배포
- [ ] main 브랜치 push
- [ ] GitHub Actions 성공 확인

### 배포 후
- [ ] 사이트 접속 확인
- [ ] 로그인 테스트
- [ ] API 호출 테스트

---

## 📚 상세 문서

더 자세한 내용은 다음 문서를 참조하세요:

- **`DEPLOYMENT_CHECKLIST.md`** - 상세 배포 가이드
- **`GITHUB_SECRETS_SETUP.md`** - GitHub Secrets 설정
- **`GCP_REFACTORING_SUMMARY.md`** - GCP 통합 요약
- **`CLAUDE.md`** - 프로젝트 전체 가이드

---

**성공적인 배포를 기원합니다! 🎉**
