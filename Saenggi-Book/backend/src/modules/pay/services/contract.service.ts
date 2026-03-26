// @ts-nocheck
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ContractService {
  constructor(    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async handleProductSpecificLogic(
    queryRunner: any,
    productId: number,
    memberId: number,
    orderId: number,
  ) {
    this.logger.warn(
      `상품별 로직 처리 시작: 상품 ID ${productId}, 회원 ID ${memberId}, 주문 ID ${orderId}`,
    );
    const _productId = Number(productId);
    const service = await this.findProductById(_productId);

    // 상품 타입 코드 기반으로 처리
    const productTypeCode = service.product_type_code;

    switch (productTypeCode) {
      case 'FIXEDTERM': // 기간권 (정시, 수시 기간권 등)
        await this.contractFixedTermService(queryRunner, service, memberId, orderId);
        break;
      case 'TICKET': // 이용권 (사정관 이용권 등)
        await this.contractOfficerTicket(queryRunner, service, memberId, orderId);
        break;
      case 'PACKAGE': // 패키지 (기간권 + 이용권)
        await this.contractSusiPackage(queryRunner, service, memberId, orderId);
        break;
      default:
        // 타입 코드가 없거나 알 수 없는 경우, 기간권으로 처리
        this.logger.warn(`알 수 없는 상품 타입: ${productTypeCode}, 기간권으로 처리합니다.`);
        await this.contractFixedTermService(queryRunner, service, memberId, orderId);
    }
    this.logger.warn(`상품별 로직 처리 완료: 상품 ID ${productId}`);
  }

  private async findProductById(productId: number): Promise<PayServiceEntity> {
    const product = await this.payServiceRepository.findOne({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    this.logger.warn(`상품 조회 완료: 상품 ID ${productId}`);
    return product;
  }

  // 기간권 계약
  private async contractFixedTermService(
    queryRunner: any,
    service: PayServiceEntity,
    memberId: number,
    orderId: number,
  ) {
    // service.term이 null인 경우 기본 1개월 계약
    let endDate: Date;
    if (service.term) {
      endDate = new Date(service.term);
    } else {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newContract = this.createPayContractEntity(service, memberId, orderId, endDate);
    await queryRunner.manager.save(PayContractEntity, newContract);
    this.logger.warn(
      `기간권 계약 완료: 회원 ID ${memberId}, 상품 ID ${service.id}, 종료일 ${endDate.toISOString()}`,
    );
  }

  // 사정관 이용권 계약
  private async contractOfficerTicket(
    queryRunner: any,
    service: PayServiceEntity,
    memberId: number,
    orderId: number,
  ) {
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100);

    const newContract = this.createPayContractEntity(service, memberId, orderId, endDate);
    await queryRunner.manager.save(PayContractEntity, newContract);

    await this.issueOfficerTicket(queryRunner, memberId);
    this.logger.warn(`사정관 이용권 계약 완료: 회원 ID ${memberId}, 상품 ID ${service.id}`);
  }

  // 수시 패키지 계약 (기간권 + 이용권)
  private async contractSusiPackage(
    queryRunner: any,
    service: PayServiceEntity,
    memberId: number,
    orderId: number,
  ) {
    // service.term이 null인 경우 기본 1개월 계약
    let endDate: Date;
    if (service.term) {
      endDate = new Date(service.term);
    } else {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newContract = this.createPayContractEntity(service, memberId, orderId, endDate);
    await queryRunner.manager.save(PayContractEntity, newContract);

    await this.issueOfficerTicket(queryRunner, memberId);
    this.logger.warn(`수시 패키지 계약 완료: 회원 ID ${memberId}, 상품 ID ${service.id}`);
  }

  // 수시 컨설팅 계약 (기간권 + 이용권)
  private async contractSusiConsulting(
    queryRunner: any,
    service: PayServiceEntity,
    memberId: number,
    orderId: number,
  ) {
    // service.term이 null인 경우 기본 1개월 계약
    let endDate: Date;
    if (service.term) {
      endDate = new Date(service.term);
    } else {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newContract = this.createPayContractEntity(service, memberId, orderId, endDate);
    await queryRunner.manager.save(PayContractEntity, newContract);

    await this.issueOfficerTicket(queryRunner, memberId);
    this.logger.warn(`수시 컨설팅 계약 완료: 회원 ID ${memberId}, 상품 ID ${service.id}`);
  }

  // 계약객체 생성
  private createPayContractEntity(
    service: PayServiceEntity,
    memberId: number,
    orderId: number,
    endDate: Date,
  ): PayContractEntity {
    const today = new Date();

    const newContract = new PayContractEntity();
    newContract.contract_period_end_dt = endDate;
    newContract.contract_start_dt = today;
    newContract.contract_use = 1;
    newContract.create_dt = today;
    newContract.product_code = service.product_type_code;
    newContract.regular_contract_fl = false;
    newContract.update_dt = today;
    newContract.member_id = memberId;
    newContract.order_id = orderId;

    return newContract;
  }

  // 이용권 발급
  private async issueOfficerTicket(queryRunner: any, memberId: number) {
    let officerTicket = await queryRunner.manager.findOne(OfficerTicketEntity, {
      where: { member_id: memberId },
    });

    if (officerTicket) {
      officerTicket.ticket_count += 1;
      this.logger.warn(
        `기존 이용권 업데이트: 회원 ID ${memberId}, 새 이용권 수 ${officerTicket.ticket_count}`,
      );
    } else {
      officerTicket = new OfficerTicketEntity();
      officerTicket.member_id = memberId;
      officerTicket.ticket_count = 1;
      this.logger.warn(`새 이용권 생성: 회원 ID ${memberId}`);
    }

    await queryRunner.manager.save(OfficerTicketEntity, officerTicket);
    this.logger.warn(`이용권 발급 완료: 회원 ID ${memberId}`);
  }

  // 결제 실패 후처리
  async handleFailedPayment(
    queryRunner: any,
    payServiceId: number,
    memberId: number,
  ): Promise<void> {
    this.logger.warn(`결제 실패 처리 시작: 회원 ID ${memberId}, 상품 ID ${payServiceId}`);
    try {
      const payOrder = await queryRunner.manager.findOne(PayOrderEntity, {
        where: {
          pay_service_id: payServiceId,
          member_id: memberId,
        },
      });

      if (payOrder) {
        payOrder.order_state = 'FAILED';
        payOrder.update_dt = new Date();
        await queryRunner.manager.save(PayOrderEntity, payOrder);
        this.logger.warn(`주문 상태 업데이트: 주문 ID ${payOrder.id}, 새 상태 'FAILED'`);
      }

      // 추가적인 실패 처리 로직
      // 예: 실패 알림 전송, 통계 업데이트 등

      // 계약 취소 로직
      await this.cancelContract(queryRunner, payOrder.id, memberId);

      this.logger.warn(`결제 실패 처리 완료: 회원 ID ${memberId}, 상품 ID ${payServiceId}`);
    } catch (error) {
      this.logger.error(`결제 실패 처리 중 오류 발생: ${error.message}`, {
        stack: error.stack,
      });
      throw new BadRequestException('결제 실패 처리 중 오류가 발생했습니다.');
    }
  }

  // 완료된 결제 건 취소 처리
  async handleCancelledPayment(
    queryRunner: any,
    payOrderId: number,
    memberId: number,
  ): Promise<void> {
    this.logger.warn(`결제 취소 처리 시작: 회원 ID ${memberId}, 주문 ID ${payOrderId}`);
    try {
      // const payOrder = await queryRunner.manager.findOne(PayOrderEntity, {
      //   where: {
      //     pay_service_id: payServiceId,
      //     member_id: memberId,
      //     order_state: 'COMPLETE',
      //   },
      // });

      // if (payOrder) {
      //   payOrder.order_state = 'CANCEL';
      //   payOrder.update_dt = new Date();
      //   await queryRunner.manager.save(PayOrderEntity, payOrder);
      //   this.logger.warn(
      //     `주문 상태 업데이트: 주문 ID ${payOrder.id}, 새 상태 'CANCEL'`,
      //   );

      //   // 계약 취소 로직
      //   await this.cancelContract(queryRunner, payOrder.id, memberId);
      // }

      // 계약 취소 로직
      await this.cancelContract(queryRunner, payOrderId, memberId);
      this.logger.warn(`결제 취소 처리 완료: 회원 ID ${memberId}, 주문 ID ${payOrderId}`);
    } catch (error) {
      this.logger.error(`결제 취소 처리 중 오류 발생: ${error.message}`, {
        stack: error.stack,
      });
      throw new BadRequestException('결제 취소 처리 중 오류가 발생했습니다.');
    }
  }

  private async cancelContract(queryRunner: any, orderId: number, memberId: number): Promise<void> {
    const contract = await queryRunner.manager.findOne(PayContractEntity, {
      where: { order_id: orderId, member_id: memberId },
    });

    if (contract) {
      contract.contract_use = 0;
      contract.update_dt = new Date();
      await queryRunner.manager.save(PayContractEntity, contract);
      this.logger.warn(`계약 상태 업데이트: 계약 ID ${contract.id}, 새 상태 '사용안함'`);

      // 이용권 취소 로직 (필요한 경우)
      if (contract.product_code === 'TICKET' || contract.product_code === 'PACKAGE') {
        await this.cancelOfficerTicket(queryRunner, memberId);
      }
    }
    this.logger.warn(`계약 취소 완료: 주문 ID ${orderId}, 회원 ID ${memberId}`);
  }

  private async cancelOfficerTicket(queryRunner: any, memberId: number): Promise<void> {
    const officerTicket = await queryRunner.manager.findOne(OfficerTicketEntity, {
      where: { member_id: memberId },
    });

    if (officerTicket && officerTicket.ticket_count > 0) {
      officerTicket.ticket_count -= 1;
      await queryRunner.manager.save(OfficerTicketEntity, officerTicket);
      this.logger.warn(
        `이용권 수 감소: 회원 ID ${memberId}, 새 이용권 수 ${officerTicket.ticket_count}`,
      );
    }
    this.logger.warn(`이용권 취소 완료: 회원 ID ${memberId}`);
  }
}
