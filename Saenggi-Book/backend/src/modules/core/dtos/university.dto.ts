// @ts-nocheck
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateUniversityDto {
  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEnum(['국립', '사립', ''])
  establishment_type: '국립' | '사립' | '';
}

export class UpdateUniversityDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(['국립', '사립', ''])
  establishment_type?: '국립' | '사립' | '';
}
