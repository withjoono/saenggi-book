// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminSearchDto, CreateServiceDto } from '../dtos/admin-product.dto';
import { CreateCouponDto, UpdateCouponDto } from '../dtos/admin-coupon.dto';

@Injectable()
export class AdminProductManagementService {
  constructor(  ) {}

  // ==================== 상품 (Product) ====================

  // 모든 상품 코드 조회
  async findAllProductCodes(): Promise<PayProductEntity[]> {
    return this.productRepository.find();
  }

  // 상품 목록 조회 (페이징/검색)
  async findProducts(searchDto: AdminSearchDto) {
    const { searchWord, page = 0, pageSize = 10 } = searchDto;

    const whereCondition = searchWord ? { productName: Like(`%${searchWord}%`) } : {};

    const [list, totalCount] = await this.productRepository.findAndCount({
      where: whereCondition,
      skip: page,
      take: pageSize,
    });

    return { list, totalCount };
  }

  // ==================== 서비스 (PayService) ====================

  // 서비스 목록 조회
  async findServices(searchDto: AdminSearchDto) {
    const { searchWord, productCateCode, page, pageSize } = searchDto;

    const queryBuilder = this.dataSource
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
        's.delete_flag as "deleteFlag"',
        's.create_dt as "createDt"',
        's.update_dt as "updateDt"',
      ])
      .from(PayServiceEntity, 's')
      .where('s.delete_flag = :deleteFlag', { deleteFlag: 0 });

    // 카테고리 필터
    if (productCateCode) {
      queryBuilder.andWhere('s.product_cate_code = :productCateCode', {
        productCateCode,
      });
    }

    // 검색어 필터
    if (searchWord) {
      queryBuilder.andWhere('s.product_nm LIKE :searchWord', {
        searchWord: `%${searchWord}%`,
      });
    }

    const totalCount = await queryBuilder.getCount();

    // 페이지네이션: page는 1부터 시작 (프론트엔드 규칙)
    if (page !== undefined && pageSize !== undefined) {
      const offset = page > 0 ? (page - 1) * pageSize : 0;
      queryBuilder.offset(offset).limit(pageSize);
    }

    // ID 기준 정렬 추가
    queryBuilder.orderBy('s.id', 'ASC');

    const list = await queryBuilder.getRawMany();

    return { list, totalCount };
  }

  // 서비스 단건 조회 (상품 목록 포함)
  async findServiceById(serviceId: number) {
    const rawServiceInfo = await this.dataSource
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
        's.delete_flag as "deleteFlag"',
        's.create_dt as "createDt"',
        's.update_dt as "updateDt"',
      ])
      .from(PayServiceEntity, 's')
      .where('s.id = :serviceId', { serviceId })
      .getRawOne();

    if (!rawServiceInfo) {
      throw new NotFoundException('서비스를 찾을 수 없습니다.');
    }

    // 서비스에 연결된 상품 목록 조회
    const productionInfo = await this.dataSource
      .createQueryBuilder()
      .select([
        'p.id as id',
        'p.product_code as "productCode"',
        'p.product_type as "productType"',
        'p.product_name as "productName"',
      ])
      .from(PayProductEntity, 'p')
      .innerJoin(PayServiceProductEntity, 'sp', 'p.id = sp.pay_product_id')
      .where('sp.pay_service_id = :serviceId', { serviceId })
      .getRawMany();

    return { serviceInfo: rawServiceInfo, productionInfo };
  }

  // 서비스 등록/수정
  async saveService(dto: CreateServiceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let savedService: PayServiceEntity;

      if (dto.id) {
        // 수정
        const existingService = await this.payServiceRepository.findOne({
          where: { id: dto.id },
        });

        if (!existingService) {
          throw new NotFoundException('서비스를 찾을 수 없습니다.');
        }

        // 엔티티 업데이트
        existingService.product_nm = dto.productNm;
        existingService.product_price = dto.productPrice;
        existingService.term = dto.term || existingService.term;
        existingService.product_payment_type =
          dto.productPaymentType || existingService.product_payment_type;
        existingService.explain_comment = dto.explainComment || existingService.explain_comment;
        existingService.refund_policy = dto.refundPolicy || existingService.refund_policy;
        existingService.promotion_discount =
          dto.promotionDiscount ?? existingService.promotion_discount;
        existingService.product_image = dto.productImage || existingService.product_image;
        existingService.product_cate_code =
          dto.productCateCode || existingService.product_cate_code;
        existingService.product_type_code =
          dto.productTypeCode || existingService.product_type_code;
        existingService.service_range_code =
          dto.serviceRangeCode || existingService.service_range_code;
        existingService.available_count = dto.availableCount ?? existingService.available_count;
        existingService.update_dt = new Date();

        savedService = await queryRunner.manager.save(PayServiceEntity, existingService);

        // 기존 상품 연결 삭제
        await queryRunner.manager.delete(PayServiceProductEntity, {
          payServiceId: dto.id,
        });
      } else {
        // 신규 생성
        const newService = this.payServiceRepository.create({
          product_nm: dto.productNm,
          product_price: dto.productPrice,
          term: dto.term,
          product_payment_type: dto.productPaymentType,
          explain_comment: dto.explainComment,
          refund_policy: dto.refundPolicy,
          promotion_discount: dto.promotionDiscount || 0,
          product_image: dto.productImage,
          product_cate_code: dto.productCateCode,
          product_type_code: dto.productTypeCode,
          service_range_code: dto.serviceRangeCode,
          available_count: dto.availableCount,
          delete_flag: 0,
          create_dt: new Date(),
          update_dt: new Date(),
        });

        savedService = await queryRunner.manager.save(PayServiceEntity, newService);
      }

      // 상품 연결 저장
      if (dto.productListInfo && dto.productListInfo.length > 0) {
        for (const product of dto.productListInfo) {
          // id 또는 payProductId 둘 다 지원
          const productId = product.payProductId || product.id;
          if (productId) {
            const serviceProduct = this.serviceProductRepository.create({
              payServiceId: savedService.id,
              payProductId: productId,
            });
            await queryRunner.manager.save(PayServiceProductEntity, serviceProduct);
          }
        }
      }

      await queryRunner.commitTransaction();
      return savedService;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 서비스 삭제 (soft delete)
  async deleteService(serviceId: number) {
    const service = await this.payServiceRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('서비스를 찾을 수 없습니다.');
    }

    service.delete_flag = 1; // soft delete
    service.update_dt = new Date();
    await this.payServiceRepository.save(service);
  }

  // ==================== 쿠폰 (Coupon) ====================

  // 쿠폰 목록 조회 (서비스 정보 포함)
  async findCoupons(searchDto: AdminSearchDto) {
    const { searchWord, page = 0, pageSize = 10 } = searchDto;

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        'c.id as id',
        'c.coupon_number as "couponNumber"',
        'c.discount_info as "discountInfo"',
        'c.discount_value as "discountValue"',
        'c.number_of_available as "numberOfAvailable"',
        'c.pay_service_id as "payServiceId"',
        's.product_nm as "productNm"',
        's.product_price as "productPrice"',
        's.product_payment_type as "productPaymentType"',
        's.promotion_discount as "promotionDiscount"',
        's.delete_flag as "deleteFlag"',
      ])
      .from(PayCouponEntity, 'c')
      .leftJoin(PayServiceEntity, 's', 'c.pay_service_id = s.id');

    if (searchWord) {
      queryBuilder.where('s.product_nm LIKE :searchWord', {
        searchWord: `%${searchWord}%`,
      });
    }

    const totalCount = await queryBuilder.getCount();

    // 페이지네이션: page는 1부터 시작
    const offset = page > 0 ? (page - 1) * pageSize : 0;
    const list = await queryBuilder.offset(offset).limit(pageSize).getRawMany();

    return { list, totalCount };
  }

  // 쿠폰 등록
  async createCoupon(dto: CreateCouponDto) {
    const coupon = this.couponRepository.create({
      coupon_number: dto.couponNumber || this.generateCouponNumber(),
      discount_info: dto.discountInfo,
      discount_value: dto.discountValue,
      number_of_available: dto.numberOfAvailable,
      pay_service_id: dto.payServiceId || null,
    });

    return this.couponRepository.save(coupon);
  }

  // 쿠폰 수정
  async updateCoupon(id: number, dto: UpdateCouponDto) {
    // 서비스 존재 여부 확인
    const service = await this.payServiceRepository.findOne({
      where: { id: dto.payServiceId },
    });

    if (!service) {
      throw new NotFoundException('서비스를 찾을 수 없습니다.');
    }

    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('쿠폰을 찾을 수 없습니다.');
    }

    // 쿠폰번호는 수정 불가, 나머지만 수정
    coupon.discount_info = dto.discountInfo;
    coupon.discount_value = dto.discountValue;
    coupon.number_of_available = dto.numberOfAvailable;
    coupon.pay_service_id = dto.payServiceId;

    return this.couponRepository.save(coupon);
  }

  // 쿠폰 다중 삭제 (Hard delete)
  async deleteCoupons(ids: number[]) {
    await this.couponRepository.delete({ id: In(ids) });
  }

  // 25자리 쿠폰번호 생성 (대문자 + 숫자)
  private generateCouponNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 25; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
