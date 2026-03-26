# Hub JWT 권한 시스템 통합 가이드

## 개요

Hub(중앙 인증 서버)에서 발급한 JWT 토큰에 포함된 앱별 권한 정보를 확인하여, 수시 앱의 특정 기능에 대한 접근을 제어합니다.

## Hub JWT 토큰 구조

```json
{
  "sub": "ATK",
  "jti": 123,
  "iat": 1716558652,
  "exp": 1716576652,
  "permissions": {
    "susi": {
      "plan": "premium",
      "expires": "2025-12-31T23:59:59Z",
      "features": ["prediction", "analytics", "export"]
    },
    "examhub": {
      "plan": "basic",
      "features": ["basic-analysis"]
    }
  }
}
```

## 구현된 파일

### 1. 타입 정의
- `src/auth/types/jwt-payload.type.ts`
  - `AppPermission`: 앱별 권한 정보
  - `PermissionsPayload`: 전체 권한 맵
  - `JwtPayloadType`: JWT 페이로드 (permissions 필드 추가)

### 2. JWT 서비스 확장
- `src/common/jwt/jwt.service.ts`
  - `getAppPermission(token, secret, appId)`: 특정 앱의 권한 추출
  - `getAllPermissions(token, secret)`: 모든 권한 추출

### 3. 데코레이터
- `src/auth/decorators/require-feature.decorator.ts`
  - `@RequireFeature(feature)`: 특정 기능 권한이 필요한 엔드포인트에 사용

### 4. 가드
- `src/auth/guards/hub-permission.guard.ts`
  - JWT 토큰의 permissions 필드 확인
  - 만료일 체크
  - 기능 권한 체크

## 사용 방법

### 1. 기본 사용 (컨트롤러 메서드에 적용)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequireFeature } from 'src/auth/decorators/require-feature.decorator';
import { HubPermissionGuard } from 'src/auth/guards/hub-permission.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('susi')
@UseGuards(JwtAuthGuard) // 먼저 JWT 인증 확인
export class SusiController {

  // 무료 사용자도 접근 가능한 API (권한 체크 없음)
  @Get('free-data')
  getFreeData() {
    return { message: '무료 데이터' };
  }

  // 'prediction' 기능 권한이 필요한 API
  @Get('predictions')
  @UseGuards(HubPermissionGuard)
  @RequireFeature('prediction')
  getPredictions() {
    return { message: '예측 데이터 - premium 플랜 필요' };
  }

  // 'analytics' 기능 권한이 필요한 API
  @Get('analytics')
  @UseGuards(HubPermissionGuard)
  @RequireFeature('analytics')
  getAnalytics() {
    return { message: '분석 데이터 - premium 플랜 필요' };
  }

  // 'export' 기능 권한이 필요한 API
  @Get('export')
  @UseGuards(HubPermissionGuard)
  @RequireFeature('export')
  exportData() {
    return { message: '데이터 내보내기 - premium 플랜 필요' };
  }
}
```

### 2. 전역 적용 (app.module.ts에 APP_GUARD로 등록)

모든 엔드포인트에 자동으로 권한 체크를 적용하려면:

```typescript
// app.module.ts
import { HubPermissionGuard } from './auth/guards/hub-permission.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 먼저 JWT 인증
    },
    {
      provide: APP_GUARD,
      useClass: HubPermissionGuard, // 그 다음 권한 체크
    },
  ],
})
export class AppModule {}
```

전역 적용 시, `@RequireFeature()` 데코레이터가 있는 엔드포인트만 권한 체크가 수행됩니다.

### 3. 서비스에서 직접 권한 확인

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from 'src/common/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SomeService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async checkUserPermission(token: string) {
    const secret = this.configService.get('auth.secret');
    const permission = this.jwtService.getAppPermission(token, secret, 'susi');

    if (!permission) {
      throw new Error('수시 앱 권한이 없습니다');
    }

    // 만료일 체크
    if (permission.expires && new Date(permission.expires) < new Date()) {
      throw new Error('구독이 만료되었습니다');
    }

    // 플랜 확인
    console.log(`User plan: ${permission.plan}`);

    // 기능 권한 확인
    if (permission.features?.includes('prediction')) {
      console.log('예측 기능 사용 가능');
    }

    return permission;
  }
}
```

