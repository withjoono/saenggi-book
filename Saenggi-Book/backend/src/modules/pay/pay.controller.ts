import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentService } from './pay.service';
import { AllConfigType } from 'src/config/config.type';
import { ConfigService } from '@nestjs/config';
import { PayValidCouponDto, PayValidCouponResponseDto } from './dtos/pay-valid-coupon.dto';
import { PayPreRegisterDto } from './dtos/pay-pre-register.dto';
import { PayVerifyDto } from './dtos/pay-verify.dto';
import { CouponService } from './services/coupon.service';
import { PayHistoryDto } from './dtos/pay-history.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly couponService: CouponService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  @ApiOperation({
    summary: '결제 내역 목록 조회',
    description: '현재 로그인한 사용자의 모든 결제 내역을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '결제 내역 목록 조회 성공',
    type: [PayHistoryDto],
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Get('history')
  async getMemberPaymentHistories(@CurrentMemberId() memberId: string): Promise<PayHistoryDto[]> {
    const history = await this.paymentService.getMemberPaymentHistories(Number(memberId));

    return history;
  }

  @ApiOperation({
    summary: '결제 내역 상세 조회',
    description: '특정 주문 ID의 결제 내역 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '주문 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '결제 내역 상세 조회 성공',
    type: PayHistoryDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 404,
    description: '결제 내역을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get('history/:id')
  async getMemberPaymentHistory(
    @CurrentMemberId() memberId: string,
    @Param('id', ParseIntPipe) orderId: number,
  ): Promise<PayHistoryDto> {
    const history = await this.paymentService.getMemberPaymentHistory(Number(memberId), orderId);

    return history;
  }

  @ApiOperation({
    summary: '결제 사전 등록',
    description:
      '아임포트 결제 전 주문 정보를 사전 등록합니다. 쿠폰 적용 시 할인된 금액으로 등록됩니다.',
  })
  @ApiResponse({
    status: 201,
    description: '사전 등록 성공',
    schema: {
      example: {
        merchant_uid: 'order_20240101_123456',
        amount: 50000,
        name: '수시_교과 서비스',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 상품 ID 또는 쿠폰)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Post('pre-register')
  async preRegisterPayment(@Body() body: PayPreRegisterDto, @CurrentMemberId() memberId: string) {
    const { couponNumber, productId } = body;
    const payOrder = await this.paymentService.preRegisterPayment(
      Number(productId),
      Number(memberId),
      couponNumber,
    );
    return payOrder;
  }

  @ApiOperation({
    summary: '결제 검증 및 완료',
    description: '아임포트에서 결제 완료 후 결제 정보를 검증하고 서비스 계약을 활성화합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '결제 검증 및 완료 성공',
  })
  @ApiResponse({
    status: 400,
    description: '결제 검증 실패 (금액 불일치 또는 유효하지 않은 결제)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Post('verify')
  async verifyPayment(
    @Body()
    body: PayVerifyDto,
  ) {
    const { imp_uid, merchant_uid, coupon_number } = body;
    const paymentInfo = await this.paymentService.verifyAndProcessPayment(
      imp_uid,
      merchant_uid,
      coupon_number,
    );

    return paymentInfo;
  }

  @ApiOperation({
    summary: '아임포트 스토어 코드 조회',
    description: '클라이언트에서 아임포트 결제 모듈 초기화에 필요한 스토어 코드를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '스토어 코드 조회 성공',
    schema: {
      example: {
        storeCode: 'imp12345678',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Get('store-code')
  getStoreCode() {
    return {
      storeCode: this.configService.getOrThrow('pay', { infer: true }).impStoreCode,
    };
  }

  @ApiOperation({
    summary: '쿠폰 유효성 검증',
    description: '쿠폰 번호의 유효성을 검증하고 해당 상품에 적용 가능한 할인 금액을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '쿠폰 검증 성공',
    type: PayValidCouponResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 쿠폰 (만료, 사용 완료, 적용 불가 상품)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Post('coupon/valid')
  async validCoupon(@Body() body: PayValidCouponDto): Promise<PayValidCouponResponseDto> {
    const paymentInfo = await this.couponService.validCoupon({
      coupon_number: body.coupon_number || body.couponNumber,
      product_id: Number(body.product_id || body.productId),
    });

    return paymentInfo;
  }

  @ApiOperation({
    summary: '무료 서비스 계약',
    description:
      '100% 할인 쿠폰 적용 시 무료로 서비스 계약을 완료합니다. 결제 금액이 0원인 경우에만 사용 가능합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '무료 서비스 계약 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (결제 금액이 0원이 아님)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Post('free')
  async contractFreeService(
    @Body() body: PayValidCouponDto,
    @CurrentMemberId() memberId: string,
  ): Promise<{ activeServices: string[] }> {
    const paymentInfo = await this.paymentService.contractFreeService(
      {
        coupon_number: body.coupon_number || body.couponNumber,
        product_id: Number(body.product_id || body.productId),
      },
      Number(memberId),
    );

    return paymentInfo;
  }

  @ApiOperation({
    summary: '아임포트 결제 웹훅',
    description:
      '아임포트에서 결제 상태 변경 시 호출되는 웹훅 엔드포인트입니다. 결제 완료/취소 등의 이벤트를 처리합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imp_uid: { type: 'string', example: 'imp_123456789' },
        merchant_uid: { type: 'string', example: 'order_20240101_123456' },
        status: { type: 'string', example: 'paid' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '웹훅 처리 성공',
    schema: {
      example: { message: '웹훅이 성공적으로 처리되었습니다.' },
    },
  })
  @ApiResponse({
    status: 500,
    description: '웹훅 처리 중 오류 발생',
  })
  @Post('/webhook')
  @Public()
  async handleWebhook(@Body() webhookData: any) {
    const { imp_uid, merchant_uid, status } = webhookData;

    try {
      await this.paymentService.processWebhook(imp_uid, merchant_uid, status);
      return { message: '웹훅이 성공적으로 처리되었습니다.' };
    } catch (error) {
      console.error('웹훅 처리 중 오류 발생:', error);
      throw new HttpException(
        '웹훅 처리 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary: '결제 상태 조회 및 재처리 (관리자)',
    description:
      '아임포트에서 결제 상태를 조회하고 필요시 재처리합니다. 관리자 전용 엔드포인트입니다.',
  })
  @ApiParam({
    name: 'merchantUid',
    description: '주문 고유 ID',
    example: 'order_20240101_123456',
  })
  @ApiResponse({
    status: 200,
    description: '결제 상태 조회 및 재처리 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (관리자만 접근 가능)',
  })
  @ApiResponse({
    status: 404,
    description: '결제 정보를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get('inquire/:merchantUid')
  @Roles(['ROLE_ADMIN'])
  async inquirePayment(@Param('merchantUid') merchantUid: string) {
    return this.paymentService.inquireAndProcessPayment(merchantUid);
  }
}
