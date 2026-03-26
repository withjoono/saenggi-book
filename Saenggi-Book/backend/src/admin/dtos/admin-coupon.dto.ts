import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

// 쿠폰 DTO
export class CouponDto {
  @ApiProperty({ description: '쿠폰 ID' })
  id: number;

  @ApiProperty({ description: '쿠폰번호' })
  couponNumber: string;

  @ApiProperty({ description: '할인 정보' })
  discountInfo: string;

  @ApiProperty({ description: '할인율 (%)' })
  discountValue: number;

  @ApiProperty({ description: '사용 가능 횟수' })
  numberOfAvailable: number;

  @ApiProperty({ description: '적용 서비스 ID' })
  payServiceId: number;

  // 조인된 서비스 정보
  @ApiPropertyOptional({ description: '서비스명' })
  productNm?: string;

  @ApiPropertyOptional({ description: '서비스 가격' })
  productPrice?: string;

  @ApiPropertyOptional({ description: '결제 방식' })
  productPaymentType?: string;

  @ApiPropertyOptional({ description: '프로모션 할인율' })
  promotionDiscount?: number;

  @ApiPropertyOptional({ description: '삭제 여부' })
  deleteFlag?: number;
}

export class CreateCouponDto {
  @ApiPropertyOptional({
    description: '쿠폰번호 (미입력시 자동생성)',
    example: 'WELCOME2024',
  })
  @IsString()
  @IsOptional()
  couponNumber?: string;

  @ApiProperty({ description: '할인 정보', example: '오픈할인기념' })
  @IsString()
  discountInfo: string;

  @ApiProperty({ description: '할인율 (%)', example: 50 })
  @IsNumber()
  discountValue: number;

  @ApiProperty({ description: '사용 가능 횟수', example: 100 })
  @IsNumber()
  numberOfAvailable: number;

  @ApiPropertyOptional({ description: '적용 서비스 ID (미입력시 전체 적용)', example: 1 })
  @IsNumber()
  @IsOptional()
  payServiceId?: number;

  @ApiPropertyOptional({
    description: '할인 타입 (프론트엔드 관리용)',
    example: 'PERCENT',
    enum: ['PERCENT', 'AMOUNT'],
  })
  @IsString()
  @IsOptional()
  discountType?: string;
}

export class UpdateCouponDto {
  @ApiProperty({ description: '쿠폰 ID' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: '할인 정보' })
  @IsString()
  discountInfo: string;

  @ApiProperty({ description: '할인율 (%)' })
  @IsNumber()
  discountValue: number;

  @ApiProperty({ description: '사용 가능 횟수' })
  @IsNumber()
  numberOfAvailable: number;

  @ApiProperty({ description: '적용 서비스 ID' })
  @IsNumber()
  payServiceId: number;
}

export class DeleteCouponsDto {
  @ApiProperty({ description: '삭제할 쿠폰 ID 목록', example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

export class CouponListResponseDto {
  @ApiProperty({ type: [CouponDto] })
  list: CouponDto[];

  @ApiProperty()
  totalCount: number;
}
