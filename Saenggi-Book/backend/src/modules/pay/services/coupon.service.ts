// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException, GoneException, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CouponService {
  constructor(    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async validCoupon({
    coupon_number,
    product_id,
  }: {
    coupon_number: string;
    product_id: number;
  }): Promise<{ discount_price: number; coupon_info: string }> {
    this.logger.warn(`쿠폰 유효성 검사 시작: 쿠폰 번호 ${coupon_number}, 상품 ID ${product_id}`);
    const coupon = await this.findCoupon(coupon_number, product_id);
    const product = await this.payServiceRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      this.logger.warn(`상품을 찾을 수 없음: 상품 ID ${product_id}`);
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    const discountPrice = Math.floor((Number(product.product_price) / 100) * coupon.discount_value);

    this.logger.warn(`쿠폰 유효성 검사 완료: 할인 금액 ${discountPrice}원`);
    return {
      discount_price: discountPrice,
      coupon_info: coupon.discount_info,
    };
  }

  private async findCoupon(couponNumber: string, productId?: number): Promise<PayCouponEntity> {
    // 1. 특정 상품에 적용되는 쿠폰 찾기
    let coupon = await this.payCouponRepository.findOne({
      where: {
        coupon_number: couponNumber,
        pay_service_id: productId,
      },
    });

    // 2. 없으면 모든 상품에 적용되는 쿠폰(pay_service_id = null) 찾기
    if (!coupon) {
      coupon = await this.payCouponRepository
        .createQueryBuilder('coupon')
        .where('coupon.coupon_number = :couponNumber', { couponNumber })
        .andWhere('coupon.pay_service_id IS NULL')
        .getOne();
    }

    if (!coupon) {
      this.logger.warn(`쿠폰을 찾을 수 없음: 쿠폰 번호 ${couponNumber}`);
      throw new NotFoundException('쿠폰을 찾을 수 없습니다.');
    }

    if (coupon.number_of_available <= 0) {
      this.logger.warn(`쿠폰 소진됨: 쿠폰 번호 ${couponNumber}`);
      throw new GoneException('쿠폰이 모두 소진되어 사용할 수 없습니다.');
    }

    this.logger.warn(`쿠폰 조회 완료: 쿠폰 번호 ${couponNumber}`);
    return coupon;
  }

  async useCoupon(queryRunner: any, couponNumber: string): Promise<PayCouponEntity> {
    const coupon = await this.findCoupon(couponNumber);

    coupon.number_of_available -= 1;
    await queryRunner.manager.save(coupon);

    this.logger.warn(
      `쿠폰 사용 완료: 쿠폰 번호 ${couponNumber}, 남은 수량 ${coupon.number_of_available}`,
    );
    return coupon;
  }
}
