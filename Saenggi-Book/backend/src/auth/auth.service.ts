import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LoginResponseType } from './types/login-response.type';
import { AuthProviderEnum } from 'src/modules/members/enums/auth-provider.enum';
import { JwtService } from 'src/common/jwt/jwt.service';
import { BcryptService } from 'src/common/bcrypt/bcrypt.service';
import { MembersService } from 'src/modules/members/services/members.service';
import { STATUS_MESSAGES } from 'src/common/utils/error-messages';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { LoginWithSocialDto } from './dtos/login-with-social.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { SocialUser } from './types/social-user.type';
import { RegisterWithEmailDto } from './dtos/register-with-email.dto';
import { loginWithEmailDto } from './dtos/login-with-email.dto';
import { RegisterWithSocialDto } from './dtos/register-with-social';
import { SmsService } from 'src/modules/sms/sms.service';

import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// 토큰 블랙리스트 캐시 키 접두사
const TOKEN_BLACKLIST_PREFIX = 'token_blacklist:';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private membersService: MembersService,
    private bcryptService: BcryptService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly smsService: SmsService,

    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
  // 이메일 로그인
  async validateLogin(dto: loginWithEmailDto): Promise<LoginResponseType> {
    const member = await this.membersService.findOneByEmail(dto.email);

    if (!member) {
      throw new NotFoundException(STATUS_MESSAGES.MEMBER.ACCOUNT_NOT_FOUND);
    }
    if (member.provider_type !== null && member.provider_type !== AuthProviderEnum.email) {
      throw new BadRequestException(STATUS_MESSAGES.MEMBER.PROVIDER_MISMATCH);
    }
    if (!member.password) {
      throw new UnauthorizedException(STATUS_MESSAGES.MEMBER.NO_PASSWORD);
    }
    const isValidPassword = await this.bcryptService.comparePassword(dto.password, member.password);
    if (!isValidPassword) {
      throw new UnauthorizedException(STATUS_MESSAGES.MEMBER.PASSWORD_MISMATCH);
    }
    const accessToken = this.jwtService.createAccessToken(member.id);
    const refreshToken = this.jwtService.createRefreshToken(member.id);
    const tokenExpiry = this.jwtService.getTokenExpiryTime();
    const activeServices = await this.membersService.findActiveServicesById(member.id);

    return {
      accessToken,
      refreshToken,
      tokenExpiry,
      activeServices,
    };
  }

  // 이메일로 회원가입
  async registerWithEmail(dto: RegisterWithEmailDto): Promise<LoginResponseType> {
    const existMember = await this.membersService.findOneByEmail(dto.email);

    if (existMember) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const member = await this.membersService.saveMemberByEmail(dto);



    const accessToken = this.jwtService.createAccessToken(member.id);
    const refreshToken = this.jwtService.createRefreshToken(member.id);
    const tokenExpiry = this.jwtService.getTokenExpiryTime();
    const activeServices = await this.membersService.findActiveServicesById(member.id);

    return {
      accessToken,
      refreshToken,
      tokenExpiry,
      activeServices,
    };
  }

  // 소셜 회원가입
  async registerWithSocial(dto: RegisterWithSocialDto): Promise<LoginResponseType> {
    let profile: SocialUser | null;
    if (dto.socialType === 'naver') {
      profile = await this.getProfileWithNaver(dto.accessToken);
    } else if (dto.socialType === 'google') {
      profile = await this.getProfileWithGoogle(dto.accessToken);
    }
    if (profile.id) {
      const member = await this.membersService.findOneByOAuthId(profile.id);
      if (member) {
        this.logger.warn('[소셜 회원가입] 이미 가입된 이메일입니다. ', member.email);
        throw new BadRequestException('이미 가입된 소셜 계정이 존재합니다.');
      }
    }
    if (profile.email) {
      const member = await this.membersService.findOneByEmail(profile.email);
      if (member) {
        throw new BadRequestException('이미 사용중인 이메일입니다.');
      }
    }

    const member = await this.membersService.saveMemberBySocial(dto, profile);



    const accessToken = this.jwtService.createAccessToken(member.id);
    const refreshToken = this.jwtService.createRefreshToken(member.id);
    const tokenExpiry = this.jwtService.getTokenExpiryTime();
    const activeServices = await this.membersService.findActiveServicesById(member.id);

    return {
      accessToken,
      refreshToken,
      tokenExpiry,
      activeServices,
    };
  }

  // 소셜 로그인
  async validateSocialLogin(dto: LoginWithSocialDto): Promise<LoginResponseType> {
    let profile: SocialUser | null;
    if (dto.socialType === 'naver') {
      profile = await this.getProfileWithNaver(dto.accessToken);
    } else if (dto.socialType === 'google') {
      profile = await this.getProfileWithGoogle(dto.accessToken);
    }

    if (profile.email) {
      const member = await this.membersService.findOneByEmailAndProviderType(
        profile.email,
        'local',
      );
      if (member) {
        this.logger.warn('[소셜 로그인] 이미 가입된 이메일입니다. ', member.email);
        throw new BadRequestException('이미 이메일/패스워드로 가입된 계정입니다. ');
      }
    }

    const member = await this.membersService.findOneByOAuthId(profile.id);
    if (!member) {
      throw new NotFoundException('소셜 계정이 존재하지 않습니다. 회원가입을 진행해주세요!');
    }

    const accessToken = this.jwtService.createAccessToken(member.id);
    const refreshToken = this.jwtService.createRefreshToken(member.id);
    const tokenExpiry = this.jwtService.getTokenExpiryTime();
    const activeServices = await this.membersService.findActiveServicesById(member.id);

    return {
      accessToken,
      refreshToken,
      tokenExpiry,
      activeServices,
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<LoginResponseType> {
    try {
      // 블랙리스트 체크
      const isBlacklisted = await this.isTokenBlacklisted(dto.refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('로그아웃된 토큰입니다.');
      }

      const memberId = this.jwtService.getMemberIdFromToken(
        dto.refreshToken,
        this.configService.getOrThrow('auth', { infer: true }).refreshSecret,
      );
      const member = await this.membersService.findOneById(memberId);

      if (!member) {
        throw new NotFoundException(STATUS_MESSAGES.MEMBER.ACCOUNT_NOT_FOUND);
      }

      const accessToken = this.jwtService.createAccessToken(member.id);
      const refreshToken = this.jwtService.createRefreshToken(member.id);
      const tokenExpiry = this.jwtService.getTokenExpiryTime();
      const activeServices = await this.membersService.findActiveServicesById(member.id);

      return {
        accessToken,
        refreshToken,
        tokenExpiry,
        activeServices,
      };
    } catch (e) {
      throw new UnauthorizedException(STATUS_MESSAGES.AUTH.INVALID_TOKEN);
    }
  }

  /**
   * 로그아웃 - Refresh Token을 블랙리스트에 추가
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // 토큰 유효성 검증 및 만료 시간 추출
      const claims = this.jwtService.extractAllClaims(
        refreshToken,
        this.configService.getOrThrow('auth', { infer: true }).refreshSecret,
      );

      // 토큰의 남은 유효 시간 계산 (초 단위)
      const expiresAt = claims.exp;
      const now = Math.floor(Date.now() / 1000);
      const ttl = expiresAt - now;

      if (ttl > 0) {
        // 블랙리스트에 토큰 추가 (토큰 만료 시까지만 유지)
        await this.cacheManager.set(
          `${TOKEN_BLACKLIST_PREFIX}${refreshToken}`,
          'blacklisted',
          ttl * 1000, // cache-manager는 밀리초 단위
        );
        this.logger.info(`[로그아웃] 토큰이 블랙리스트에 추가되었습니다.`);
      }
    } catch (error) {
      // 이미 만료된 토큰이거나 유효하지 않은 토큰이어도 로그아웃은 성공 처리
      this.logger.warn(`[로그아웃] 토큰 처리 중 오류 발생: ${error.message}`);
    }
  }

  /**
   * 토큰이 블랙리스트에 있는지 확인
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.cacheManager.get(`${TOKEN_BLACKLIST_PREFIX}${token}`);
    return result !== null && result !== undefined;
  }

  async getProfileWithNaver(accessToken: string): Promise<SocialUser> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get('https://openapi.naver.com/v1/nid/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw new Error(`유저 프로필 정보 가져오기 실패: ${error.message}`);
            }),
          ),
      );

      const { id, name, email, profile_image } = response.data.response;

      return {
        id,
        name,
        email,
        profile_image,
      };
    } catch (err) {
      throw new Error('Failed to fetch NaverUserProfile');
    }
  }

  async getProfileWithGoogle(accessToken: string): Promise<SocialUser> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`)
          .pipe(
            catchError((error: AxiosError) => {
              throw new Error(`유저 프로필 정보 가져오기 실패: ${error.message}`);
            }),
          ),
      );

      const { sub, name, email, picture } = response.data;

      return {
        id: sub,
        name,
        email,
        profile_image: picture,
      };
    } catch (err) {
      throw new Error('Failed to fetch NaverUserProfile');
    }
  }

  async requestPasswordResetCode(email: string, phone: string, branch?: string): Promise<void> {
    const member = await this.membersService.findOneByEmailAndPhone(email, phone);
    if (!member) {
      throw new NotFoundException('일치하는 회원 정보가 없습니다.');
    }

    await this.smsService.sendRegisterCode(phone.replaceAll('-', ''), branch);
    return null;
  }

  async verifyResetCodeAndCreateToken(phone: string, code: string): Promise<{ token: string }> {
    const isValid = await this.smsService.verifyCode(phone.replaceAll('-', ''), code);
    if (!isValid) {
      throw new BadRequestException('유효하지 않은 인증번호입니다.');
    }

    const member = await this.membersService.findOneByPhone(phone.replaceAll('-', ''));
    if (!member) {
      throw new NotFoundException('회원을 찾을 수 없습니다.');
    }
    const token = this.jwtService.createAccessToken(member.id);
    return { token };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const memberId = this.jwtService.getMemberIdFromToken(
        token,
        this.configService.getOrThrow('auth', { infer: true }).secret,
      );

      const member = await this.membersService.findOneById(memberId);
      if (!member) {
        throw new NotFoundException('회원을 찾을 수 없습니다.');
      }

      const hashedPassword = await this.bcryptService.hashPassword(newPassword);
      await this.membersService.updatePassword(member.id, hashedPassword);
      return null;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }
  }

  // ==========================================
  // SSO (Single Sign-On) Backend Token Exchange
  // ==========================================

  /**
   * SSO 코드 교환
   * Hub Backend에 코드를 검증하고 토큰을 받아옵니다
   *
   * @param code Hub에서 받은 SSO 일회용 코드
   * @returns 토큰 정보
   */
  async exchangeSsoCode(code: string): Promise<LoginResponseType> {
    try {
      // Hub Backend URL 가져오기
      const hubBaseUrl = process.env.HUB_API_URL || process.env.HUB_BASE_URL || 'http://localhost:4000';

      // Hub Backend에 코드 검증 요청
      const response = await firstValueFrom(
        this.httpService
          .post(`${hubBaseUrl}/auth/sso/verify-code`, {
            code,
            serviceId: 'mysanggibu', // MySanggibu 서비스 식별자
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `[SSO 코드 교환 실패] Hub Backend 응답 에러: ${error.message}`,
              );
              if (error.response?.status === 401) {
                throw new UnauthorizedException('SSO 코드가 유효하지 않거나 만료되었습니다.');
              }
              throw new BadRequestException('SSO 인증에 실패했습니다.');
            }),
          ),
      );

      const tokenData = response.data.data || response.data;

      this.logger.info('[SSO 코드 교환 성공] Hub에서 토큰을 받았습니다');

      return {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: tokenData.tokenExpiry,
        activeServices: tokenData.activeServices || [],
      };
    } catch (error) {
      this.logger.error(`[SSO 코드 교환 실패] ${error.message}`);
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('SSO 인증 처리 중 오류가 발생했습니다.');
    }
  }
}
