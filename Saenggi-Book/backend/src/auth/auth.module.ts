import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from 'src/common/jwt/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MembersModule } from 'src/modules/members/members.module';
import { BcryptModule } from 'src/common/bcrypt/bcrypt.module';
import { HttpModule } from '@nestjs/axios';
import { SmsModule } from 'src/modules/sms/sms.module';

import { LoginAttemptService } from './services/login-attempt.service';
import { CookieService } from './services/cookie.service';
import { OAuthClientService } from './services/oauth-client.service';
import { HubPermissionGuard } from './guards/hub-permission.guard';

@Module({
  imports: [
    MembersModule,
    BcryptModule,
    JwtModule,
    PassportModule,
    HttpModule,
    SmsModule,

  ],
  providers: [
    AuthService,
    JwtStrategy,
    LoginAttemptService,
    CookieService,
    OAuthClientService,
    HubPermissionGuard,
  ],
  controllers: [AuthController],
  exports: [LoginAttemptService, CookieService, OAuthClientService, HubPermissionGuard],
})
export class AuthModule { }
