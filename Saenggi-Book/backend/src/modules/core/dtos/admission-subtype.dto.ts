// @ts-nocheck
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateAdmissionSubtypeDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateAdmissionSubtypeDto {
  @IsOptional()
  @IsString()
  name?: string;
}
