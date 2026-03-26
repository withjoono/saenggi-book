import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PayVerifyDto {
  @IsString()
  @IsNotEmpty()
  imp_uid: string;

  @IsString()
  @IsNotEmpty()
  merchant_uid: string;

  @IsString()
  @IsOptional()
  coupon_number?: string;
}
