import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { AllConfigType } from 'src/config/config.type';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface IdTokenPayload {
  sub: string; // memberId
  aud: string; // clientId
  iss: string; // issuer
  iat: number;
  exp: number;
  email: string;
  nickname: string;
  phone: string;
}

@Injectable()
export class OAuthClientService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * PKCE Code Verifier 및 Challenge 생성 (S256 방식)
   * @returns { codeVerifier, codeChallenge }
   */
  generatePKCEChallenge(): PKCEChallenge {
    // Code Verifier: 43-128 글자의 랜덤 문자열 (base64url)
    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // Code Challenge: SHA-256(codeVerifier)를 base64url 인코딩
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return {
      codeVerifier,
      codeChallenge,
    };
  }

  /**
   * Hub OAuth Authorization URL 생성
   * @param state 상태 값 (CSRF 방지)
   * @param codeChallenge PKCE Challenge
   * @returns Hub 인증 페이지 URL
   */
  getAuthorizationUrl(state: string, codeChallenge: string): string {
    const oauthConfig = this.configService.getOrThrow('oauth', { infer: true });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauthConfig.clientId,
      redirect_uri: oauthConfig.redirectUri,
      scope: oauthConfig.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${oauthConfig.hubBaseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Authorization Code를 Access Token으로 교환
   * @param code Authorization Code
   * @param codeVerifier PKCE Code Verifier
   * @returns { access_token, refresh_token, id_token }
   */
  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<TokenResponse> {
    const oauthConfig = this.configService.getOrThrow('oauth', { infer: true });

    try {
      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(
          `${oauthConfig.hubBaseUrl}/oauth/token`,
          {
            grant_type: 'authorization_code',
            code,
            redirect_uri: oauthConfig.redirectUri,
            client_id: oauthConfig.clientId,
            client_secret: oauthConfig.clientSecret,
            code_verifier: codeVerifier,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.info('[OAuth] 토큰 교환 성공');
      this.logger.info(`[OAuth] 응답 데이터: ${JSON.stringify(response.data)}`);

      // id_token이 없는 경우 처리
      if (!response.data.id_token) {
        this.logger.error('[OAuth] id_token이 응답에 없습니다!');
        throw new UnauthorizedException('ID Token이 반환되지 않았습니다.');
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `[OAuth] 토큰 교환 실패: ${error.response?.data?.message || error.message}`,
      );
      throw new UnauthorizedException(
        '토큰 교환에 실패했습니다. 다시 로그인해주세요.',
      );
    }
  }

  /**
   * ID Token 검증 (간단한 검증)
   * @param idToken JWT ID Token
   * @returns 디코딩된 payload
   */
  verifyIdToken(idToken: string): IdTokenPayload {
    this.logger.info(`[OAuth] ID Token 검증 시작: ${idToken ? idToken.substring(0, 50) + '...' : 'undefined'}`);

    try {
      if (!idToken) {
        throw new Error('ID Token이 undefined입니다.');
      }

      // JWT는 base64url 인코딩된 3개 부분으로 구성: header.payload.signature
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('유효하지 않은 JWT 형식입니다.');
      }

      // Payload 디코딩
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8'),
      );

      // 기본 검증
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('ID Token이 만료되었습니다.');
      }

      const oauthConfig = this.configService.getOrThrow('oauth', {
        infer: true,
      });
      if (payload.aud !== oauthConfig.clientId) {
        throw new Error('ID Token의 audience가 일치하지 않습니다.');
      }

      this.logger.info(`[OAuth] ID Token 검증 성공: memberId=${payload.sub}`);
      return payload as IdTokenPayload;
    } catch (error) {
      this.logger.error(`[OAuth] ID Token 검증 실패: ${error.message}`);
      throw new BadRequestException('유효하지 않은 ID Token입니다.');
    }
  }

  /**
   * Hub 백엔드에서 사용자 정보 조회
   * @param accessToken Hub Access Token
   * @returns 사용자 정보
   */
  async getUserInfo(accessToken: string): Promise<any> {
    const oauthConfig = this.configService.getOrThrow('oauth', { infer: true });

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${oauthConfig.hubBaseUrl}/members/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      this.logger.info('[OAuth] 사용자 정보 조회 성공');
      return response.data;
    } catch (error) {
      this.logger.error(
        `[OAuth] 사용자 정보 조회 실패: ${error.response?.data?.message || error.message}`,
      );
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }
  }

  /**
   * Hub OAuth SSO 로그아웃
   * Hub에 로그아웃을 알려 해당 클라이언트의 SSO 세션을 정리합니다.
   * @param accessToken Hub Access Token
   */
  async ssoLogout(accessToken: string): Promise<void> {
    const oauthConfig = this.configService.getOrThrow('oauth', { infer: true });

    try {
      await firstValueFrom(
        this.httpService.post(
          `${oauthConfig.hubBaseUrl}/oauth/logout`,
          { client_id: oauthConfig.clientId },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.info('[OAuth] Hub SSO 로그아웃 성공');
    } catch (error) {
      // Hub 로그아웃 실패해도 로컬 로그아웃은 진행
      this.logger.warn(
        `[OAuth] Hub SSO 로그아웃 실패 (무시됨): ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
