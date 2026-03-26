import { IsString, IsArray, ArrayMaxSize, IsNumber } from 'class-validator';

export class CreateMemberRegularCombinationDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true })
  ids: number[];
}

export class UpdateMemberRegularCombinationDto {
  @IsString()
  name: string;
}

export class MemberRegularCombinationResponseDto {
  id: number;

  name: string;

  regular_admissions: {
    id: number;
    name: string;
  }[];

  created_at: Date;

  updated_at: Date;
}
