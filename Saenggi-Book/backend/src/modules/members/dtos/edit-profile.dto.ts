import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class EditProfileDto {
  @IsOptional()
  @IsInt()
  hst_type_id?: number | null;

  @IsOptional()
  @IsInt()
  major?: number;

  @IsOptional()
  @IsBoolean()
  ck_sms_agree?: boolean;

  @IsOptional()
  @IsString()
  graduate_year?: string;
}