## 권한 체크 흐름

1. **JWT 인증** (`JwtAuthGuard`)
   - Authorization 헤더 또는 쿠키에서 토큰 추출
   - 토큰 유효성 검증
   - `request.memberId` 설정

2. **권한 체크** (`HubPermissionGuard`)
   - `@RequireFeature()` 데코레이터 확인
   - JWT 토큰의 `permissions.susi` 필드 추출
   - 만료일 체크 (`expires` 필드)
   - 기능 권한 체크 (`features` 배열)

## 에러 응답

### 401 Unauthorized
- JWT 토큰이 없거나 유효하지 않음
- `JwtAuthGuard`에서 발생

### 403 Forbidden
- 수시 앱 권한이 없음
- 구독이 만료됨
- 요청한 기능에 대한 권한이 없음
- `HubPermissionGuard`에서 발생

예시:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "'prediction' 기능을 사용할 권한이 없습니다."
}
```

## Hub와 JWT 시크릿 키 공유

Hub와 수시 앱은 **동일한 JWT 시크릿 키**를 사용해야 합니다.

### .env 파일 설정

```env
# Hub와 동일한 시크릿 키 사용
AUTH_JWT_SECRET=your-base64-encoded-secret-key
AUTH_JWT_REFRESH_SECRET=your-base64-encoded-refresh-secret-key
```

⚠️ **중요**: Hub에서 설정한 시크릿 키와 정확히 일치해야 합니다.

## 플랜별 권한 예시

### Free 플랜
```json
{
  "plan": "free",
  "features": []
}
```
- 기본 기능만 사용 가능
- `@RequireFeature()` 데코레이터가 있는 API는 접근 불가

### Basic 플랜
```json
{
  "plan": "basic",
  "expires": "2025-12-31T23:59:59Z",
  "features": ["basic-analysis"]
}
```
- `basic-analysis` 기능만 사용 가능
- 만료일 존재

### Premium 플랜
```json
{
  "plan": "premium",
  "expires": "2025-12-31T23:59:59Z",
  "features": ["prediction", "analytics", "export"]
}
```
- 모든 고급 기능 사용 가능
- 만료일 존재

### 무제한 플랜
```json
{
  "plan": "premium",
  "features": ["prediction", "analytics", "export", "custom"]
}
```
- `expires` 필드 없음 = 무제한
- 모든 기능 사용 가능

## 테스트

### 1. JWT 토큰 생성 (Hub에서)

Hub의 `/auth/login` API로 로그인하여 JWT 토큰 발급:

```bash
curl -X POST http://localhost:4000/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password123"}'
```

응답:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresAt": 1716576652
  }
}
```

### 2. 권한이 필요한 API 호출

```bash
curl -X GET http://localhost:8080/susi/predictions \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
```

성공 응답 (권한이 있는 경우):
```json
{
  "success": true,
  "data": {
    "message": "예측 데이터 - premium 플랜 필요"
  }
}
```

실패 응답 (권한이 없는 경우):
```json
{
  "success": false,
  "statusCode": 403,
  "message": "'prediction' 기능을 사용할 권한이 없습니다."
}
```

## 추가 개발 필요 사항

1. **Hub API 실시간 검증** (선택 사항)
   - JWT만 신뢰하지 않고, Hub API로 실시간 권한 확인
   - `/subscription/license/check?appId=susi` 호출

2. **프론트엔드 연동**
   - JWT 토큰의 `permissions` 필드를 디코딩하여 UI에 반영
   - 권한이 없는 기능은 비활성화 또는 숨김 처리

3. **구독 만료 알림**
   - 만료 7일 전부터 사용자에게 알림
   - 만료 시 자동으로 free 플랜으로 전환

4. **앱 ID 환경 변수화**
   - 현재 `HubPermissionGuard`에 하드코딩된 `APP_ID = 'susi'`
   - 환경 변수로 분리 권장: `APP_ID=susi`

## 문의

Hub JWT 권한 시스템 관련 문의사항은 Hub 백엔드 팀에 연락하세요.
