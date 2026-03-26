// @ts-nocheck
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdmissionCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}

export class UpdateAdmissionCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}
