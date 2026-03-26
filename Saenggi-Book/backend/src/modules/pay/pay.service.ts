// @ts-nocheck
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { CouponService } from './services/coupon.service';
import { ContractService } from './services/contract.service';
import { IamPortService } from './services/iamport.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MembersService } from '../members/services/members.service';

@Injectable()
export class PaymentService {
  constructor(    private readonly couponService: CouponService,
    private readonly contractService: ContractService,
    private readonly iamPortService: IamPortService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(forwardRef(() => MembersService))
    private readonly membersService: MembersService,
  ) {}

  async getMemberPaymentHistories(memberId: number): Promise<PayOrderEntity[]> {
    this.logger.debug('회원 결제 내역 조회 시작', { memberId });

    const orders = await this.payOrderRepository.find({
      where: { member_id: memberId, order_state: Not('PENDING') },
      relations: ['pay_service'],
      select: {
        id: true,
        cancel_amount: true,
        paid_amount: true,
        card_name: true,
        create_dt: true,
        update_dt: true,
        order_state: true,

        pay_service: {
          product_nm: true,
          term: true,
          product_price: true,
        },
      },
      order: { create_dt: 'DESC' },
    });

    this.logger.info('회원 결제 내역 조회 완료', {
      memberId,
      orderCount: orders.length,
    });
    return orders;
  }

  async getMemberPaymentHistory(memberId: number, orderId: number): Promise<PayOrderEntity> {
    this.logger.debug('회원 주문 상세 조회 시작', { memberId, orderId });

    const orders = await this.payOrderRepository.findOne({
      where: { member_id: memberId, id: orderId, order_state: Not('PENDING') },
      relations: ['pay_service'],
      select: {
        id: true,
        cancel_amount: true,
        paid_amount: true,
        card_name: true,
        card_number: true,
        create_dt: true,
        update_dt: true,
        order_state: true,

        pay_service: {
          product_nm: true,
          term: true,
          product_price: true,
        },
      },
      order: { create_dt: 'DESC' },
    });

    if (!orders) {
      this.logger.error('결제 내역 조회 실패 - 주문 없음', {
        memberId,
        orderId,
      });
      throw new NotFoundException('결제 내역이 없습니다.');
    }

    this.logger.info('회원 주문 상세 조회 완료', {
      memberId,
      orderId,
      orderState: orders.order_state,
    });
    return orders;
  }

  private generateMerchantUid(): string {
    const uuid = crypto.randomUUID().replace(/-/g, ''); // 하이픈 제거
    const truncatedUuid = uuid.slice(0, 34); // 33자로 자르기 (39 - 6)
    return `order-${truncatedUuid}`; // 'order-' 접두사 추가 (총 39자)
  }

  async preRegisterPayment(
    productId: number,
    memberId: number,
    couponNumber?: string,
  ): Promise<PayOrderEntity> {
    this.logger.warn(
      `회원 ${memberId}의 상품 ${productId} 사전 결제 등록 시작. 쿠폰: ${couponNumber || '없음'}`,
    );
    const product = await this.findProductById(productId);

    let finalAmount = Number(product.product_price);

    if (couponNumber) {
      const coupon = await this.couponService.validCoupon({
        coupon_number: couponNumber,
        product_id: product.id,
      });
      finalAmount -= coupon.discount_price;
      this.logger.warn(`쿠폰 적용 후 최종 금액: ${finalAmount}원`);
    }

    if (finalAmount <= 0) {
      this.logger.warn(`회원 ${memberId}의 상품 ${productId} 최종 결제 금액이 0원 이하입니다.`);
      throw new BadRequestException('결제 금액이 0원 입니다.');
    }

    const payOrder = this.payOrderRepository.create({
      merchant_uid: this.generateMerchantUid(),
      order_state: 'PENDING',
      paid_amount: finalAmount,
      member_id: memberId,
      pay_service_id: product.id,
      create_dt: new Date(),
      update_dt: new Date(),
    });

    const savedOrder = await this.payOrderRepository.save(payOrder);
    this.logger.warn(`회원 ${memberId}의 주문 ${savedOrder.id} 사전 등록 완료`);
    return savedOrder;
  }

