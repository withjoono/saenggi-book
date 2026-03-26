import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PayPreRegisterDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  couponNumber?: string;
}
