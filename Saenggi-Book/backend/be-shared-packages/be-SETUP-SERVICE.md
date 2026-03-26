# 서비스 설정 가이드

새 서비스(예: 플래너)에서 공유 패키지를 사용하기 위한 설정 가이드입니다.

## 1. 프로젝트 구조 설정

```bash
# 새 NestJS 프로젝트 생성
nest new planner-service

# 필요한 의존성 설치
cd planner-service
yarn add typeorm @nestjs/typeorm pg class-validator class-transformer
```

## 2. 공유 패키지 연결

### 방법 A: yarn link (로컬 개발)

```bash
# shared-packages 빌드 및 링크
cd /path/to/GB-Back-Nest/shared-packages

# 각 패키지 빌드
yarn build

# 각 패키지 링크 등록
cd packages/types && yarn link
cd ../entities && yarn link
cd ../utils && yarn link

# 서비스에서 링크 사용
cd /path/to/planner-service
yarn link @geobuk/shared-types
yarn link @geobuk/shared-entities
yarn link @geobuk/common-utils
```

### 방법 B: npm 레지스트리 (프로덕션)

```bash
# 패키지 배포 후
yarn add @geobuk/shared-types @geobuk/shared-entities @geobuk/common-utils
```

### 방법 C: 직접 경로 참조 (package.json)

```json
{
  "dependencies": {
    "@geobuk/shared-types": "file:../GB-Back-Nest/shared-packages/packages/types",
    "@geobuk/shared-entities": "file:../GB-Back-Nest/shared-packages/packages/entities",
    "@geobuk/common-utils": "file:../GB-Back-Nest/shared-packages/packages/utils"
  }
}
```

## 3. TypeORM 설정

### data-source.ts

```typescript
import { DataSource } from 'typeorm';
import {
  MemberEntity,
  PlannerItemEntity,
  PlannerPlanEntity,
  PlannerClassEntity,
  PlannerManagementEntity,
} from '@geobuk/shared-entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_DATABASE || 'geobukschool_dev',
  entities: [
    MemberEntity,
    PlannerItemEntity,
    PlannerPlanEntity,
    PlannerClassEntity,
    PlannerManagementEntity,
    // 서비스 고유 엔티티 추가
  ],
  synchronize: false, // ⚠️ 절대 true 금지!
  logging: process.env.NODE_ENV === 'development',
});
```

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  MemberEntity,
  PlannerItemEntity,
  PlannerPlanEntity,
  PlannerClassEntity,
  PlannerManagementEntity,
} from '@geobuk/shared-entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        MemberEntity,
        PlannerItemEntity,
        PlannerPlanEntity,
        PlannerClassEntity,
        PlannerManagementEntity,
      ],
      synchronize: false,
    }),
    // 기능 모듈
    PlannerModule,
  ],
})
export class AppModule {}
```

## 4. 환경 변수 설정

### .env.development

```env
# 서버
NODE_ENV=development
PORT=4002

# 데이터베이스 (메인 백엔드와 동일)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tsuser
DB_PASSWORD=tsuser1234
DB_DATABASE=geobukschool_dev
DB_SYNCHRONIZE=false

# JWT (메인 백엔드와 동일한 시크릿 사용)
AUTH_JWT_SECRET=<메인백엔드와 동일한 base64 시크릿>
AUTH_REFRESH_SECRET=<메인백엔드와 동일한 base64 시크릿>
```

## 5. JWT 인증 설정

### jwt.module.ts

```typescript
import { Module, Global } from '@nestjs/common';
import { JwtService } from '@geobuk/common-utils';

@Global()
@Module({
  providers: [
    {
      provide: 'JWT_SERVICE',
      useFactory: () => {
        return new JwtService({
          accessSecret: process.env.AUTH_JWT_SECRET,
          refreshSecret: process.env.AUTH_REFRESH_SECRET,
        });
      },
    },
  ],
  exports: ['JWT_SERVICE'],
})
export class JwtModule {}
```

### jwt-auth.guard.ts

```typescript
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { JwtService } from '@geobuk/common-utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('JWT_SERVICE')
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return false;
    }

    const result = this.jwtService.verifyAccessToken(token);
    if (!result.valid) {
      return false;
    }

    request.user = {
      memberId: parseInt(result.payload.jti, 10),
    };

    return true;
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
```

## 6. 서비스 예시

### planner.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MemberEntity,
  PlannerItemEntity,
} from '@geobuk/shared-entities';
import {
  CreatePlannerItemDto,
  PlannerItemFilter,
  createPaginatedResponse,
} from '@geobuk/shared-types';

@Injectable()
export class PlannerService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    @InjectRepository(PlannerItemEntity)
    private readonly plannerItemRepository: Repository<PlannerItemEntity>,
  ) {}

  // 회원 정보 조회 (읽기 전용)
  async getMemberInfo(memberId: number) {
    return this.memberRepository.findOne({
      where: { id: memberId },
      select: ['id', 'email', 'nickname', 'memberType'],
    });
  }

  // 일정 생성
  async createItem(memberId: number, dto: CreatePlannerItemDto) {
    const item = this.plannerItemRepository.create({
      memberId,
      ...dto,
    });
    return this.plannerItemRepository.save(item);
  }

  // 일정 목록 조회
  async getItems(filter: PlannerItemFilter, page = 1, limit = 10) {
    const [items, total] = await this.plannerItemRepository.findAndCount({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      order: { startDate: 'ASC' },
    });

    return createPaginatedResponse(items, total, { page, limit });
  }
}
```

## 7. 검증

```bash
# 서비스 시작
yarn start:dev

# 테스트 요청
curl http://localhost:4002/health

# JWT 인증 테스트
curl -H "Authorization: Bearer <token>" http://localhost:4002/planner/items
```

## 8. 체크리스트

- [ ] 공유 패키지 설치/링크
- [ ] TypeORM 엔티티 등록
- [ ] 환경 변수 설정 (DB, JWT 시크릿)
- [ ] JWT 인증 가드 설정
- [ ] 서비스 시작 확인
- [ ] API 테스트