  async verifyAndProcessPayment(
    impUid: string,
    merchantUid: string,
    couponNumber?: string,
  ): Promise<any> {
    this.logger.warn(`결제 검증 및 처리 시작. 아임포트 UID: ${impUid}, 주문 번호: ${merchantUid}`);
    const payOrder = await this.payOrderRepository.findOne({
      where: { merchant_uid: merchantUid },
    });

    if (!payOrder) {
      this.logger.warn(`주문 번호 ${merchantUid}에 해당하는 주문을 찾을 수 없습니다.`);
      throw new BadRequestException('주문을 찾을 수 없습니다.');
    }

    if (payOrder.order_state === 'COMPLETE') {
      this.logger.warn(`주문 번호 ${merchantUid}는 이미 처리된 주문입니다.`);
      // 이미 처리된 경우에도 활성 서비스 반환
      const activeServices = await this.membersService.findActiveServicesById(payOrder.member_id);
      return { activeServices };
    }

    const paymentInfo = await this.executeInTransaction(
      async (queryRunner) => {
        const paymentData = await this.iamPortService.getPaymentInfo(impUid);

        if (paymentData.status !== 'paid') {
          this.logger.warn(`아임포트 UID ${impUid}의 결제가 완료되지 않았습니다.`);
          throw new BadRequestException('결제가 완료되지 않았습니다.');
        }

        if (payOrder.paid_amount !== paymentData.amount) {
          this.logger.warn(`주문 번호 ${merchantUid}의 결제 금액이 일치하지 않습니다.`);
          throw new BadRequestException('결제 금액이 일치하지 않습니다.');
        }

        payOrder.imp_uid = paymentData.imp_uid;
        payOrder.order_state = 'COMPLETE';
        payOrder.card_name = paymentData.card_name;
        payOrder.card_number = paymentData.card_number;
        payOrder.emb_pg_provider = paymentData.emb_pg_provider;
        payOrder.update_dt = new Date();

        await queryRunner.manager.save(payOrder);

        if (couponNumber) {
          await this.couponService.useCoupon(queryRunner, couponNumber);
          this.logger.warn(`주문 ${merchantUid}에 쿠폰 ${couponNumber} 사용 완료`);
        }

        await this.contractService.handleProductSpecificLogic(
          queryRunner,
          payOrder.pay_service_id,
          payOrder.member_id,
          payOrder.id,
        );

        this.logger.warn(`주문 ${merchantUid} 결제 처리 완료`);
        return paymentData;
      },
      impUid,
      merchantUid,
    );

    // 결제 완료 후 활성 서비스 목록 반환
    const activeServices = await this.membersService.findActiveServicesById(payOrder.member_id);
    this.logger.warn(`결제 완료, 활성 서비스: ${activeServices.join(', ')}`);
    return { ...paymentInfo, activeServices };
  }

  async contractFreeService(
    { coupon_number, product_id }: { coupon_number: string; product_id: number },
    memberId: number,
  ): Promise<{ activeServices: string[] }> {
    await this.executeInTransaction(async (queryRunner) => {
      const coupon = await this.couponService.useCoupon(queryRunner, coupon_number);

      if (coupon.discount_value !== 100) {
        this.logger.warn(`100% 할인 쿠폰이 아닙니다.`);
        throw new BadRequestException('잘못된 요청입니다.');
      }

      const payOrder = this.payOrderRepository.create({
        merchant_uid: this.generateMerchantUid(),
        order_state: 'COMPLETE',
        paid_amount: 0,
        card_name: 'free',
        card_number: 'free',
        member_id: memberId,
        pay_service_id: product_id,
        create_dt: new Date(),
        update_dt: new Date(),
      });

      await queryRunner.manager.save(payOrder);

      await this.contractService.handleProductSpecificLogic(
        queryRunner,
        Number(product_id),
        memberId,
        payOrder.id,
      );
    });

    // 결제 완료 후 활성 서비스 목록 반환
    const activeServices = await this.membersService.findActiveServicesById(memberId);
    this.logger.warn(`무료 결제 완료, 활성 서비스: ${activeServices.join(', ')}`);
    return { activeServices };
  }

  async processWebhook(impUid: string, merchantUid: string, status: string): Promise<void> {
    this.logger.warn(
      `웹훅 처리 시작. 아임포트 UID: ${impUid}, 주문 번호: ${merchantUid}, 상태: ${status}`,
    );
    const payOrder = await this.payOrderRepository.findOne({
      where: { merchant_uid: merchantUid },
    });

    if (!payOrder) {
      this.logger.warn(`주문 번호 ${merchantUid}에 해당하는 주문을 찾을 수 없습니다.`);
      throw new NotFoundException(`주문을 찾을 수 없습니다: ${merchantUid}`);
    }

    switch (status) {
      // 결제 승인, 가상계좌 입금, 예약결제 시도
      case 'paid':
        if (payOrder.order_state === 'COMPLETE') {
          this.logger.warn(
            `주문 ${merchantUid}는 이미 처리되었습니다. 현재 상태: ${payOrder.order_state}`,
          );
          break;
        }
        await this.verifyAndProcessPayment(impUid, merchantUid);
        break;

      // 결제 실패
      case 'failed':
        await this.handleFailedPayment(payOrder, impUid);
        break;
      // 관리자 콘솔에서 결제 취소
      case 'cancelled':
        await this.handleCancelledPayment(payOrder, impUid);
        break;
      default:
        this.logger.warn(`주문 ${merchantUid}에 대해 알 수 없는 결제 상태: ${status}`);
    }
  }

