# 로깅 가이드라인 (Logging Guidelines)

> **프로젝트**: GeoBukSchool Backend (GB-Back-Nest)
> **작성일**: 2025-11-24
> **목적**: 일관되고 효과적인 로깅 표준 수립

---

## 📋 목차

1. [로깅 레벨 정의](#로깅-레벨-정의)
2. [로깅 사용 규칙](#로깅-사용-규칙)
3. [로깅 패턴](#로깅-패턴)
4. [금지 사항](#금지-사항)
5. [예제](#예제)

---

## 로깅 레벨 정의

### logger.debug()
**용도**: 개발 디버깅용 상세 정보
**사용 시기**:
- 개발 환경에서만 필요한 상세 정보
- 함수 진입/종료 추적
- 변수 값 확인
- 알고리즘 단계별 추적

**예제**:
```typescript
this.logger.debug('calculateDiscount 함수 진입', {
  originalPrice: 10000,
  discountRate: 0.1,
});
```

---

### logger.log() / logger.info()
**용도**: 정상적인 작업 완료 및 중요 정보
**사용 시기**:
- ✅ 성공적인 작업 완료
- ✅ 중요한 비즈니스 로직 실행
- ✅ 데이터 조회 성공
- ✅ 외부 API 호출 성공
- ✅ 파일 업로드 성공

**예제**:
```typescript
// 성공적인 작업
this.logger.info('SMS 발송 성공', {
  phone: '010-1234-5678',
  messageType: 'verification',
});

// 중요한 정보
this.logger.info('결제 처리 완료', {
  orderId: order.id,
  amount: order.paid_amount,
  memberId: order.member_id,
});
```

---

### logger.warn()
**용도**: 경고 - 예상치 못한 상황이지만 처리됨
**사용 시기**:
- ⚠️ 재시도 가능한 일시적 오류
- ⚠️ Deprecated API 사용
- ⚠️ 설정값 누락 (기본값 사용)
- ⚠️ 성능 임계치 초과
- ⚠️ 리소스 부족 (하지만 처리 가능)

**예제**:
```typescript
// 재시도 후 성공
this.logger.warn('외부 API 호출 재시도 중', {
  attemptNumber: 2,
  maxRetries: 3,
});

// 설정값 누락
this.logger.warn('환경 변수 누락, 기본값 사용', {
  variable: 'CACHE_TTL',
  defaultValue: 3600,
});

// 성능 경고
this.logger.warn('데이터베이스 쿼리 지연', {
  query: 'SELECT * FROM members',
  executionTime: 5000, // 5초
  threshold: 1000, // 1초
});
```

---

### logger.error()
**용도**: 에러 - 실패한 작업, 즉각적인 조치 필요
**사용 시기**:
- ❌ 데이터베이스 연결 실패
- ❌ 외부 API 호출 실패 (재시도 후에도)
- ❌ 파일 시스템 오류
- ❌ 인증/인가 실패
- ❌ 비즈니스 로직 오류
- ❌ 예상치 못한 예외

**예제**:
```typescript
// 에러와 스택 트레이스
this.logger.error('결제 처리 실패', {
  error: error.message,
  stack: error.stack,
  orderId: orderId,
  memberId: memberId,
});

// 데이터베이스 오류
this.logger.error('데이터베이스 쿼리 실패', {
  error: error.message,
  query: 'INSERT INTO pay_order...',
  params: { amount: 10000 },
});
```

---

## 로깅 사용 규칙

### 1. 항상 컨텍스트 포함
로그에는 문제 해결에 필요한 컨텍스트 정보를 포함해야 합니다.

**❌ 나쁜 예**:
```typescript
this.logger.info('결제 완료');
```

**✅ 좋은 예**:
```typescript
this.logger.info('결제 완료', {
  orderId: order.id,
  memberId: member.id,
  amount: order.paid_amount,
  paymentMethod: 'card',
  timestamp: new Date(),
});
```

---

### 2. 민감한 정보 제외
비밀번호, 토큰, 개인정보는 로그에 포함하지 않습니다.

**❌ 절대 금지**:
```typescript
this.logger.info('로그인 시도', {
  email: user.email,
  password: user.password, // ❌ 비밀번호
  accessToken: token.accessToken, // ❌ 토큰
});
```

**✅ 올바른 방법**:
```typescript
this.logger.info('로그인 성공', {
  memberId: user.id,
  email: user.email,
  loginMethod: 'email',
});
```

**민감한 정보 목록**:
- 비밀번호 (password, passwd, pwd)
- 토큰 (token, accessToken, refreshToken, apiKey)
- 개인정보 (주민등록번호, 카드번호 전체)
- 시크릿 키 (secret, privateKey)

---

### 3. 적절한 로그 레벨 선택
작업의 결과에 따라 올바른 레벨을 사용합니다.

**작업 결과별 로그 레벨**:
| 작업 결과 | 로그 레벨 |
|----------|----------|
| 성공 | info |
| 경고 (처리됨) | warn |
| 실패 | error |
| 디버그 정보 | debug |

---

### 4. 구조화된 로깅
로그는 구조화된 객체 형태로 작성합니다.

**❌ 문자열 연결**:
```typescript
this.logger.info('회원 ' + memberId + '의 결제 ' + orderId + ' 처리 완료');
```

**✅ 구조화된 객체**:
```typescript
this.logger.info('결제 처리 완료', {
  memberId: memberId,
  orderId: orderId,
  amount: amount,
});
```

---

### 5. 에러 로깅 시 스택 트레이스 포함
에러 발생 시에는 반드시 스택 트레이스를 포함합니다.

**❌ 메시지만 로깅**:
```typescript
catch (error) {
  this.logger.error('결제 실패');
}
```

**✅ 스택 트레이스 포함**:
```typescript
catch (error) {
  this.logger.error('결제 처리 실패', {
    error: error.message,
    stack: error.stack,
    orderId: orderId,
    memberId: memberId,
  });
  throw error;
}
```

---

## 로깅 패턴

### 패턴 1: 성공적인 작업
```typescript
async createOrder(memberId: number, serviceId: number) {
  this.logger.info('주문 생성 시작', {
    memberId,
    serviceId,
  });

  try {
    const order = await this.orderRepository.save({...});

    this.logger.info('주문 생성 완료', {
      orderId: order.id,
      memberId,
      serviceId,
    });

    return order;
  } catch (error) {
    this.logger.error('주문 생성 실패', {
      error: error.message,
      stack: error.stack,
      memberId,
      serviceId,
    });
    throw error;
  }
}
```

---

### 패턴 2: 외부 API 호출
```typescript
async sendSMS(phone: string, message: string) {
  this.logger.info('SMS 발송 시작', { phone });

  try {
    const result = await this.smsProvider.send({ phone, message });

    if (result.success) {
      this.logger.info('SMS 발송 성공', {
        phone,
        messageId: result.messageId,
      });
    } else {
      this.logger.warn('SMS 발송 실패 (재시도 필요)', {
        phone,
        error: result.error,
        willRetry: true,
      });
    }

    return result;
  } catch (error) {
    this.logger.error('SMS 발송 에러', {
      error: error.message,
      stack: error.stack,
      phone,
    });
    throw error;
  }
}
```

---

### 패턴 3: 데이터 조회
```typescript
async getMemberOrders(memberId: number) {
  this.logger.debug('회원 주문 조회 시작', { memberId });

  const orders = await this.orderRepository.find({
    where: { member_id: memberId },
  });

  this.logger.info('회원 주문 조회 완료', {
    memberId,
    orderCount: orders.length,
  });

  return orders;
}
```

---

### 패턴 4: 비즈니스 로직 경고
```typescript
async applyCoupon(orderId: number, couponCode: string) {
  const order = await this.findOrder(orderId);
  const coupon = await this.findCoupon(couponCode);

  if (!coupon.isValid) {
    this.logger.warn('유효하지 않은 쿠폰 사용 시도', {
      orderId,
      couponCode,
      reason: 'expired',
    });
    throw new BadRequestException('유효하지 않은 쿠폰입니다');
  }

  // ... 쿠폰 적용 로직

  this.logger.info('쿠폰 적용 완료', {
    orderId,
    couponCode,
    discountAmount: coupon.discountAmount,
  });
}
```

---

## 금지 사항

### ❌ 1. console.log 사용 금지
**이유**: 프로덕션에서 추적 불가, 로그 레벨 구분 불가

```typescript
// ❌ 금지
console.log('주문 생성:', order);

// ✅ 사용
this.logger.info('주문 생성 완료', { order });
```

---

### ❌ 2. 성공한 작업에 warn/error 사용 금지
```typescript
// ❌ 잘못된 사용
this.logger.warn('결제 처리 완료'); // 성공했는데 warn

// ✅ 올바른 사용
this.logger.info('결제 처리 완료', { orderId });
```

---

### ❌ 3. 에러 발생 시 정보 누락 금지
```typescript
// ❌ 정보 부족
catch (error) {
  this.logger.error('에러 발생');
}

// ✅ 상세 정보 포함
catch (error) {
  this.logger.error('결제 처리 실패', {
    error: error.message,
    stack: error.stack,
    orderId: orderId,
    memberId: memberId,
  });
}
```

---

### ❌ 4. 과도한 로깅 금지
루프 안에서 매 반복마다 로깅하지 않습니다.

```typescript
// ❌ 과도한 로깅
orders.forEach(order => {
  this.logger.info('주문 처리', { orderId: order.id });
  processOrder(order);
});

// ✅ 요약 로깅
this.logger.info('주문 일괄 처리 시작', { orderCount: orders.length });
orders.forEach(order => processOrder(order));
this.logger.info('주문 일괄 처리 완료', {
  orderCount: orders.length,
  successCount: successCount,
  failureCount: failureCount,
});
```

---

## 예제

### 완전한 서비스 로깅 예제

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async processPayment(orderId: number, memberId: number) {
    // 작업 시작 로깅
    this.logger.info('결제 처리 시작', {
      orderId,
      memberId,
      timestamp: new Date(),
    });

    try {
      // 주문 조회
      const order = await this.findOrder(orderId);

      // 결제 검증
      const validation = await this.validatePayment(order);
      if (!validation.isValid) {
        this.logger.warn('결제 검증 실패', {
          orderId,
          reason: validation.reason,
        });
        throw new BadRequestException(validation.reason);
      }

      // 결제 처리
      const result = await this.executePayment(order);

      // 성공 로깅
      this.logger.info('결제 처리 완료', {
        orderId,
        memberId,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        transactionId: result.transactionId,
      });

      return result;

    } catch (error) {
      // 에러 로깅 (스택 트레이스 포함)
      this.logger.error('결제 처리 실패', {
        error: error.message,
        stack: error.stack,
        orderId,
        memberId,
      });

      throw error;
    }
  }
}
```

---

## 로깅 체크리스트

코드 리뷰 시 다음 항목을 확인하세요:

- [ ] console.log 사용하지 않음
- [ ] 적절한 로그 레벨 사용 (success → info, error → error)
- [ ] 컨텍스트 정보 포함 (orderId, memberId 등)
- [ ] 민감한 정보 제외 (password, token 등)
- [ ] 에러 발생 시 스택 트레이스 포함
- [ ] 구조화된 객체 형태로 로깅
- [ ] 과도한 로깅 방지 (루프 내부 등)
- [ ] 의미 있는 로그 메시지

---

**작성일**: 2025-11-24
**버전**: 1.0
**담당**: Backend Team
