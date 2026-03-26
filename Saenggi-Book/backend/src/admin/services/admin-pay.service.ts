// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { AdminPayOrderResponseDto, AdminPayOrderSearchQueryDto } from '../dtos/admin-pay-order.dto';

@Injectable()
export class AdminPaymentService {
  constructor(  ) {}

  // 모든 주문 조회(admin)
  async getAllOrders(
    searchQueryDto: AdminPayOrderSearchQueryDto,
  ): Promise<AdminPayOrderResponseDto> {
    const { orderState, searchWord, page = 1, pageSize = 10 } = searchQueryDto;

    const queryBuilder = this.payOrderRepository
      .createQueryBuilder('pay_order')
      .leftJoin('pay_order.member', 'member')
      .addSelect(['member.nickname', 'member.email']); // 유저 이름과 이메일에 별칭 추가

    if (orderState) {
      queryBuilder.andWhere('pay_order.order_state = :orderState', {
        orderState,
      });
    }

    if (searchWord) {
      queryBuilder.andWhere('(member.nickname LIKE :searchWord OR member.email LIKE :searchWord)', {
        searchWord: `%${searchWord}%`,
      });
    }

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    queryBuilder.orderBy('pay_order.create_dt', 'DESC');

    const [list, totalCount] = await queryBuilder.getManyAndCount();
    return {
      list,
      totalCount,
    };
  }
}
