// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminStatisticService {
  constructor(  ) {}

  async getRecentSignUps(): Promise<Record<string, number>> {
    const result = await this.memberRepository
      .createQueryBuilder('member')
      .select('DATE(member.create_dt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('member.create_dt IS NOT NULL')
      .groupBy('DATE(member.create_dt)')
      .orderBy('DATE(member.create_dt)', 'ASC')
      .getRawMany();

    const signUpTrends: Record<string, number> = {};
    result.forEach((record) => {
      signUpTrends[record.date] = parseInt(record.count, 10);
    });

    return signUpTrends;
  }

  async getRecentPayments(): Promise<
    Array<{
      name: string;
      email: string;
      amount: number;
      date: string;
      serviceName: string;
    }>
  > {
    const recentPayments = await this.payOrderRepository
      .createQueryBuilder('pay_order')
      .leftJoinAndSelect('pay_order.member', 'member')
      .leftJoinAndSelect('pay_order.pay_service', 'pay_service')
      .select([
        'member.nickname AS name',
        'member.email AS email',
        'pay_order.paid_amount AS amount',
        'pay_order.create_dt AS date',
        'pay_service.product_nm AS serviceName',
      ])
      .where('pay_order.paid_amount > 0')
      .andWhere('pay_order.order_state = :state', { state: 'COMPLETE' })
      .orderBy('pay_order.create_dt', 'DESC')
      .limit(20)
      .getRawMany();

    return recentPayments.map((payment) => ({
      name: payment.name,
      email: payment.email,
      amount: parseFloat(payment.amount),
      date: payment.date,
      serviceName: payment.serviceName,
    }));
  }

  async getDailySales(): Promise<Record<string, number>> {
    const result = await this.payOrderRepository
      .createQueryBuilder('pay_order')
      .select('DATE(pay_order.create_dt)', 'date')
      .addSelect('SUM(pay_order.paid_amount)', 'total_sales')
      .where('pay_order.paid_amount > 0')
      .andWhere('pay_order.order_state = :state', { state: 'COMPLETE' })
      .groupBy('DATE(pay_order.create_dt)')
      .orderBy('DATE(pay_order.create_dt)', 'ASC')
      .getRawMany();

    const dailySales: Record<string, number> = {};
    result.forEach((record) => {
      dailySales[record.date] = parseFloat(record.total_sales);
    });

    return dailySales;
  }

  async getActiveContractCount(): Promise<number> {
    const activeContractCount = await this.payContractRepository
      .createQueryBuilder('pay_contract')
      .where('pay_contract.contract_period_end_dt > NOW()')
      .andWhere('pay_contract.contract_use = :use', { use: 1 })
      .andWhere('pay_contract.product_code != :ticket', { ticket: 'TICKET' })
      .getCount();

    return activeContractCount;
  }
}
