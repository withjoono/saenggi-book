// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreService {
  constructor(  ) {}

  async findAll(): Promise<PayServiceEntity[]> {
    return await this.payServiceRepository.find();
  }

  async findOne(id: number): Promise<PayServiceEntity> {
    return await this.payServiceRepository.findOne({ where: { id } });
  }

  // 판매중인 상품 하나 조회 (camelCase 응답)
  async findOneAvailable(id: number) {
    return await this.dataSource
      .createQueryBuilder()
      .select([
        's.id as id',
        's.product_nm as "productNm"',
        's.product_price as "productPrice"',
        's.term as term',
        's.product_payment_type as "productPaymentType"',
        's.explain_comment as "explainComment"',
        's.refund_policy as "refundPolicy"',
        's.promotion_discount as "promotionDiscount"',
        's.product_image as "productImage"',
        's.product_cate_code as "productCateCode"',
        's.product_type_code as "productTypeCode"',
        's.service_range_code as "serviceRangeCode"',
        's.available_count as "availableCount"',
      ])
      .from(PayServiceEntity, 's')
      .where('s.id = :id', { id })
      .andWhere('s.delete_flag = :deleteFlag', { deleteFlag: 0 })
      .getRawOne();
  }

  // 판매중인 상품 조회 (camelCase 응답)
  async findAvailable() {
    return await this.dataSource
      .createQueryBuilder()
      .select([
        's.id as id',
        's.product_nm as "productNm"',
        's.product_price as "productPrice"',
        's.term as term',
        's.product_payment_type as "productPaymentType"',
        's.explain_comment as "explainComment"',
        's.refund_policy as "refundPolicy"',
        's.promotion_discount as "promotionDiscount"',
        's.product_image as "productImage"',
        's.product_cate_code as "productCateCode"',
        's.product_type_code as "productTypeCode"',
        's.service_range_code as "serviceRangeCode"',
        's.available_count as "availableCount"',
      ])
      .from(PayServiceEntity, 's')
      .where('s.delete_flag = :deleteFlag', { deleteFlag: 0 })
      .getRawMany();
  }
}
