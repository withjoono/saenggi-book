import { IsOptional, IsString } from 'class-validator';

export class UpdateOfficerProfileResponseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  university?: string;

  @IsString()
  @IsOptional()
  education?: string;
}
