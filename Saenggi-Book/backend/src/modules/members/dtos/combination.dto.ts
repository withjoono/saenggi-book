import { IsString, IsArray, ArrayMaxSize, IsNumber } from 'class-validator';

export class CreateMemberRecruitmentUnitCombinationDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMaxSize(6)
  @IsNumber({}, { each: true })
  recruitment_unit_ids: number[];
}

export class UpdateMemberRecruitmentUnitCombinationDto {
  @IsString()
  name: string;
}

export class MemberRecruitmentUnitCombinationResponseDto {
  id: number;

  name: string;

  recruitment_units: {
    id: number;
    name: string;
  }[];

  created_at: Date;

  updated_at: Date;
}
