import { registerAs } from '@nestjs/config';
import { IsString, IsUrl, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class OAuthConfig {
  @IsUrl({ require_tld: false })
  hubBaseUrl: string;

  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string;

  @IsUrl({ require_tld: false })
  redirectUri: string;

  @IsString()
  scope: string;
}

export default registerAs<OAuthConfig>('oauth', () => {
  const config = plainToClass(OAuthConfig, {
    // Hub 백엔드 OAuth 엔드포인트 (포트 4000)
    hubBaseUrl: process.env.HUB_BASE_URL || process.env.HUB_AUTH_URL || 'http://localhost:4000',
    // MS OAuth 클라이언트 자격 증명 (Hub 백엔드에 등록된 값)
    clientId: process.env.OAUTH_CLIENT_ID || 'ms-app',
    clientSecret:
      process.env.OAUTH_CLIENT_SECRET || 'ms-secret-change-in-production',
    // MS 백엔드 콜백 엔드포인트 (포트 4007)
    redirectUri:
      process.env.OAUTH_REDIRECT_URI ||
      'http://localhost:4007/auth/oauth/callback',
    // 요청할 권한 스코프
    scope: process.env.OAUTH_SCOPE || 'openid profile email',
  });

  const errors = validateSync(config, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return config;
});
