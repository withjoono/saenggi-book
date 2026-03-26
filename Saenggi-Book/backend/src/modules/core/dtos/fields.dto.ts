// @ts-nocheck
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateMajorFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}

export class UpdateMajorFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}

export class CreateMidFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  majorFieldId: number;
}

export class UpdateMidFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  majorFieldId: number;
}

export class CreateMinorFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  midFieldId: number;
}

export class UpdateMinorFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  midFieldId: number;
}

export class CreateGeneralFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}

export class UpdateGeneralFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}
