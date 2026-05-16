import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './database/prisma.module';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HubAuthGuard } from './guards/hub-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AppApiKeyGuard } from './auth/guards/app-api-key.guard';

import appConfig from './config/app-config';
import databaseConfig from './database/config/database-config';
import authConfig from './auth/config/auth-config';
import oauthConfig from './auth/config/oauth.config';

import { AuthModule } from './auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { AdminModule } from './admin/admin.module';
import { NonsulModule } from './modules/nonsul/nonsul.module';
import { SusiModule } from './modules/susi/susi.module';
import { CommonCodeModule } from './modules/common-code/common-code.module';

import { CommonModule } from './common/common.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { SchoolRecordModule } from './modules/schoolrecord/schoolrecord.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { OfficerModule } from './modules/officer/officer.module';

import { StoreModule } from './modules/store/store.module';
import payConfig from './modules/pay/config/pay-config';
import { PaymentModule } from './modules/pay/pay.module';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import smsConfig from './modules/sms/config/sms-config';
import { SmsModule } from './modules/sms/sms.module';
import { BoardModule } from './modules/board/board.module';
// import awsUploadConfig from './aws-upload/config/aws-upload-config';
// import { AwsUploadModule } from './aws-upload/aws-upload.module';
import gcsUploadConfig from './gcs-upload/config/gcs-upload-config';
import { GcsUploadModule } from './gcs-upload/gcs-upload.module';
import { CoreModule } from './modules/core/core.module';
import { StaticDataModule } from './modules/static-data/static-data.module';
import { ExplorationModule } from './modules/exploration/exploration.module';


import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { winstonConfig } from './common/utils/winston.utils';
import { WinstonModule } from 'nest-winston';

import { SetukBuilderModule } from './modules/setuk-builder/setuk-builder.module';
import { OpenAlexModule } from './modules/open-alex/open-alex.module';
import { ScienceOnModule } from './modules/science-on/science-on.module';
import { Neo4jModule } from './database/neo4j/neo4j.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        oauthConfig,
        payConfig,
        smsConfig,
        gcsUploadConfig,
        // awsUploadConfig,
      ],
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development',
    }),
    PrismaModule,
    WinstonModule.forRoot(winstonConfig),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }), // Hub 인증 서버 통신을 위한 HttpModule
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379', 10),
              connectTimeout: 3000,
            },
            keyPrefix: 'susi-',
            ttl: 300000, // 5분
          });
          console.log('✅ MySanggibu: Redis 연결됨');
          return { store, ttl: 300000 };
        } catch (error) {
          console.warn('⚠️ MySanggibu: Redis 연결 실패, 인메모리 캐시 사용:', error.message);
          return { ttl: 300000 };
        }
      },
    }),
    // Rate Limiting - DDoS/브루트포스 공격 방지
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1초
        limit: 3, // 초당 최대 3회 (빠른 연속 요청 차단)
      },
      {
        name: 'medium',
        ttl: 10000, // 10초
        limit: 20, // 10초당 최대 20회
      },
      {
        name: 'long',
        ttl: 60000, // 1분
        limit: 100, // 분당 최대 100회
      },
    ]),
    CommonModule, // 공통모듈(JWT, Bcrypt)
    EncryptionModule, // 민감정보 암호화 모듈
    AuthModule, // 인증모듈
    MembersModule, // 유저모듈
    AdminModule, // 어드민 모듈
    NonsulModule, // 논술 모듈
    SusiModule, // 수시 모듈(교과, 학종, 합불사례)
    CommonCodeModule, // 공통코드 모듈
    SchoolRecordModule, // 생기부 모듈
    OfficerModule, // 사정관 관련 모듈 (평가, 사정관)

    StoreModule, // 상점 모듈
    PaymentModule, // 결제 모듈
    SmsModule, // SMS 모듈(Aligo 사용중)
    BoardModule, // 게시판 모듈 (게시판, 게시글, 댓글)
    // AwsUploadModule, // aws 업로드 모듈
    GcsUploadModule, // GCS 파일 업로드 모듈
    CoreModule,
    StaticDataModule, // 정적데이터 모듈(교과 코드, 계열 등)
    ExplorationModule,
    SetukBuilderModule,
    Neo4jModule,    // Neo4j 그래프 DB
    OpenAlexModule, // OpenAlex - 수행평가 주제 탐색
    ScienceOnModule, // KISTI Science ON - 한국 학술 논문 검색

  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   // Hub 중앙 인증 Guard
    //   // Hub(GB-Back-Nest)에서 발급한 JWT 토큰을 검증하여 인증 수행
    //   // @Public() 데코레이터가 없는 모든 엔드포인트에 적용됨
    //   // 토큰 검증 성공 시 request.user에 사용자 정보 추가 (memberId, email, name)
    //   provide: APP_GUARD,
    //   useClass: HubAuthGuard,
    // },
    {
      // [임시 활성화 - OAuth SSO 작업 중]
      // 기존 자체 JWT 인증 (Susi 자체 토큰 발급/검증)
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      // 컨트롤러에 @Roles(['ROLE_ADMIN', "ROLE_USER"...])이 붙으면 작동
      // jwt토큰으로 멤버를 조회하여 해당유저의 권한을 체크하여 배열에 속한 권한을 가지는지 체크
      // 없다면 403(권한없음) 에러
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      // Rate Limiting Guard - DDoS/브루트포스 공격 방지
      // 초과 시 429 (Too Many Requests) 에러
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      // 앱 API Key Guard - @RequireAppAuth() 데코레이터가 있는 엔드포인트에서 앱 인증 검증
      // 하이브리드 앱 전용 보안 레이어
      provide: APP_GUARD,
      useClass: AppApiKeyGuard,
    },
    {
      // 응답에 성공시 {success: true, data: any}
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
    {
      // http 예외 발생 시 {success: false, message: "text", statusCode: xxx} 값을 추가
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }











