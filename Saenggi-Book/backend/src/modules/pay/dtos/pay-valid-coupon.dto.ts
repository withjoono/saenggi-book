import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PayValidCouponDto {
  // snake_case (기존)
  @IsString()
  @IsOptional()
  coupon_number?: string;

  @IsString()
  @IsOptional()
  product_id?: string;

  // camelCase (프론트엔드 호환)
  @IsString()
  @IsOptional()
  couponNumber?: string;

  @IsString()
  @IsOptional()
  productId?: string;
}

export class PayValidCouponResponseDto {
  @IsNumber()
  @IsNotEmpty()
  discount_price: number;

  @IsString()
  @IsNotEmpty()
  coupon_info: string;
}
