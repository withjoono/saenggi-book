/**
 * Hub JWT 토큰에 포함된 앱별 권한 정보
 */
export type AppPermission = {
  plan: 'free' | 'basic' | 'premium' | 'none';
  expires?: string;
  features?: string[];
};

/**
 * Hub JWT 토큰에 포함된 전체 권한 정보
 */
export type PermissionsPayload = Record<string, AppPermission>;

export type JwtPayloadType = {
  sub: string; // "ATK" | "RTK"
  jti: string; // memberId 값이 들어감
  iat: number;
  exp: number;
  permissions?: PermissionsPayload; // Hub JWT에 포함된 앱별 권한 (선택)
};

// 스프링에서 사용중인 jwt payload
// {
//     "sub": "ATK",
//     "jti": memberId,
//     "iat": 1716558652,
//     "exp": 1716576652
//   }

// Hub JWT payload 예시 (permissions 포함)
// {
//     "sub": "ATK",
//     "jti": 123,
//     "iat": 1716558652,
//     "exp": 1716576652,
//     "permissions": {
//       "susi": {
//         "plan": "premium",
//         "expires": "2025-12-31T23:59:59Z",
//         "features": ["prediction", "analytics", "export"]
//       }
//     }
//   }