  private async handleFailedPayment(payOrder: PayOrderEntity, impUid: string): Promise<void> {
    this.logger.warn(
      `실패한 결제 처리 시작. 주문: ${payOrder.merchant_uid}, 아임포트 UID: ${impUid}`,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentInfo = await this.iamPortService.getPaymentInfo(impUid);

      if (paymentInfo.status !== 'failed') {
        this.logger.warn(`아임포트 UID ${impUid}의 결제가 실패 상태가 아닙니다.`);
        throw new Error('결제가 실패 상태가 아닙니다.');
      }

      payOrder.order_state = 'FAILED';
      payOrder.update_dt = new Date();
      await queryRunner.manager.save(payOrder);

      // 추가적인 실패 처리 로직
      await this.contractService.handleFailedPayment(
        queryRunner,
        payOrder.pay_service_id,
        payOrder.member_id,
      );

      await queryRunner.commitTransaction();
      this.logger.warn(`주문 ${payOrder.merchant_uid}의 실패한 결제 처리 완료`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`실패한 결제 처리 중 오류 발생: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException('결제 실패 처리 중 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  private async handleCancelledPayment(payOrder: PayOrderEntity, impUid: string): Promise<void> {
    this.logger.warn(
      `취소된 결제 처리 시작. 주문: ${payOrder.merchant_uid}, 아임포트 UID: ${impUid}`,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentInfo = await this.iamPortService.getPaymentInfo(impUid);

      if (paymentInfo.status !== 'cancelled') {
        this.logger.warn(`아임포트 UID ${impUid}의 결제가 취소 상태가 아닙니다.`);
        throw new Error('결제가 취소 상태가 아닙니다.');
      }

      payOrder.order_state = 'CANCEL';
      payOrder.cancel_amount = paymentInfo.cancel_amount;
      payOrder.update_dt = new Date();
      await queryRunner.manager.save(payOrder);

      // 추가적인 취소 처리 로직
      await this.contractService.handleCancelledPayment(
        queryRunner,
        payOrder.pay_service_id,
        payOrder.member_id,
      );

      await queryRunner.commitTransaction();
      this.logger.warn(`주문 ${payOrder.merchant_uid}의 취소된 결제 처리 완료`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`취소된 결제 처리 중 오류 발생: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException('결제 취소 처리 중 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  private async findProductById(productId: number): Promise<PayServiceEntity> {
    const product = await this.payServiceRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    return product;
  }

  private async executeInTransaction<T>(
    work: (queryRunner: any) => Promise<T>,
    impUid?: string,
    merchantUid?: string,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (impUid && merchantUid) {
        await this.iamPortService.cancelPayment(impUid, merchantUid, error.message, error);
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async inquireAndProcessPayment(merchantUid: string): Promise<PayOrderEntity> {
    const payOrder = await this.payOrderRepository.findOne({
      where: { merchant_uid: merchantUid },
    });

    if (!payOrder) {
      throw new NotFoundException(`주문을 찾을 수 없습니다: ${merchantUid}`);
    }

    if (payOrder.order_state !== 'PENDING') {
      throw new BadRequestException(`이미 처리된 주문입니다: ${merchantUid}`);
    }

    const paymentInfo = await this.iamPortService.getPaymentInfo(payOrder.imp_uid);

    if (paymentInfo.status === 'paid') {
      // 결제가 완료되었지만 처리되지 않은 경우
      await this.verifyAndProcessPayment(payOrder.imp_uid, merchantUid);
      return this.payOrderRepository.findOne({
        where: { merchant_uid: merchantUid },
      });
    } else if (paymentInfo.status === 'ready') {
      // 가상계좌 발급 등 결제 진행 중인 경우
      return payOrder;
    } else {
      // 결제 실패 또는 취소된 경우
      await this.handleFailedPayment(payOrder, payOrder.imp_uid);
      return this.payOrderRepository.findOne({
        where: { merchant_uid: merchantUid },
      });
    }
  }
}
