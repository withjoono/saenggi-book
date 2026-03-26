# Swagger API 문서화 가이드라인

거북스쿨 (TurtleSchool) 백엔드 프로젝트의 Swagger/OpenAPI 문서화 표준 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [Decorator 참조](#decorator-참조)
3. [Controller 문서화](#controller-문서화)
4. [DTO 문서화](#dto-문서화)
5. [Best Practices](#best-practices)
6. [코드 템플릿](#코드-템플릿)
7. [완성 예제](#완성-예제)

---

## 개요

### Swagger UI 접근
- **로컬 개발**: http://localhost:4001/swagger
- **프로덕션**: https://v2.ingipsy.com/swagger

### 주요 설정 파일
- **main.ts**: 전역 Swagger 설정 (DocumentBuilder)
- **Controllers**: 엔드포인트별 문서화 (@ApiTags, @ApiOperation 등)
- **DTOs**: 요청/응답 스키마 문서화 (@ApiProperty)

### 문서화 우선순위
1. **필수**: 모든 public API 엔드포인트
2. **권장**: 모든 DTO 필드
3. **선택**: Internal 유틸리티 함수

---

## Decorator 참조

### Controller 레벨 Decorator

#### @ApiTags()
컨트롤러를 그룹화하는 태그를 지정합니다.

```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {}
```

**사용 가능한 태그** (main.ts에 정의됨):
- `auth` - 인증 및 회원가입
- `members` - 회원 관리
- `schoolrecord` - 학생부 기록
- `susi` - 수시 전형 (교과, 학종, 논술)
- `regular` - 정시 전형
- `mock-exam` - 모의고사
- `payments` - 결제
- `officer` - 입학사정관 평가
- `board` - 게시판
- `file-upload` - 파일 업로드
- `core` - 기본 데이터 (대학, 전형, 모집단위)
- `admin` - 관리자 전용
- `static-data` - 정적 데이터
- `sms` - SMS 알림

### 엔드포인트 레벨 Decorator

#### @ApiOperation()
엔드포인트의 요약과 상세 설명을 제공합니다.

```typescript
@ApiOperation({
  summary: '이메일로 로그인',
  description: '이메일과 비밀번호를 사용하여 로그인합니다. 성공 시 JWT 액세스 토큰과 리프레시 토큰을 반환합니다.',
})
```

**작성 가이드**:
- `summary`: 간결한 한 줄 설명 (필수)
- `description`: 상세 설명, 사용 방법, 주의사항 (선택, 권장)

#### @ApiBearerAuth()
JWT 토큰 인증이 필요한 엔드포인트에 추가합니다.

```typescript
@ApiBearerAuth('access-token')
@Get('me')
public getCurrentMember(@CurrentMemberId() memberId: string) {}
```

**규칙**:
- `@Public()` 데코레이터가 **없는** 엔드포인트에만 추가
- 인증 이름은 `'access-token'`으로 고정 (main.ts 설정과 일치)

#### @ApiResponse()
가능한 HTTP 응답 상태 코드와 설명을 문서화합니다.

```typescript
@ApiResponse({
  status: 200,
  description: '로그인 성공',
  schema: {
    example: {
      accessToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
      tokenExpiry: 7200,
    },
  },
})
@ApiResponse({
  status: 401,
  description: '인증 실패 (이메일 또는 비밀번호 불일치)',
})
```

**작성 가이드**:
- 최소한 성공(200/201) 응답 하나는 문서화
- 가능한 에러 응답도 모두 문서화 (400, 401, 403, 404, 500 등)
- 성공 응답은 `schema.example`로 실제 응답 예제 제공
- 엔티티를 반환하는 경우 `type: EntityClass` 사용

#### @ApiBody()
요청 본문(Body) 스키마를 명시적으로 문서화합니다.

```typescript
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', example: 'student@example.com' },
      phone: { type: 'string', example: '010-1234-5678' },
    },
    required: ['email', 'phone'],
  },
})
```

**사용 시기**:
- DTO 클래스가 없는 경우 (inline 객체)
- DTO 문서화가 불충분한 경우 보완용

#### @ApiQuery()
쿼리 파라미터를 문서화합니다.

```typescript
@ApiQuery({
  name: 'branch',
  required: false,
  description: '지점 코드 (선택)',
  example: 'gangnam',
})
```

---

## Controller 문서화

### 기본 구조

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('tag-name')
@Controller('endpoint-prefix')
export class ExampleController {
  // 엔드포인트 메서드들
}
```

### 엔드포인트 타입별 템플릿

#### 1. Public 엔드포인트 (인증 불필요)

```typescript
@ApiOperation({
  summary: '간단한 요약',
  description: '상세 설명 (선택)',
})
@ApiResponse({
  status: 200,
  description: '성공 응답 설명',
})
@ApiResponse({
  status: 400,
  description: '잘못된 요청',
})
@Public()
@Post('endpoint')
public methodName(@Body() dto: DtoClass) {}
```

#### 2. Protected 엔드포인트 (JWT 인증 필요)

```typescript
@ApiOperation({
  summary: '간단한 요약',
  description: '상세 설명 (선택)',
})
@ApiResponse({
  status: 200,
  description: '성공 응답 설명',
})
@ApiResponse({
  status: 401,
  description: '인증 실패 (JWT 토큰 없음 또는 유효하지 않음)',
})
@ApiBearerAuth('access-token')
@Get('endpoint')
public methodName(@CurrentMemberId() memberId: string) {}
```

#### 3. 엔티티 반환 엔드포인트

```typescript
@ApiOperation({
  summary: '리소스 조회',
})
@ApiResponse({
  status: 200,
  description: '조회 성공',
  type: EntityClass,
})
@ApiResponse({
  status: 404,
  description: '리소스를 찾을 수 없음',
})
@ApiBearerAuth('access-token')
@Get(':id')
public findOne(@Param('id') id: string): Promise<EntityClass> {}
```

#### 4. 배열 반환 엔드포인트

```typescript
@ApiOperation({
  summary: '리스트 조회',
})
@ApiResponse({
  status: 200,
  description: '조회 성공',
  type: [EntityClass],
})
@ApiBearerAuth('access-token')
@Get()
public findAll(): Promise<EntityClass[]> {}
```

---

## DTO 문서화

### @ApiProperty() 사용법

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExampleDto {
  @ApiProperty({
    description: '필드 설명',
    example: '예제 값',
    // 선택 옵션들
    required: true,        // 필수 여부 (기본값: true)
    type: String,          // 타입 명시
    format: 'email',       // 포맷 (email, date-time, uuid 등)
    minLength: 6,          // 최소 길이
    maxLength: 500,        // 최대 길이
    minimum: 0,            // 최소값 (숫자)
    maximum: 100,          // 최대값 (숫자)
    enum: ['A', 'B', 'C'], // 허용되는 값 목록
  })
  @IsString()
  @IsNotEmpty()
  fieldName: string;
}
```

### 필드 타입별 예제

#### 문자열 필드

```typescript
@ApiProperty({
  description: '사용자 이름',
  example: '김학생',
})
@IsString()
@IsNotEmpty()
nickname: string;
```

#### 이메일 필드

```typescript
@ApiProperty({
  description: '사용자 이메일 주소',
  example: 'student@example.com',
  format: 'email',
})
@IsEmail()
@IsNotEmpty()
email: string;
```

#### 비밀번호 필드

```typescript
@ApiProperty({
  description: '사용자 비밀번호 (6-500자)',
  example: 'password123!',
  minLength: 6,
  maxLength: 500,
})
@IsString()
@MinLength(6)
@MaxLength(500)
password: string;
```

#### Boolean 필드

```typescript
@ApiProperty({
  description: 'SMS 수신 동의 여부',
  example: true,
  type: Boolean,
})
@IsBoolean()
@IsNotEmpty()
ckSmsAgree: boolean;
```

#### Enum 필드

```typescript
@ApiProperty({
  description: '전공 계열 (문과: 0, 이과: 1)',
  example: '1',
  enum: ['0', '1'],
})
@IsString()
@IsIn(['0', '1'])
isMajor: string;
```

#### 선택 필드 (Optional)

```typescript
@ApiProperty({
  description: '고등학교 타입 ID (선택)',
  example: 1,
  required: false,
})
@IsNumber()
@IsOptional()
hstTypeId?: number;
```

#### 배열 필드

```typescript
@ApiProperty({
  description: '태그 목록',
  example: ['태그1', '태그2'],
  type: [String],
  isArray: true,
})
@IsArray()
@IsString({ each: true })
tags: string[];
```

---

## Best Practices

### 1. 설명 작성 가이드

✅ **좋은 예**:
```typescript
@ApiOperation({
  summary: '이메일로 로그인',
  description: '이메일과 비밀번호를 사용하여 로그인합니다. 성공 시 JWT 액세스 토큰과 리프레시 토큰을 반환합니다.',
})
```

❌ **나쁜 예**:
```typescript
@ApiOperation({
  summary: '로그인',  // 너무 간략함
})
```

### 2. 예제 값 작성 가이드

✅ **좋은 예**:
```typescript
@ApiProperty({
  description: '휴대폰 번호 (하이픈 포함 가능)',
  example: '010-1234-5678',  // 실제 포맷 예제
})
```

❌ **나쁜 예**:
```typescript
@ApiProperty({
  description: '전화번호',
  example: 'string',  // 의미 없는 값
})
```

### 3. 응답 상태 코드 문서화

모든 가능한 HTTP 상태 코드를 문서화하세요:

```typescript
@ApiResponse({ status: 200, description: '성공' })
@ApiResponse({ status: 400, description: '잘못된 요청' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiResponse({ status: 403, description: '권한 없음' })
@ApiResponse({ status: 404, description: '리소스를 찾을 수 없음' })
@ApiResponse({ status: 500, description: '서버 오류' })
```

### 4. 일관성 유지

- 동일한 패턴의 엔드포인트는 동일한 형식으로 문서화
- 설명 어조와 스타일 통일
- 예제 값 포맷 일관성 유지

### 5. DTO vs Inline Schema

**DTO 클래스 사용** (권장):
```typescript
@Post('login')
public login(@Body() loginDto: LoginDto) {}
```

**Inline Schema** (DTO가 없을 때만):
```typescript
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string' },
    },
  },
})
@Post('login')
public login(@Body() body: { email: string }) {}
```

---

## 코드 템플릿

### 1. 기본 Controller 템플릿

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('resource')
@Controller('resource')
export class ResourceController {
  @ApiOperation({
    summary: '리소스 목록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [ResourceEntity],
  })
  @ApiBearerAuth('access-token')
  @Get()
  findAll() {}

  @ApiOperation({
    summary: '리소스 상세 조회',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: ResourceEntity,
  })
  @ApiResponse({
    status: 404,
    description: '리소스를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get(':id')
  findOne(@Param('id') id: string) {}

  @ApiOperation({
    summary: '리소스 생성',
  })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: ResourceEntity,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiBearerAuth('access-token')
  @Post()
  create(@Body() createDto: CreateResourceDto) {}
}
```

### 2. 기본 DTO 템플릿

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    description: '리소스 이름',
    example: '예제 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '리소스 설명 (선택)',
    example: '예제 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
```

---

## 완성 예제

### 완전히 문서화된 Controller 예제 (AuthController)

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 사용자의 상세 정보를 조회합니다. JWT 토큰 인증이 필요합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: MemberEntity,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (JWT 토큰 없음 또는 유효하지 않음)',
  })
  @ApiBearerAuth('access-token')
  @Get('me')
  public getCurrentMember(@CurrentMemberId() memberId: string) {
    return this.membersService.findMeById(Number(memberId));
  }

  @ApiOperation({
    summary: '이메일로 로그인',
    description: '이메일과 비밀번호를 사용하여 로그인합니다. 성공 시 JWT 액세스 토큰과 리프레시 토큰을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...',
        tokenExpiry: 7200,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (이메일 형식 오류, 비밀번호 길이 오류)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (이메일 또는 비밀번호 불일치)',
  })
  @Public()
  @Post('login/email')
  public loginWithEmail(@Body() loginDto: LoginWithEmailDto) {
    return this.service.validateLogin(loginDto);
  }
}
```

### 완전히 문서화된 DTO 예제

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginWithEmailDto {
  @ApiProperty({
    description: '사용자 이메일 주소',
    example: 'student@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호 (6-500자)',
    example: 'password123!',
    minLength: 6,
    maxLength: 500,
  })
  @IsString()
  @MinLength(6, {
    message: 'Password is too short. It must be at least 6 characters long.',
  })
  @MaxLength(500, {
    message: 'Password is too long. It must be at most 500 characters long.',
  })
  password: string;
}
```

---

## 문서화 체크리스트

### Controller 체크리스트
- [ ] `@ApiTags()` 추가 (클래스 레벨)
- [ ] 모든 엔드포인트에 `@ApiOperation()` 추가
- [ ] Protected 엔드포인트에 `@ApiBearerAuth('access-token')` 추가
- [ ] 모든 엔드포인트에 `@ApiResponse()` 추가 (최소 200/201 + 에러 응답)
- [ ] 쿼리 파라미터가 있는 경우 `@ApiQuery()` 추가
- [ ] Inline body가 있는 경우 `@ApiBody()` 추가

### DTO 체크리스트
- [ ] 모든 필드에 `@ApiProperty()` 추가
- [ ] `description` 작성
- [ ] `example` 작성 (실제 사용 가능한 값)
- [ ] Optional 필드는 `required: false` 명시
- [ ] Enum 필드는 `enum` 배열 명시
- [ ] 타입 정보 명시 (`type`, `format`, `minLength` 등)

---

## 참고 자료

- **NestJS Swagger 공식 문서**: https://docs.nestjs.com/openapi/introduction
- **OpenAPI Specification**: https://swagger.io/specification/
- **프로젝트 Swagger UI**: http://localhost:4001/swagger
- **main.ts**: 전역 Swagger 설정 파일
- **auth.controller.ts**: 완성된 문서화 예제

---

## 다음 단계

1. 이 가이드라인을 기반으로 나머지 39개 컨트롤러 문서화
2. Swagger UI에서 문서 확인 및 테스트
3. 모든 DTO에 @ApiProperty() 추가
4. API 사용자에게 문서 공유
